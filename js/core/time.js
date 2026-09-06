// high precision time math with tropical year constant
export const TROPICAL_YEAR_DAYS = 365.242199;
export const MS_PER_DAY = 86400000;
export const MS_PER_YEAR = TROPICAL_YEAR_DAYS * MS_PER_DAY;

// calculate elapsed breakdown without floating drift
export function getElapsedBreakdown(birthTimestamp, now = Date.now()) {
  const diffMs = Math.max(0, now - birthTimestamp);

  const totalAgeYears = diffMs / MS_PER_YEAR;
  const years = Math.floor(totalAgeYears);
  const fraction = totalAgeYears - years;

  const totalDays = Math.floor(diffMs / MS_PER_DAY);

  return {
    diffMs,
    totalAgeYears,
    years,
    fraction,
    totalDays
  };
}
