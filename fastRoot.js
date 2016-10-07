// constant-space merkle root calculation algorithm
module.exports = function fastRoot (values, digestFn) {
  if (!Array.isArray(values)) throw TypeError('Expected values Array')
  if (typeof digestFn !== 'function') throw TypeError('Expected digest Function')

  var length = values.length
  var result = values.concat()

  while (length > 1) {
    var j = 0

    for (var i = 0; i < length; i += 2, ++j) {
      var input = Buffer.concat([
        result[i],
        i + 1 !== length ? result[i + 1] : result[i]
      ])

      result[j] = digestFn(input)
    }

    length = j
  }

  return result[0]
}
