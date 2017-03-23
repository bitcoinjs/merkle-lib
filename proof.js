function width (n, h) {
  return (n + (1 << h) - 1) >> h
}

function mton (m) {
  var n = 0
  for (var i = m; i > 1; i = (i + 1) >> 1) n += i
  return n + 1
}

function makeProof (tree, leaf) {
  var index = tree.indexOf(leaf)

  // does the leaf node even exist [in the tree]?
  if (index === -1) return null

  var n = tree.length
  var nodes = []

  // does the far right leaf bypass a layer?
  var z = width(n, 1)
  if (mton(z) !== n) --z

  var height = 0
  var i = 0
  while (i < n - 1) {
    var m = width(z, height)
    ++height

    var odd = index % 2
    if (odd) --index

    var offset = i + index
    var left = tree[offset]
    var right = index === (m - 1) ? left : tree[offset + 1]

    if (i > 0) {
      nodes.push(odd ? left : null)
      nodes.push(odd ? null : right)
    } else {
      nodes.push(left)
      nodes.push(right)
    }

    index = (index / 2) | 0
    i += m
  }

  nodes.push(tree[n - 1])
  return nodes
}

function verify (proof, digestFn) {
  var root = proof[proof.length - 1]
  var hash = root

  for (var i = 0; i < proof.length - 1; i += 2) {
    var left = proof[i] || hash
    var right = proof[i + 1] || hash
    var data = Buffer.concat([left, right])
    hash = digestFn(data)
  }

  return hash.equals(root)
}

module.exports = makeProof
module.exports.verify = verify
