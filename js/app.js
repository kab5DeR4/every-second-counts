import { Storage } from "./core/storage.js";
import { LifespanModel } from "./core/lifespan.js";
import { LifeMatrixRenderer } from "./visual/field.js";
import { AmbientBackground } from "./visual/ambient.js";
import { OdometerDisplay } from "./visual/odometer.js";

const UI = {
  todayDateStr: document.getElementById("today-date-str"),
  heroInt: document.getElementById("hero-age-int"),
  heroDec: document.getElementById("hero-age-dec"),
  todayCountdown: document.getElementById("today-countdown"),
  quoteDate: document.getElementById("quote-date"),

  expectancyLabel: document.getElementById("horizon-expectancy-label"),
  weeksLeft: document.getElementById("stat-weeks-left"),
  weeksLived: document.getElementById("stat-weeks-lived"),
  summersLeft: document.getElementById("stat-summers-left"),
  weekendsLeft: document.getElementById("stat-weekends-left"),
  wakingHours: document.getElementById("stat-waking-hours"),
  pctLived: document.getElementById("stat-pct-lived"),
  horizonBar: document.getElementById("horizon-bar"),

  // Ambient & Tapestry
  ambientCanvas: document.getElementById("ambient-canvas"),
  canvas: document.getElementById("life-canvas"),
  tooltip: document.getElementById("tapestry-tooltip"),
  tooltipMain: document.getElementById("tooltip-main"),
  tooltipEra: document.getElementById("tooltip-era"),

  // Daily Focus
  dailyFocusInput: document.getElementById("daily-focus-input"),

  // Zen 4-7-8 Breathing Guide
  zenBreathContainer: document.getElementById("zen-breath-container"),
  zenBreathLabel: document.getElementById("zen-breath-label"),

  // Search Bar
  searchInput: document.getElementById("search-input"),

  // Settings
  btnSettings: document.getElementById("btn-settings"),
  modal: document.getElementById("settings-modal"),
  form: document.getElementById("settings-form"),
  inputBirth: document.getElementById("input-birth"),
  inputLife: document.getElementById("input-life"),
  btnClose: document.getElementById("btn-close")
};

let model;
let renderer;
let ambient;
let ageOdometer;
let countdownOdometer;
let idleTimer = null;
let isZenMode = false;

const FOCUS_KEY = "life_in_motion_daily_focus";
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Safely parses input from <input type="datetime-local"> into a pure UTC millisecond timestamp.
 * Appending 'Z' forces JS engines to parse in UTC, bypassing local server/client timezone offsets.
 */
function parseInputToUTCTimestamp(dateString) {
  if (!dateString) return Date.now();
  const safeIsoString = dateString.endsWith("Z") ? dateString : `${dateString}:00Z`;
  return new Date(safeIsoString).getTime();
}

function init() {
  const birthTs = Storage.getBirthTimestamp();
  const lifeYrs = Storage.getExpectedLifespan();

  model = new LifespanModel(birthTs, lifeYrs);
  
  if (UI.ambientCanvas) {
    ambient = new AmbientBackground(UI.ambientCanvas);
  }
  if (UI.heroInt) {
    ageOdometer = new OdometerDisplay(UI.heroInt);
  }
  if (UI.todayCountdown) {
    countdownOdometer = new OdometerDisplay(UI.todayCountdown);
  }

  // load saved daily priority
  if (UI.dailyFocusInput) {
    const saved = localStorage.getItem(FOCUS_KEY);
    if (saved) UI.dailyFocusInput.value = saved;

    UI.dailyFocusInput.addEventListener("input", (e) => {
      localStorage.setItem(FOCUS_KEY, e.target.value);
    });

    UI.dailyFocusInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        UI.dailyFocusInput.blur();
      }
    });
  }

  renderer = new LifeMatrixRenderer(UI.canvas, (hoverPoint) => {
    handleCanvasHover(hoverPoint);
  });

  if (!birthTs) {
    showSettings();
  }

  UI.btnSettings.addEventListener("click", showSettings);
  UI.btnClose.addEventListener("click", hideSettings);
  UI.form.addEventListener("submit", (e) => {
    e.preventDefault();
    saveSettings();
  });

  // hotkeys: '/' = search, 'S' = settings, 'Z'/'B' = zen mode, 'Esc' = blur/close
  window.addEventListener("keydown", (e) => {
    const isInputActive = document.activeElement && 
      (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA");

    if (e.key === "/" && !isInputActive && UI.modal.hidden) {
      e.preventDefault();
      if (UI.searchInput) {
        UI.searchInput.focus();
        UI.searchInput.select();
      }
    } else if ((e.key === "s" || e.key === "S") && !isInputActive) {
      if (UI.modal.hidden) showSettings();
    } else if ((e.key === "z" || e.key === "Z" || e.key === "b" || e.key === "B") && !isInputActive) {
      toggleZenMode();
    } else if (e.key === "Escape") {
      if (document.activeElement === UI.searchInput || document.activeElement === UI.dailyFocusInput) {
        document.activeElement.blur();
      } else if (!UI.modal.hidden && Storage.getBirthTimestamp()) {
        hideSettings();
      }
    }
  });

  // idle awareness
  const resetIdleTimer = () => {
    document.body.classList.remove("idle-awareness");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      const isTyping = document.activeElement && 
        (document.activeElement === UI.searchInput || document.activeElement === UI.dailyFocusInput);
      if (!isZenMode && UI.modal.hidden && !isTyping) {
        document.body.classList.add("idle-awareness");
      }
    }, 15000);
  };

  window.addEventListener("mousemove", resetIdleTimer);
  window.addEventListener("keydown", resetIdleTimer);
  resetIdleTimer();

  loop();
}

