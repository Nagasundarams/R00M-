function toUtcMidnight(d) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

function parseToDate(v) {
  if (v instanceof Date) return v;
  // Accept ISO-like strings such as '2025-08-26'
  return new Date(v);
}

function normalizeRange(fromInput, toInput) {
  const fromRaw = parseToDate(fromInput);
  const toRaw = parseToDate(toInput);

  if (Number.isNaN(fromRaw.getTime()) || Number.isNaN(toRaw.getTime())) {
    throw new RangeError("Invalid date(s)");
  }

  const from = toUtcMidnight(fromRaw);
  const to = toUtcMidnight(toRaw);

  if (to <= from) {
    throw new RangeError("Invalid date range");
  }

  return { from, to };
}

module.exports = { normalizeRange };
