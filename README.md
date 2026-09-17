# merkle-lib

[![Build Status](https://travis-ci.org/bitcoinjs/merkle-lib.png?branch=master)](https://travis-ci.org/bitcoinjs/merkle-lib)
[![NPM](https://img.shields.io/npm/v/merkle-lib.svg)](https://www.npmjs.org/package/merkle-lib)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

A performance conscious library for merkle root and tree calculations.


## Warnings
This implementation is vulnerable to a forgery attack [as a second pre-image attack](https://en.wikipedia.org/wiki/Merkle_tree#Second_preimage_attack), see these[\[1\]](https://crypto.stackexchange.com/questions/2106/what-is-the-purpose-of-using-different-hash-functions-for-the-leaves-and-interna)[\[2\]](https://crypto.stackexchange.com/questions/43430/what-is-the-reason-to-separate-domains-in-the-internal-hash-algorithm-of-a-merkl/44971#44971) crypto.stackexchange questions for an explanation.
To avoid this vulnerability,  you should pre-hash your leaves *using a different hash function* than the function provided such that `H(x) != H'(x)`.

Additionally, this implementation is vulnerable to a forgery attack [for an unbalanced merkle tree](https://bitcointalk.org/?topic=102395),  wherein,  in an unbalanced merkle tree, the last leaf node can be duplicated to create an artificial balanced tree,  resulting in the same root hash.
To avoid this vulnerability [in this implementation],  do not accept unbalanced merkle trees in your application.

## Proof verification

Use `merkleProof.verifyAgainstRoot(proof, expectedRoot, expectedLeaf, digestFn)` to check a proof against an independently trusted root and the leaf you intend to verify. Both expected values must be Buffers supplied by the caller. Obtain the root from an authenticated block header or other trusted state, not from the proof or its sender. Encode and hash the expected leaf according to your protocol, including any required leaf/internal-node domain separation.

The function returns `false` for a malformed proof or a mismatching root or leaf. A proof must be a nonempty odd-length array with a Buffer root as its last node. Multi-node proofs start with two Buffers, one of which must match the expected leaf; every later pair has exactly one `null` orientation marker and one Buffer sibling. A one-node proof must equal both the expected root and leaf. `digestFn` must return a Buffer; errors thrown by that caller-supplied function propagate.

A successful verification does not establish a leaf's exact position, the total leaf count or freedom from duplicate-leaf mutation. Legitimate odd-width padding is preserved. Applications that need stronger tree-shape or mutation guarantees must enforce their protocol's additional rules.


## Examples
Preamble
``` javascript
var crypto = require('crypto')

function sha256 (data) {
  return crypto.createHash('sha256').update(data).digest()
}

var data = [
  'cafebeef',
  'ffffffff',
  'aaaaaaaa',
  'bbbbbbbb',
  'cccccccc'
].map(x => new Buffer(x, 'hex'))

// ... now, the examples
```

Tree
``` javascript
var merkle = require('merkle-lib')
var tree = merkle(data, sha256)

console.log(tree.map(x => x.toString('hex')))
// => [
//  'cafebeef',
//  'ffffffff',
//  'aaaaaaaa',
//  'bbbbbbbb',
//  'cccccccc',
//  'bda5c39dec343da54ce91c57bf8e796c2ca16a1bd8cae6a2cefbdd16efc32578',
//  '8b722baf6775a313f1032ba9984c0dce32ff3c40d7a67b5df8de4dbaa43a3db0',
//  '3d2f424783df5853c8d7121b1371650c04241f318e1b0cd46bedbc805b9164c3',
//  'bb232963fd0efdeacb0fd76e26cf69055fa5facc19a5f5c2f2f27a6925d1db2f',
//  '2256e70bea2c591190a0d4d6c1415acd7458fae84d8d85cdc68b851da27777d4',
//  'c2692b0e127b3b774a92f6e1d8ff8c3a5ea9eef9a1d389fe294f0a7a2fec9be1'
//]
```

Root only (equivalent to `tree[tree.length - 1]`)
``` javascript
var fastRoot = require('merkle-lib/fastRoot')
var root = fastRoot(data, sha256)

console.log(root.toString('hex'))
// => 'c2692b0e127b3b774a92f6e1d8ff8c3a5ea9eef9a1d389fe294f0a7a2fec9be1'
```

Proof (with an expected root and leaf)
``` javascript
var merkleProof = require('merkle-lib/proof')
var proof = merkleProof(tree, data[0])

if (proof === null) {
  console.error('No proof exists!')
}

console.log(proof.map(x => x && x.toString('hex')))
// => [
//   'cafebeef',
//   'ffffffff',
//   null,
//   '8b722baf6775a313f1032ba9984c0dce32ff3c40d7a67b5df8de4dbaa43a3db0',
//   null,
//   '2256e70bea2c591190a0d4d6c1415acd7458fae84d8d85cdc68b851da27777d4',
//   'c2692b0e127b3b774a92f6e1d8ff8c3a5ea9eef9a1d389fe294f0a7a2fec9be1'
// ]

// An independently trusted root for this example, not one read from the proof.
var expectedRoot = Buffer.from('c2692b0e127b3b774a92f6e1d8ff8c3a5ea9eef9a1d389fe294f0a7a2fec9be1', 'hex')
console.log(merkleProof.verifyAgainstRoot(proof, expectedRoot, data[0], sha256))
// => true
```

## Legacy verification

`merkleProof.verify(proof, digestFn)` checks internal consistency against the root inside the proof only. It does not establish membership in a trusted tree and is deprecated for security decisions. Use `verifyAgainstRoot` instead.

Existing calls to `verify` retain their behavior when upgrading. If you use it, validate the proof structure described above, check an independently trusted root and the expected leaf, and require `verify` to succeed. Root and leaf comparisons without shape validation are insufficient: a later pair containing two Buffers can discard the reconstructed path.


#### Credits
Thanks to [Meni Rosenfield on bitcointalk](https://bitcointalk.org/index.php?topic=403231.msg9054025#msg9054025) for the math.
