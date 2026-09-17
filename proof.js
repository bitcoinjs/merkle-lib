// https://bitcointalk.org/index.php?topic=403231.msg9054025#msg9054025
function treeNodeCount (leafCount) {
  var count = 1
  for (var i = leafCount; i > 1; i = (i + 1) >> 1) count += i
  return count
}

function treeWidth (n, h) {
  return (n + (1 << h) - 1) >> h
}

function makeProof (tree, leaf) {
  var index = tree.indexOf(leaf)

  // does the leaf node even exist [in the tree]?
  if (index === -1) return null

  var n = tree.length
  var nodes = []

  // does the far right leaf bypass a layer?
  // determine hashable node count...
  var z = treeWidth(n, 1)
  while (z > 0) {
    if (treeNodeCount(z) === n) break
    --z
  }

  // XXX: not reach-able (AFAIK) but handled anyway
  if (z === 0) throw new Error('Unknown solution')

  var height = 0
  var i = 0
  while (i < n - 1) {
    var layerWidth = treeWidth(z, height)
    ++height

    var odd = index % 2
    if (odd) --index

    var offset = i + index
    var left = tree[offset]
    var right = index === (layerWidth - 1) ? left : tree[offset + 1]

    if (i > 0) {
      nodes.push(odd ? left : null)
      nodes.push(odd ? null : right)
    } else {
      nodes.push(left)
      nodes.push(right)
    }

    index = (index / 2) | 0
    i += layerWidth
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

function verifyAgainstRoot (proof, expectedRoot, expectedLeaf, digestFn) {
  if (!Array.isArray(proof) || proof.length === 0 || proof.length % 2 === 0) return false
  if (!Buffer.isBuffer(expectedRoot) || !Buffer.isBuffer(expectedLeaf) || typeof digestFn !== 'function') return false

  var root = proof[proof.length - 1]
  if (!Buffer.isBuffer(root) || !root.equals(expectedRoot)) return false
  if (proof.length === 1) return root.equals(expectedLeaf)
  if (!Buffer.isBuffer(proof[0]) || !Buffer.isBuffer(proof[1])) return false
  if (!proof[0].equals(expectedLeaf) && !proof[1].equals(expectedLeaf)) return false

  // Later pairs replace exactly one side with the hash reconstructed so far.
  for (var i = 2; i < proof.length - 1; i += 2) {
    var left = proof[i]
    var right = proof[i + 1]
    if (!((left === null && Buffer.isBuffer(right)) || (right === null && Buffer.isBuffer(left)))) return false
  }

  return verify(proof, digestFn)
}

module.exports = makeProof
module.exports.verify = verify
module.exports.verifyAgainstRoot = verifyAgainstRoot
