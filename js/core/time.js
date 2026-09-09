// High-precision time math using integer-rounded millisecond constants to prevent IEEE-754 floating-point drift
export const TROPICAL_YEAR_DAYS = 365.242199;
export const MS_PER_DAY = 86_400_000;
export const MS_PER_YEAR = Math.round(TROPICAL_YEAR_DAYS * MS_PER_DAY); // 31,556,925,994 ms

/**
 * Safely parses input from <input type="datetime-local"> into a pure UTC millisecond timestamp
 * @param {string} dateString - e.g. "2006-06-12T00:00"
 * @returns {number} UTC Timestamp
 */
export function parseInputToUTCTimestamp(dateString) {
  if (!dateString) return Date.now();
  // Append 'Z' to force ISO string parsing directly in UTC
  const safeIsoString = dateString.endsWith("Z") ? dateString : `${dateString}:00Z`;
  return new Date(safeIsoString).getTime();
}

/**
 * Calculates elapsed breakdown without floating point or timezone drift
 */
export function getElapsedBreakdown(birthTimestamp, now = Date.now()) {
  const diffMs = Math.max(0, now - birthTimestamp);

  const years = Math.floor(diffMs / MS_PER_YEAR);
  const remainderMs = diffMs % MS_PER_YEAR;
  const fraction = remainderMs / MS_PER_YEAR;
  const totalAgeYears = years + fraction;

  const totalDays = Math.floor(diffMs / MS_PER_DAY);

  return {
    diffMs,
    totalAgeYears,
    years,
    fraction,
    totalDays
  };
}
