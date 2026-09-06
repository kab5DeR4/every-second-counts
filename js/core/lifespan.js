// normalizes temporal data across scales for renderer
import { MS_PER_DAY, MS_PER_YEAR, getDayProgress, getYearProgress, getElapsedBreakdown } from "./time.js";

export const SCALES = {
  NOW: 0,
  MINUTES: 1,
  HOURS: 2,
  DAYS: 3,
  MONTHS: 4,
  YEARS: 5,
  LIFE: 6
};

export class LifespanModel {
  constructor(birthTimestamp, expectedLifespanYears = 80) {
    this.birthTimestamp = birthTimestamp;
    this.expectedYears = expectedLifespanYears;
  }

  setBirthTimestamp(timestamp) {
    this.birthTimestamp = timestamp;
  }

  setExpectedYears(years) {
    this.expectedYears = Math.max(10, Math.min(130, years));
  }

  // package normalized data snapshot for visual renderer
  getSnapshot(now = Date.now()) {
    const breakdown = getElapsedBreakdown(this.birthTimestamp, now);
    const dayRatio = getDayProgress(new Date(now));
    const yearRatio = getYearProgress(new Date(now));

    // life progress based on calibrated expectancy
    const totalExpectedMs = this.expectedYears * MS_PER_YEAR;
    const lifeRatio = Math.min(1, Math.max(0, breakdown.diffMs / totalExpectedMs));

    // horizon perspective (e.g. 100 years or generation)
    const horizonRatio = Math.min(1, breakdown.diffMs / (100 * MS_PER_YEAR));

    return {
      now,
      birthTimestamp: this.birthTimestamp,
      expectedYears: this.expectedYears,
      breakdown,
      ratios: {
        now: (now % 1000) / 1000,
        day: dayRatio,
        year: yearRatio,
        life: lifeRatio,
        horizon: horizonRatio
      }
    };
  }
}
