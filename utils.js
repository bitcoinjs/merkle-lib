// n: number of hashes (incl. leaves)
// m: number of leaves

function depth (n) {
  return Math.ceil(Math.log(n))
}

function ntom (n) {
  for (var m = ((n + 1) / 2) | 0; m > 0; m--) {
    if (mton(m) === n) return m
  }

  throw new TypeError(n + ' not expected')
}

function mton (m) {
  var n = 0
  for (var i = m; i > 1; i = (i + 1) >> 1) n += i
  return n + 1
}

function flatten (levels) {
  return [].concat.apply([], levels)
}

function unflatten (list) {
  var n = list.length
  var levels = []

  while (n > 0) {
    var m = ntom(n)

    levels.push(list.slice(n - m, n))
    n -= m
  }

  return levels
}

module.exports = {
  depth: depth,
  flatten: flatten,
  unflatten: unflatten,
  ntom: ntom,
  mton: mton
}
