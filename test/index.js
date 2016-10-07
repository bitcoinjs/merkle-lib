var crypto = require('crypto')
var merkle = require('../')
var fastRoot = require('../fastRoot')
var tape = require('tape')
var fixtures = require('./fixtures')

tape('merkletree, for each fixture', function (t) {
  t.plan(fixtures.length * 2)

  fixtures.forEach(function (f) {
    function digest (x) {
      return crypto.createHash(f.hash).update(x).digest()
    }

    var values = f.values.map(x => new Buffer(x, 'hex'))
    var tree = merkle(values, digest).map(x => x.toString('hex'))
    var root = fastRoot(values, digest).toString('hex')

    t.same(f.tree, tree, 'merkle tree matches the expected tree')
    t.equal(f.tree[0], root, 'fastRoot matches the expected tree root')
  })
})
