const { escapeId } = require('mysql2')

module.exports = identifier => {
  if (typeof identifier !== 'string' || identifier.length === 0) {
    throw new Error('SQL identifier must be a non-empty string')
  }
  // Picker values are literal names; dots must not become qualification syntax.
  return escapeId(identifier, true)
}
