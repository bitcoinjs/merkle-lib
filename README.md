# merkle-lib

[![Build Status](https://travis-ci.org/bitcoinjs/merkle-lib.png?branch=master)](https://travis-ci.org/bitcoinjs/merkle-lib)
[![NPM](https://img.shields.io/npm/v/merkle-lib.svg)](https://www.npmjs.org/package/merkle-lib)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

A performance conscious library for merkle root and tree calculations.


## Examples

Tree
``` javascript
var merkle = require('merkle-lib')
var hashes = [
  new Buffer('cafebeef', 'hex'),
  new Buffer('ffffffff', 'hex')
]

merkle(hashes, function (data) {
  return crypto.createHash('sha256').update(data).digest()
}).map(x => x.toString('hex'))
// => [ 'bda5c39dec343da54ce91c57bf8e796c2ca16a1bd8cae6a2cefbdd16efc32578' ]
```

Root only
``` javascript
var fastRoot = require('merkle-lib/fastRoot')
var hashes = [
  new Buffer('cafebeef', 'hex'),
  new Buffer('ffffffff', 'hex')
]

fastRoot(hashes, function (data) {
  return crypto.createHash('sha256').update(data).digest()
}).toString('hex')
// => 'bda5c39dec343da54ce91c57bf8e796c2ca16a1bd8cae6a2cefbdd16efc32578'
```
