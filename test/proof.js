var crypto = require('crypto')
var merkleProof = require('../proof')
var tape = require('tape')
var fixtures = require('./fixtures')

tape('proofs, for each fixture', function (t) {
  fixtures.forEach(function (f) {
    function digest (x) {
      return crypto.createHash(f.hash).update(x).digest()
    }

    f.proofs = {}
    f.values.forEach(function (v, i) {
      var proof = merkleProof(f.tree, v)

      f.proofs[v] = proof

      proof = proof.map(function (x) { return new Buffer(x, 'hex') })
      t.equal(merkleProof.verify(proof, digest), true, 'is verifiable')
    })

    require('fs').writeFileSync('./test/fixtures.json', JSON.stringify(fixtures, null, 2))
  })

  t.end()
})
