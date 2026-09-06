// high precision time math with tropical year constant
export const TROPICAL_YEAR_DAYS = 365.242199;
export const MS_PER_SEC = 1000;
export const MS_PER_MIN = 60000;
export const MS_PER_HOUR = 3600000;
export const MS_PER_DAY = 86400000;
export const MS_PER_YEAR = TROPICAL_YEAR_DAYS * MS_PER_DAY;

// calculate elapsed breakdown without floating drift
export function getElapsedBreakdown(birthTimestamp, now = Date.now()) {
  const diffMs = Math.max(0, now - birthTimestamp);

  const totalAgeYears = diffMs / MS_PER_YEAR;
  const years = Math.floor(totalAgeYears);
  const fraction = totalAgeYears - years;

  // exact calendar breakdown for multi-scale telemetry
  const birthDate = new Date(birthTimestamp);
  const nowDate = new Date(now);

  let calYears = nowDate.getFullYear() - birthDate.getFullYear();
  let calMonths = nowDate.getMonth() - birthDate.getMonth();
  let calDays = nowDate.getDate() - birthDate.getDate();

  if (calDays < 0) {
    calMonths -= 1;
    const prevMonthDays = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0).getDate();
    calDays += prevMonthDays;
  }
  if (calMonths < 0) {
    calYears -= 1;
    calMonths += 12;
  }

  const hours = nowDate.getHours();
  const minutes = nowDate.getMinutes();
  const seconds = nowDate.getSeconds();
  const millis = nowDate.getMilliseconds();

  const totalDays = Math.floor(diffMs / MS_PER_DAY);
  const totalHours = Math.floor(diffMs / MS_PER_HOUR);

  return {
    diffMs,
    totalAgeYears,
    years,
    fraction,
    calYears: Math.max(0, calYears),
    calMonths: Math.max(0, calMonths),
    calDays: Math.max(0, calDays),
    hours,
    minutes,
    seconds,
    millis,
    totalDays,
    totalHours
  };
}

// compute daily diurnal progress between 0 and 1
export function getDayProgress(now = new Date()) {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const currentMs = now.getTime() - startOfDay;
  return currentMs / MS_PER_DAY;
}

// compute current calendar year progress
export function getYearProgress(now = new Date()) {
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1).getTime();
  const currentMs = now.getTime() - startOfYear;
  return currentMs / (endOfYear - startOfYear);
}
