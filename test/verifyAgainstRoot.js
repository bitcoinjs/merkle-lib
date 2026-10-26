var crypto = require('crypto')
var fixtures = require('./fixtures')
var merkle = require('../')
var merkleProof = require('../proof')
var tape = require('tape')

function digest (data) {
  return crypto.createHash('sha256').update(data).digest()
}

tape('verifyAgainstRoot binds the root and expected leaf', function (t) {
  var a = digest(Buffer.from('a'))
  var b = digest(Buffer.from('b'))
  var c = digest(Buffer.from('c'))
  var tree = merkle([a, b, c], digest)
  var root = tree[tree.length - 1]
  var proof = merkleProof(tree, a)
  var forgedTree = merkle([a, b], digest)
  var forgedProof = merkleProof(forgedTree, a)

  t.equal(merkleProof.verify(forgedProof, digest), true, 'legacy check accepts a different self-consistent tree')
  t.equal(merkleProof.verifyAgainstRoot(forgedProof, root, a, digest), false, 'rejects an attacker-selected root')
  t.equal(merkleProof.verifyAgainstRoot(proof, root, c, digest), false, 'rejects a different expected leaf')
  t.equal(merkleProof.verifyAgainstRoot(proof, root, tree[3], digest), false, 'does not treat an internal node as the expected leaf')

  var disconnected = [c, b, a, b, forgedTree[forgedTree.length - 1]]
  t.equal(merkleProof.verify(disconnected, digest), true, 'legacy check can discard an earlier pair')
  t.equal(merkleProof.verifyAgainstRoot(disconnected, forgedTree[forgedTree.length - 1], c, digest), false, 'rejects a disconnected leaf even when root and leaf comparisons match')

  forgedProof[forgedProof.length - 1] = root
  t.equal(merkleProof.verifyAgainstRoot(forgedProof, root, a, digest), false, 'reconstructs rather than trusting the terminal root')
  t.equal(merkleProof.verifyAgainstRoot([root], root, a, digest), false, 'a root-only proof must also match the expected leaf')
  t.equal(merkleProof.verifyAgainstRoot([a], Buffer.from(a), Buffer.from(a), digest), true, 'accepts the same one-node root and leaf by value')
  t.end()
})

tape('verifyAgainstRoot accepts fixture proofs without modifying them', function (t) {
  fixtures.forEach(function (f) {
    function fixtureDigest (data) {
      return crypto.createHash(f.hash).update(data).digest()
    }

    var root = Buffer.from(f.tree[f.tree.length - 1], 'hex')
    f.values.forEach(function (v) {
      var proof = f.proofs[v].map(function (x) { return x === null ? null : Buffer.from(x, 'hex') })
      var before = proof.map(function (x) { return x === null ? null : Buffer.from(x) })
      t.equal(merkleProof.verifyAgainstRoot(proof, root, Buffer.from(v, 'hex'), fixtureDigest), true, 'accepts a known root and leaf')
      t.same(proof, before, 'does not modify proof nodes')
    })
  })
  t.end()
})

tape('verifyAgainstRoot preserves left/right paths and odd padding', function (t) {
  var leaves = []
  for (var i = 0; i < 17; ++i) {
    leaves.push(digest(Buffer.from(String(i))))
    var tree = merkle(leaves, digest)
    var root = tree[tree.length - 1]
    leaves.forEach(function (leaf) {
      t.equal(merkleProof.verifyAgainstRoot(merkleProof(tree, leaf), root, leaf, digest), true, 'accepts each leaf in a ' + leaves.length + '-leaf tree')
    })
  }
  t.end()
})

tape('verifyAgainstRoot rejects malformed proofs and missing expected values', function (t) {
  var a = digest(Buffer.from('a'))
  var b = digest(Buffer.from('b'))
  var root = digest(Buffer.concat([a, b]))
  var proof = [a, b, root]
  var malformed = [
    null, undefined, {}, a, [], [a, b],
    [null, b, root], [a, null, root], [a, 'b', root], ['a', b, root],
    [a, b, null], [a, b, 'root'], [a, b, undefined],
    [a, b, null, null, root], [a, b, a, b, root],
    [a, b, undefined, b, root], [a, b, false, b, root], [a, b, 0, b, root],
    [a, b, '', b, root], [a, b, null, 'b', root], [a, b, 'a', null, root],
    [a, b, null, undefined, root]
  ]
  malformed.forEach(function (input) {
    t.equal(merkleProof.verifyAgainstRoot(input, root, a, digest), false, 'rejects malformed proof')
  })

  ;[undefined, null, 'hash', 1, new Uint8Array(32)].forEach(function (input) {
    t.equal(merkleProof.verifyAgainstRoot(proof, input, a, digest), false, 'requires a Buffer expected root')
    t.equal(merkleProof.verifyAgainstRoot(proof, root, input, digest), false, 'requires a Buffer expected leaf')
  })
  t.equal(merkleProof.verifyAgainstRoot(proof, root, a), false, 'requires a digest function')
  t.equal(merkleProof.verifyAgainstRoot(proof, root, a, 'digest'), false, 'rejects a non-function digest')
  t.equal(merkleProof.verifyAgainstRoot([a], root, a, digest), false, 'rejects a mismatching one-node root')

  t.throws(function () {
    merkleProof.verifyAgainstRoot(proof, root, a, function () { throw new Error('digest failed') })
  }, /digest failed/, 'does not hide errors from the caller digest')
  t.end()
})
