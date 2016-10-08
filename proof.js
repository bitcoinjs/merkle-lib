var utils = require('./utils')

function proof (list, leaf) {
  var index = list.indexOf(leaf)

  // does the leaf node even exist?
  if (index === -1) return null

  var n = list.length
  var nodes = []

  var i = 0
  while (i < n - 1) {
    var m = utils.ntom(n - i)

    var odd = index % 2
    if (odd) --index

    var offset = i + index
    var left = list[offset]
    var right = index === (m - 1) ? left : list[offset + 1]

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

  nodes.push(list[n - 1])
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

proof.verify = verify
module.exports = proof
