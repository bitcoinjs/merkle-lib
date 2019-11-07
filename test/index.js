var crypto = require('crypto')
var merkle = require('../')
var fastRoot = require('../fastRoot')
var tape = require('tape')
var fixtures = require('./fixtures')

tape('throws on bad types', function (t) {
  t.throws(function () { merkle('not an array') })
  t.throws(function () { merkle([], 'not a function') })
  t.throws(function () { fastRoot('not an array') })
  t.throws(function () { fastRoot([], 'not a function') })
  t.end()
})

tape('generation, for each fixture (both internal nodes and leaves are Buffer)', function (t) {
  t.plan(fixtures.length * 2)

  fixtures.forEach(function (f) {
    var froot = f.tree[f.tree.length - 1]
    function digest (x) {
      return crypto.createHash(f.hash).update(x).digest()
    }

    var bufValues = f.values.map(function (x) { return Buffer.from(x, 'hex') })
    var tree = merkle(bufValues, digest).map(function (x) { return x.toString('hex') })
    var root = fastRoot(bufValues, digest).toString('hex')

    t.same(tree, f.tree, 'matches the tree')
    t.equal(root, froot, 'fastRoot returns the tree root ' + root)
  })

  t.end()
})

if (nodeVerMajor() >= 8) {
  tape('generation, for each fixture (both internal nodes and leaves are Uint8Array)', function (t) {
    t.plan(fixtures.length * 2)

    fixtures.forEach(function (f) {
      var froot = f.tree[f.tree.length - 1]

      function digest (x) {
        return new Uint8Array(crypto.createHash(f.hash).update(x).digest())
      }

      var arrValues = f.values.map(function (x) { return new Uint8Array(Buffer.from(x, 'hex')) })
      var tree = merkle(arrValues, digest).map(function (x) { return Buffer.from(x).toString('hex') })
      var root = Buffer.from(fastRoot(arrValues, digest)).toString('hex')

      t.same(tree, f.tree, 'matches the tree')
      t.equal(root, froot, 'fastRoot returns the tree root ' + root)
    })

    t.end()
  })

  tape('generation, for each fixture (internal nodes are Buffer and leaves are Uint8Array)', function (t) {
    t.plan(fixtures.length * 2)

    fixtures.forEach(function (f) {
      var froot = f.tree[f.tree.length - 1]
      function digest (x) {
        return crypto.createHash(f.hash).update(x).digest()
      }

      var arrValues = f.values.map(function (x) { return new Uint8Array(Buffer.from(x, 'hex')) })
      var tree = merkle(arrValues, digest).map(function (x) { return (!Buffer.isBuffer(x) ? Buffer.from(x) : x).toString('hex') })
      var mixRoot = fastRoot(arrValues, digest)
      var root = (tree.length === 1 ? Buffer.from(mixRoot) : mixRoot).toString('hex')

      t.same(tree, f.tree, 'matches the tree')
      t.equal(root, froot, 'fastRoot returns the tree root ' + root)
    })

    t.end()
  })
}

function nodeVerMajor () {
  return parseInt(process.version.match(/^v?(\d+)\./)[1])
}
