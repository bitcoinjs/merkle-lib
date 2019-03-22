var crypto = require('crypto')
var fixtures = require('./fixtures')
var merkle = require('../')
var merkleProof = require('../proof')
var tape = require('tape')

tape('proofs, for each fixture', function (t) {
  fixtures.forEach(function (f) {
    function digest (x) {
      return crypto.createHash(f.hash).update(x).digest()
    }

    f.values.forEach(function (v) {
      var proof = merkleProof(f.tree, v)
      t.same(proof, f.proofs[v])

      // map to Buffers for verify
      proof = proof.map(function (x) { return x && Buffer.from(x, 'hex') })
      t.equal(merkleProof.verify(proof, digest), true, 'is verifiable')
    })
  })

  t.end()
})

tape('various node count proofs', function (t) {
  function digest (x) {
    return crypto.createHash('sha1').update(x).digest()
  }

  var maxNodes = 200
  var leaves = []
  for (var i = 0; i < maxNodes; ++i) {
    var b = Buffer.alloc(32)
    b.writeUInt32LE(i)
    leaves.push(b)
  }

  for (var k = 0; k < maxNodes; ++k) {
    var bag = leaves.slice(0, k)
    var tree = merkle(bag, digest)

    bag.forEach(function (v) {
      var proof = merkleProof(tree, v)

      t.equal(merkleProof.verify(proof, digest), true, 'is verifiable')
    })
  }

  t.end()
})
