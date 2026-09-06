// controls instrument HUD telemetry, scale transitions, settings drawer, and interactions
import { Storage } from "../core/storage.js";

export const SCALE_CONFIG = [
  { name: "LIFE", zoom: 0.0, label: "SCALE: LIFE (MACRO)" },
  { name: "YEARS", zoom: 0.2, label: "SCALE: YEARS" },
  { name: "MONTHS", zoom: 0.4, label: "SCALE: MONTHS" },
  { name: "DAYS", zoom: 0.6, label: "SCALE: DAYS" },
  { name: "HOURS", zoom: 0.8, label: "SCALE: HOURS" },
  { name: "NOW", zoom: 1.0, label: "SCALE: NOW (MICRO)" }
];

export class InstrumentUI {
  constructor(visualEngine, calibrationUI, memoryUI) {
    this.engine = visualEngine;
    this.calibUI = calibrationUI;
    this.memoryUI = memoryUI;

    this.currentHoverPoint = null;
    this.isFiniteMode = Storage.getFiniteMode();

    // DOM references
    this.clockTimeElem = document.getElementById("clock-time");
    this.clockMillisElem = document.getElementById("clock-millis");
    this.clockDateElem = document.getElementById("clock-date");

    this.ageIntElem = document.getElementById("age-int");
    this.ageDecElem = document.getElementById("age-dec");
    this.scaleLabelElem = document.getElementById("active-scale-label");

    this.subDaysElem = document.getElementById("sub-days");
    this.subDayPercentElem = document.getElementById("sub-day-percent");
    this.subLifePercentElem = document.getElementById("sub-life-percent");

    // Tooltip
    this.tooltipElem = document.getElementById("canvas-tooltip");
    this.tooltipPrimary = document.getElementById("tooltip-primary");
    this.tooltipSub = document.getElementById("tooltip-sub");
    this.tooltipMem = document.getElementById("tooltip-memory");

    // Buttons
    this.scaleButtons = document.querySelectorAll(".scale-step-btn");
    this.modeButtons = document.querySelectorAll(".mode-btn");
    this.finiteBtn = document.getElementById("finite-btn");
    this.quickMemBtn = document.getElementById("quick-memory-btn");
    this.settingsBtn = document.getElementById("settings-trigger-btn");

    // Drawer elements
    this.drawer = document.getElementById("settings-drawer");
    this.drawerBackdrop = document.getElementById("drawer-backdrop");
    this.drawerCloseBtn = document.getElementById("drawer-close-btn");
    this.drawerTabButtons = document.querySelectorAll(".drawer-tab-btn");
    this.drawerTabPanes = document.querySelectorAll(".drawer-tab-pane");
    this.resetDataBtn = document.getElementById("reset-data-btn");

    this.initEvents();
    this.applyFiniteMode();
  }