function toggleZenMode() {
  isZenMode = !isZenMode;
  document.body.classList.toggle("zen-mode", isZenMode);
}

function handleCanvasHover(pt) {
  if (!pt || !UI.tooltip) {
    if (UI.tooltip) UI.tooltip.hidden = true;
    return;
  }

  const status = pt.isNow ? "Present Week" : pt.isPast ? "Past Lived" : "Future Week";
  if (UI.tooltipMain) {
    UI.tooltipMain.textContent = `Age ${pt.ageYear} • Week ${pt.weekNum} (${status})`;
  }
  if (UI.tooltipEra && pt.eraName) {
    UI.tooltipEra.textContent = `${pt.eraName} • ${pt.eraDesc}`;
  }
  
  UI.tooltip.style.left = `${pt.x}px`;
  UI.tooltip.style.transform = "translateX(-50%)";
  UI.tooltip.hidden = false;
}

function showSettings() {
  const ts = Storage.getBirthTimestamp();
  if (ts) {
    const d = new Date(ts);
    // Format timestamp directly to UTC string for <input type="datetime-local">
    UI.inputBirth.value = d.toISOString().slice(0, 16);
  }
  UI.inputLife.value = Storage.getExpectedLifespan();
  UI.modal.hidden = false;
}

function hideSettings() {
  if (Storage.getBirthTimestamp()) {
    UI.modal.hidden = true;
  }
}

function saveSettings() {
  const dateStr = UI.inputBirth.value;
  if (!dateStr) return;

  // Use explicit UTC parsing to keep output consistent across all host environments
  const ts = parseInputToUTCTimestamp(dateStr);
  const yrs = parseInt(UI.inputLife.value, 10) || 80;

  if (ts > Date.now()) return;

  Storage.setBirthTimestamp(ts);
  Storage.setExpectedLifespan(yrs);

  model.setBirthTimestamp(ts);
  model.setExpectedYears(yrs);

  hideSettings();
}

function formatCountdown(d) {
  const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  const diffMs = Math.max(0, endOfDay - d);

  if (diffMs <= 1000) {
    return "00:00:00";
  }

  const h = Math.floor(diffMs / 3600000).toString().padStart(2, "0");
  const m = Math.floor((diffMs % 3600000) / 60000).toString().padStart(2, "0");
  const s = Math.floor((diffMs % 60000) / 1000).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatThousands(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function loop() {
  requestAnimationFrame(loop);

  const now = new Date();
  const dateStr = `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  // smooth background render
  if (ambient) {
    ambient.render();
  }

  // 4-7-8 breathing phase text sync (19s cycle)
  if (isZenMode && UI.zenBreathLabel) {
    const cycleSec = (now.getTime() % 19000) / 1000;
    if (cycleSec < 4) {
      UI.zenBreathLabel.textContent = "Inhale (4s)";
    } else if (cycleSec < 11) {
      UI.zenBreathLabel.textContent = "Hold (7s)";
    } else {
      UI.zenBreathLabel.textContent = "Exhale (8s)";
    }
  }

  // Header & Day Scale
  if (UI.todayDateStr) UI.todayDateStr.textContent = dateStr;
  if (UI.quoteDate) UI.quoteDate.textContent = dateStr;

  const countdownText = formatCountdown(now);
  if (countdownOdometer) {
    countdownOdometer.set(countdownText);
  } else if (UI.todayCountdown) {
    UI.todayCountdown.textContent = countdownText;
  }

  if (!model.birthTimestamp) return;

  const snapshot = model.getSnapshot(now.getTime());
  const { breakdown, expectedYears } = snapshot;

  // Hero Age
  if (ageOdometer) {
    ageOdometer.set(breakdown.years.toString());
  } else if (UI.heroInt) {
    UI.heroInt.textContent = breakdown.years.toString();
  }

  const decStr = breakdown.fraction.toFixed(8).split(".")[1] || "00000000";
  if (UI.heroDec) {
    UI.heroDec.textContent = `.${decStr}`;
  }

  // Tangible Finite Life Metrics
  const totalWeeks = expectedYears * 52;
  const weeksLived = Math.floor(breakdown.totalDays / 7);
  const weeksLeft = Math.max(0, totalWeeks - weeksLived);

  const totalExpectedDays = Math.floor(expectedYears * 365.242199);
  const daysLeft = Math.max(0, totalExpectedDays - breakdown.totalDays);

  const summersLeft = Math.max(0, expectedYears - breakdown.years);
  const weekendsLeft = weeksLeft;
  const wakingHoursLeft = Math.floor(daysLeft * 16);

  const pctLived = Math.min(100, Math.max(0, (weeksLived / totalWeeks) * 100)).toFixed(1);

  if (UI.expectancyLabel) UI.expectancyLabel.textContent = `Horizon: ${expectedYears} Years`;
  if (UI.weeksLeft) UI.weeksLeft.textContent = formatThousands(weeksLeft);
  if (UI.weeksLived) UI.weeksLived.textContent = formatThousands(weeksLived);
  if (UI.summersLeft) UI.summersLeft.textContent = formatThousands(summersLeft);
  if (UI.weekendsLeft) UI.weekendsLeft.textContent = formatThousands(weekendsLeft);
  if (UI.wakingHours) UI.wakingHours.textContent = `~${formatThousands(wakingHoursLeft)}`;

  if (UI.pctLived) UI.pctLived.textContent = `${pctLived}%`;
  if (UI.horizonBar) UI.horizonBar.style.width = `${pctLived}%`;

  // Render Tapestry Canvas
  renderer.render(snapshot);
}

document.addEventListener("DOMContentLoaded", init);
