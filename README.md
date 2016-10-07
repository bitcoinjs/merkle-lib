# merkle-lib

[![Build Status](https://travis-ci.org/bitcoinjs/merkle-lib.png?branch=master)](https://travis-ci.org/bitcoinjs/merkle-lib)
[![NPM](https://img.shields.io/npm/v/merkle-lib.svg)](https://www.npmjs.org/package/merkle-lib)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

A performance conscious library for merkle root and tree calculations.


## Examples
Tree
``` javascript
var merkle = require('merkle-lib')
var data = [
  new Buffer('cafebeef', 'hex'),
  new Buffer('ffffffff', 'hex'),
  new Buffer('aaaaaaaa', 'hex'),
  new Buffer('bbbbbbbb', 'hex'),
  new Buffer('cccccccc', 'hex')
]

merkle(data, function (data) {
  return crypto.createHash('sha256').update(data).digest()
}).map(x => x.toString('hex'))
// => [
//  'c2692b0e127b3b774a92f6e1d8ff8c3a5ea9eef9a1d389fe294f0a7a2fec9be1',
//  'bb232963fd0efdeacb0fd76e26cf69055fa5facc19a5f5c2f2f27a6925d1db2f',
//  '2256e70bea2c591190a0d4d6c1415acd7458fae84d8d85cdc68b851da27777d4',
//  'bda5c39dec343da54ce91c57bf8e796c2ca16a1bd8cae6a2cefbdd16efc32578',
//  '8b722baf6775a313f1032ba9984c0dce32ff3c40d7a67b5df8de4dbaa43a3db0',
//  '3d2f424783df5853c8d7121b1371650c04241f318e1b0cd46bedbc805b9164c3'
// ]

```

Root only
``` javascript
var fastRoot = require('merkle-lib/fastRoot')
var data = [
  new Buffer('cafebeef', 'hex'),
  new Buffer('ffffffff', 'hex'),
  new Buffer('aaaaaaaa', 'hex'),
  new Buffer('bbbbbbbb', 'hex'),
  new Buffer('cccccccc', 'hex')
]

fastRoot(data, function (data) {
  return crypto.createHash('sha256').update(data).digest()
}).toString('hex')
// => 'c2692b0e127b3b774a92f6e1d8ff8c3a5ea9eef9a1d389fe294f0a7a2fec9be1'
```


#### Credits
Thanks to [Meni Rosenfield on bitcointalk](https://bitcointalk.org/index.php?topic=403231.msg9054025#msg9054025) for the math.