  initEvents() {
    // 1. Wheel zoom through time scales
    window.addEventListener("wheel", (e) => {
      // ignore if setup overlay or drawer is open
      if (document.querySelector(".fullscreen-setup-overlay.open") || this.drawer.classList.contains("open")) {
        return;
      }
      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      this.engine.adjustZoom(delta);
      this.syncScaleStateFromEngine();
    }, { passive: true });

    // 2. Scale scrubber buttons
    this.scaleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetScaleName = btn.dataset.scale;
        const target = SCALE_CONFIG.find((s) => s.name === targetScaleName);
        if (target) {
          this.engine.setZoom(target.zoom);
          this.setActiveScale(target);
        }
      });
    });

    // 3. Mode selector buttons
    this.modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        this.engine.setMode(mode);
        Storage.setVisualMode(mode);

        this.modeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // 4. Finite mode toggle
    this.finiteBtn.addEventListener("click", () => this.toggleFiniteMode());

    // 5. Settings drawer open/close
    this.settingsBtn.addEventListener("click", () => this.openDrawer("tab-calib"));
    this.quickMemBtn.addEventListener("click", () => this.openDrawer("tab-memories"));
    this.drawerCloseBtn.addEventListener("click", () => this.closeDrawer());
    this.drawerBackdrop.addEventListener("click", () => this.closeDrawer());

    // 6. Drawer Tab navigation
    this.drawerTabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;
        this.switchDrawerTab(targetTab);
      });
    });

    // 7. Reset all data
    if (this.resetDataBtn) {
      this.resetDataBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset all timestamps, memories, and calibration data?")) {
          Storage.clearAll();
          window.location.reload();
        }
      });
    }

    // 8. Direct Canvas Click for quick-pinning
    this.engine.canvas.addEventListener("click", () => {
      if (this.currentHoverPoint && this.currentHoverPoint.timestamp) {
        this.memoryUI.openQuickPin(this.currentHoverPoint.timestamp);
      }
    });

    // 9. Keyboard shortcuts
    window.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        if (e.key === "Escape") {
          this.memoryUI.closeQuickPin();
          this.closeDrawer();
        }
        return;
      }

      if (e.key === "f" || e.key === "F") {
        this.toggleFiniteMode();
      } else if (e.key === "1") {
        this.switchMode("field");
      } else if (e.key === "2") {
        this.switchMode("ribbon");
      } else if (e.key === "3") {
        this.switchMode("orbit");
      } else if (e.key === "m" || e.key === "M") {
        this.openDrawer("tab-memories");
      } else if (e.key === "s" || e.key === "S") {
        this.openDrawer("tab-calib");
      } else if (e.key === "Escape") {
        this.closeDrawer();
        this.memoryUI.closeQuickPin();
      } else if (e.key === "=" || e.key === "+") {
        this.engine.adjustZoom(0.1);
        this.syncScaleStateFromEngine();
      } else if (e.key === "-") {
        this.engine.adjustZoom(-0.1);
        this.syncScaleStateFromEngine();
      }
    });
  }

  switchMode(modeKey) {
    this.engine.setMode(modeKey);
    Storage.setVisualMode(modeKey);
    this.modeButtons.forEach((b) => {
      if (b.dataset.mode === modeKey) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }

  openDrawer(activeTabId = "tab-calib") {
    if (this.calibUI) {
      this.calibUI.syncDrawerValues();
    }
    if (this.memoryUI) {
      this.memoryUI.renderList();
    }
    this.switchDrawerTab(activeTabId);
    this.drawerBackdrop.classList.add("open");
    this.drawer.classList.add("open");
  }

  closeDrawer() {
    this.drawer.classList.remove("open");
    this.drawerBackdrop.classList.remove("open");
  }

  switchDrawerTab(tabId) {
    this.drawerTabButtons.forEach((b) => {
      if (b.dataset.tab === tabId) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });

    this.drawerTabPanes.forEach((pane) => {
      if (pane.id === tabId) {
        pane.classList.add("active");
      } else {
        pane.classList.remove("active");
      }
    });
  }

  toggleFiniteMode() {
    this.isFiniteMode = !this.isFiniteMode;
    Storage.setFiniteMode(this.isFiniteMode);
    this.applyFiniteMode();
  }

  applyFiniteMode() {
    if (this.isFiniteMode) {
      document.body.classList.add("finite-active");
      this.finiteBtn.classList.add("active");
    } else {
      document.body.classList.remove("finite-active");
      this.finiteBtn.classList.remove("active");
    }
  }

  syncScaleStateFromEngine() {
    const currentZ = this.engine.targetZoomLevel;
    let closest = SCALE_CONFIG[0];
    let minDist = 999;
    SCALE_CONFIG.forEach((s) => {
      const dist = Math.abs(s.zoom - currentZ);
      if (dist < minDist) {
        minDist = dist;
        closest = s;
      }
    });
    this.setActiveScale(closest);
  }

  setActiveScale(scaleObj) {
    this.scaleLabelElem.textContent = scaleObj.label;
    this.scaleButtons.forEach((btn) => {
      if (btn.dataset.scale === scaleObj.name) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  updateHUD(snapshot) {
    const { now, breakdown, ratios } = snapshot;
    const d = new Date(now);

    // micro-clock
    const pad2 = (n) => String(n).padStart(2, "0");
    const pad3 = (n) => String(n).padStart(3, "0");
    this.clockTimeElem.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    this.clockMillisElem.textContent = `.${pad3(d.getMilliseconds())}`;

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    this.clockDateElem.textContent = `${pad2(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;

    // primary age telemetry
    this.ageIntElem.textContent = String(breakdown.years).padStart(2, "0");
    this.ageDecElem.textContent = breakdown.fraction.toFixed(8).substring(2);

    // sub metrics
    this.subDaysElem.textContent = breakdown.totalDays.toLocaleString("en-US");
    this.subDayPercentElem.textContent = `${(ratios.day * 100).toFixed(1)}%`;
    this.subLifePercentElem.textContent = `${(ratios.life * 100).toFixed(2)}%`;
  }

  showTooltip(hoverPoint) {
    this.currentHoverPoint = hoverPoint;

    if (!hoverPoint) {
      this.tooltipElem.style.display = "none";
      return;
    }

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    if (hoverPoint.label) {
      // Orbit cycle label
      this.tooltipPrimary.textContent = hoverPoint.label;
      this.tooltipSub.textContent = "ORBITAL TELEMETRY";
      this.tooltipMem.style.display = "none";
    } else {
      const d = new Date(hoverPoint.timestamp);
      const statusStr = hoverPoint.isNow ? "● NOW (ACTIVE)" : hoverPoint.isPast ? "LIVED" : "FUTURE";
      const weekStr = hoverPoint.week ? `AGE ${hoverPoint.year} • WEEK ${hoverPoint.week}` : `AGE ${hoverPoint.year || 0}`;

      this.tooltipPrimary.textContent = `${weekStr} [${statusStr}]`;
      this.tooltipSub.textContent = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

      if (hoverPoint.memory) {
        this.tooltipMem.textContent = `★ "${hoverPoint.memory.label}"`;
        this.tooltipMem.style.display = "block";
      } else {
        this.tooltipMem.textContent = "+ Click to record memory";
        this.tooltipMem.style.display = "block";
      }
    }

    const tooltipWidth = 200;
    const posX = Math.min(window.innerWidth - tooltipWidth - 20, Math.max(20, hoverPoint.x + 14));
    const posY = Math.min(window.innerHeight - 80, Math.max(20, hoverPoint.y - 30));

    this.tooltipElem.style.left = `${posX}px`;
    this.tooltipElem.style.top = `${posY}px`;
    this.tooltipElem.style.display = "block";
  }
}

