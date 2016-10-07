var crypto = require('crypto')
var merkleProof = require('../proof')
var tape = require('tape')
var fixtures = require('./fixtures')

tape('proofs, for each fixture', function (t) {
  fixtures.forEach(function (f) {
    function digest (x) {
      return crypto.createHash(f.hash).update(x).digest()
    }

    f.values.forEach(function (v) {
      var proof = merkleProof(f.tree, v)
      t.same(f.proofs[v], proof)

      // map to Buffers for verify
      proof = proof.map(function (x) { return new Buffer(x, 'hex') })
      t.equal(merkleProof.verify(proof, digest), true, 'is verifiable')
    })
  })

  t.end()
})
