var utils = require('./utils')

// TODO: change to constant-time verification via omitting parent hashes... this would also resolve the TODO in verify by
// allowing you to verify which nodes are parents vs auxillary for proofing

function proof (list, leaf) {
  var index = list.indexOf(leaf)

  // no proof exists
  if (index === -1) return null

  var n = list.length
  var nodes = []

  var y = 0
  while (n > 1) {
    index = index - (index % 2)

    var m = utils.ntom(n)
    var offset = y + index
    var left = list[offset]
    var right = index === (m - 1) ? left : list[offset + 1]

    nodes.push(left)
    nodes.push(right)
    index = (index / 2) | 0

    y += m
    n -= m
  }

  nodes.push(list[list.length - 1])
  return nodes
}

function verify (proof, digestFn) {
  for (var i = 0; i < proof.length - 1; i += 2) {
    var left = proof[i]
    var right = proof[i + 1]
    var expectedl = proof[i + 2]
    var expectedr = proof[i + 3]

    var data = Buffer.concat([left, right])
    var actual = digestFn(data)

    // TODO: boo
    if (!actual.equals(expectedl) && !actual.equals(expectedr)) return false
  }

  return true
}

proof.verify = verify
module.exports = proof
