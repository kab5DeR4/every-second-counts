// scientific calibration UI: fullscreen onboarding & drawer calibration
import { Storage } from "../core/storage.js";
import { MS_PER_DAY, MS_PER_YEAR } from "../core/time.js";

export class CalibrationUI {
  constructor(onSaveCallback) {
    this.onSave = onSaveCallback;

    // Fullscreen Setup Elements
    this.setupOverlay = document.getElementById("setup-overlay");
    this.setupForm = document.getElementById("setup-form");
    this.setupBirthInput = document.getElementById("setup-birth-input");
    this.setupLifespanSlider = document.getElementById("setup-lifespan-slider");
    this.setupLifespanNum = document.getElementById("setup-lifespan-num");
    this.setupErrorMsg = document.getElementById("setup-error-msg");

    // Live preview elements
    this.previewYearsVal = document.getElementById("preview-years-val");
    this.previewDaysVal = document.getElementById("preview-days-val");
    this.previewWeeksRemVal = document.getElementById("preview-weeks-rem-val");
    this.previewLifePctVal = document.getElementById("preview-life-pct-val");

    // Drawer Calibration Elements
    this.drawerCalibForm = document.getElementById("drawer-calib-form");
    this.drawerBirthInput = document.getElementById("drawer-birth-input");
    this.drawerLifespanSlider = document.getElementById("drawer-lifespan-slider");
    this.drawerLifespanNum = document.getElementById("drawer-lifespan-num");
    this.drawerErrorMsg = document.getElementById("drawer-error-msg");

    this.initEvents();
  }

  initEvents() {
    // 1. Setup slider input & live preview update
    this.setupLifespanSlider.addEventListener("input", (e) => {
      this.setupLifespanNum.textContent = e.target.value;
      this.updateLivePreview();
    });

    this.setupBirthInput.addEventListener("input", () => {
      this.setupErrorMsg.hidden = true;
      this.updateLivePreview();
    });

    // Setup form submit
    this.setupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const rawDate = this.setupBirthInput.value;
      if (!rawDate) return;

      const ts = new Date(rawDate).getTime();
      if (isNaN(ts) || ts > Date.now()) {
        this.setupErrorMsg.hidden = false;
        return;
      }

      const lifespan = parseInt(this.setupLifespanSlider.value, 10) || 80;
      Storage.setBirthTimestamp(ts);
      Storage.setExpectedLifespan(lifespan);

      this.closeSetup();
      if (this.onSave) {
        this.onSave(ts, lifespan);
      }
    });

    // 2. Drawer Calibration form
    if (this.drawerLifespanSlider) {
      this.drawerLifespanSlider.addEventListener("input", (e) => {
        this.drawerLifespanNum.textContent = e.target.value;
      });
    }

    if (this.drawerCalibForm) {
      this.drawerCalibForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const rawDate = this.drawerBirthInput.value;
        if (!rawDate) return;

        const ts = new Date(rawDate).getTime();
        if (isNaN(ts) || ts > Date.now()) {
          this.drawerErrorMsg.hidden = false;
          return;
        }

        const lifespan = parseInt(this.drawerLifespanSlider.value, 10) || 80;
        Storage.setBirthTimestamp(ts);
        Storage.setExpectedLifespan(lifespan);

        this.drawerErrorMsg.hidden = true;
        if (this.onSave) {
          this.onSave(ts, lifespan);
        }
      });
    }
  }

  updateLivePreview() {
    const rawDate = this.setupBirthInput.value;
    const lifespanYears = parseInt(this.setupLifespanSlider.value, 10) || 80;

    if (!rawDate) {
      this.previewYearsVal.textContent = "0.00";
      this.previewDaysVal.textContent = "0";
      this.previewWeeksRemVal.textContent = `${lifespanYears * 52}`;
      this.previewLifePctVal.textContent = "0.0%";
      return;
    }

    const birthTs = new Date(rawDate).getTime();
    const now = Date.now();

    if (isNaN(birthTs) || birthTs > now) {
      this.previewYearsVal.textContent = "--";
      this.previewDaysVal.textContent = "--";
      this.previewWeeksRemVal.textContent = "--";
      this.previewLifePctVal.textContent = "--";
      return;
    }

    const diffMs = now - birthTs;
    const totalDays = Math.floor(diffMs / MS_PER_DAY);
    const totalAgeYears = diffMs / MS_PER_YEAR;
    const totalLifespanWeeks = lifespanYears * 52;
    const weeksLived = Math.floor(totalDays / 7);
    const weeksRemaining = Math.max(0, totalLifespanWeeks - weeksLived);
    const lifePct = Math.min(100, (diffMs / (lifespanYears * MS_PER_YEAR)) * 100);

    this.previewYearsVal.textContent = totalAgeYears.toFixed(2);
    this.previewDaysVal.textContent = totalDays.toLocaleString("en-US");
    this.previewWeeksRemVal.textContent = weeksRemaining.toLocaleString("en-US");
    this.previewLifePctVal.textContent = `${lifePct.toFixed(1)}%`;
  }

  openSetup() {
    const currentTs = Storage.getBirthTimestamp();
    const currentLifespan = Storage.getExpectedLifespan();

    if (currentTs) {
      const d = new Date(currentTs);
      const pad = (n) => String(n).padStart(2, "0");
      this.setupBirthInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } else {
      // Default to 25 years ago for clean initial UX
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() - 25);
      defaultDate.setHours(12, 0, 0, 0);
      const pad = (n) => String(n).padStart(2, "0");
      this.setupBirthInput.value = `${defaultDate.getFullYear()}-${pad(defaultDate.getMonth() + 1)}-${pad(defaultDate.getDate())}T12:00`;
    }

    this.setupLifespanSlider.value = currentLifespan;
    this.setupLifespanNum.textContent = currentLifespan;
    this.setupErrorMsg.hidden = true;
    this.updateLivePreview();

    this.setupOverlay.classList.add("open");
  }

  closeSetup() {
    this.setupOverlay.classList.remove("open");
  }

  syncDrawerValues() {
    const currentTs = Storage.getBirthTimestamp();
    const currentLifespan = Storage.getExpectedLifespan();

    if (currentTs && this.drawerBirthInput) {
      const d = new Date(currentTs);
      const pad = (n) => String(n).padStart(2, "0");
      this.drawerBirthInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    if (this.drawerLifespanSlider) {
      this.drawerLifespanSlider.value = currentLifespan;
      this.drawerLifespanNum.textContent = currentLifespan;
    }
  }
}
