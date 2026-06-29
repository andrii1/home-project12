function parseNumber(str) {
  if (!str) return null;
  return Number(str.toString().replace(/,/g, ''));
}

module.exports = parseNumber;
