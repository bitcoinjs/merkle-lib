var crypto = require('crypto')
var fixtures = require('./fixtures')
var merkle = require('../')
var merkleProof = require('../proof')
var tape = require('tape')

tape('proofs, for each fixture (both internal nodes and leaves are Buffer)', function (t) {
  fixtures.forEach(function (f) {
    function digest (x) {
      return crypto.createHash(f.hash).update(x).digest()
    }

    var bufTree = f.tree.map(function (n) { return Buffer.from(n, 'hex') })

    f.values.forEach(function (v) {
      var bufValue = Buffer.from(v, 'hex')
      var bufProof = merkleProof(bufTree, bufValue)

      if (bufProof !== null) {
        var proof = bufProof.map(function (p) { return p && p.toString('hex') })
        t.same(proof, f.proofs[v])

        // map to Buffers for verify
        t.equal(merkleProof.verify(bufProof, digest), true, 'is verifiable')
      } else {
        t.fail('Node not found in tree')
      }
    })
  })

  t.end()
})

if (nodeVerMajor() >= 8) {
  tape('proofs, for each fixture (both internal nodes and leaves are Uint8Array)', function (t) {
    fixtures.forEach(function (f) {
      function digest (x) {
        return new Uint8Array(crypto.createHash(f.hash).update(x).digest())
      }

      var arrTree = f.tree.map(function (n) { return new Uint8Array(Buffer.from(n, 'hex')) })

      f.values.forEach(function (v) {
        var arrValue = new Uint8Array(Buffer.from(v, 'hex'))
        var arrProof = merkleProof(arrTree, arrValue)

        if (arrProof !== null) {
          var proof = arrProof.map(function (p) { return p && Buffer.from(p).toString('hex') })
          t.same(proof, f.proofs[v])

          // map to Buffers for verify
          t.equal(merkleProof.verify(arrProof, digest), true, 'is verifiable')
        } else {
          t.fail('Node not found in tree')
        }
      })
    })

    t.end()
  })

  tape('proofs, for each fixture (internal nodes are Buffer and leaves are Uint8Array)', function (t) {
    fixtures.forEach(function (f) {
      function digest (x) {
        return crypto.createHash(f.hash).update(x).digest()
      }

      var numValues = f.values.length
      var mixTree = f.tree.map(function (n, i) { var buf = Buffer.from(n, 'hex'); return i < numValues ? new Uint8Array(buf) : buf })

      f.values.forEach(function (v) {
        var arrValue = new Uint8Array(Buffer.from(v, 'hex'))
        var mixProof = merkleProof(mixTree, arrValue)

        if (mixProof !== null) {
          var proof = mixProof.map(function (p) { return p && (p instanceof Uint8Array ? Buffer.from(p) : p).toString('hex') })
          t.same(proof, f.proofs[v])

          // map to Buffers for verify
          t.equal(merkleProof.verify(mixProof, digest), true, 'is verifiable')
        } else {
          t.fail('Node not found in tree')
        }
      })
    })

    t.end()
  })
}

tape('various node count proofs (both internal nodes and leaves are Buffer)', function (t) {
  function digest (x) {
    return crypto.createHash('sha1').update(x).digest()
  }

  var maxNodes = 200
  var bufLeaves = []
  for (var i = 0; i < maxNodes; ++i) {
    var b = Buffer.alloc(32)
    b.writeUInt32LE(i)
    bufLeaves.push(b)
  }

  for (var k = 0; k < maxNodes; ++k) {
    var bufBag = bufLeaves.slice(0, k)
    var bufTree = merkle(bufBag, digest)

    bufBag.forEach(function (v) {
      var bufProof = merkleProof(bufTree, v)

      if (bufProof !== null) {
        t.equal(merkleProof.verify(bufProof, digest), true, 'is verifiable')
      } else {
        t.fail('Node not found in tree')
      }
    })
  }

  t.end()
})

if (nodeVerMajor() >= 8) {
  tape('various node count proofs (both internal nodes and leaves are Uint8Array)', function (t) {
    function digest (x) {
      return new Uint8Array(crypto.createHash('sha1').update(x).digest())
    }

    var maxNodes = 200
    var arrLeaves = []
    for (var i = 0; i < maxNodes; ++i) {
      var b = Buffer.alloc(32)
      b.writeUInt32LE(i)
      arrLeaves.push(new Uint8Array(b))
    }

    for (var k = 0; k < maxNodes; ++k) {
      var arrBag = arrLeaves.slice(0, k)
      var arrTree = merkle(arrBag, digest)

      arrBag.forEach(function (v) {
        var arrProof = merkleProof(arrTree, v)

        if (arrProof !== null) {
          t.equal(merkleProof.verify(arrProof, digest), true, 'is verifiable')
        } else {
          t.fail('Node not found in tree')
        }
      })
    }

    t.end()
  })

  tape('various node count proofs (internal nodes are Buffer and leaves are Uint8Array)', function (t) {
    function digest (x) {
      return crypto.createHash('sha1').update(x).digest()
    }

    var maxNodes = 200
    var arrLeaves = []
    for (var i = 0; i < maxNodes; ++i) {
      var b = Buffer.alloc(32)
      b.writeUInt32LE(i)
      arrLeaves.push(new Uint8Array(b))
    }

    for (var k = 0; k < maxNodes; ++k) {
      var arrBag = arrLeaves.slice(0, k)
      var mixTree = merkle(arrBag, digest)

      arrBag.forEach(function (v) {
        var mixProof = merkleProof(mixTree, v)

        if (mixProof !== null) {
          t.equal(merkleProof.verify(mixProof, digest), true, 'is verifiable')
        } else {
          t.fail('Node not found in tree')
        }
      })
    }

    t.end()
  })
}

function nodeVerMajor () {
  return parseInt(process.version.match(/^v?(\d+)\./)[1])
}
