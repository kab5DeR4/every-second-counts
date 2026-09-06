// normalizes temporal data across scales for renderer
import { getElapsedBreakdown } from "./time.js";

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

    return {
      now,
      birthTimestamp: this.birthTimestamp,
      expectedYears: this.expectedYears,
      breakdown
    };
  }
}
