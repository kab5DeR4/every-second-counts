import { Storage } from "./core/storage.js";
import { LifespanModel } from "./core/lifespan.js";
import { LifeMatrixRenderer } from "./visual/field.js";

const UI = {
  // Col 1
  todayDateStr: document.getElementById("today-date-str"),
  heroInt: document.getElementById("hero-age-int"),
  heroDec: document.getElementById("hero-age-dec"),
  todayCountdown: document.getElementById("today-countdown"),
  quoteDate: document.getElementById("quote-date"),
  yearDaysLeft: document.getElementById("year-days-left"),
  yearPctText: document.getElementById("year-pct-text"),
  yearBar: document.getElementById("year-bar"),

  // Col 2
  expectancyLabel: document.getElementById("horizon-expectancy-label"),
  weeksLeft: document.getElementById("stat-weeks-left"),
  weeksLived: document.getElementById("stat-weeks-lived"),
  summersLeft: document.getElementById("stat-summers-left"),
  weekendsLeft: document.getElementById("stat-weekends-left"),
  wakingHours: document.getElementById("stat-waking-hours"),
  pctLived: document.getElementById("stat-pct-lived"),
  horizonBar: document.getElementById("horizon-bar"),
  daysLivedText: document.getElementById("stat-days-lived-text"),
  daysLeftText: document.getElementById("stat-days-left-text"),

  // Col 3
  canvas: document.getElementById("life-canvas"),

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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function init() {
  const birthTs = Storage.getBirthTimestamp();
  const lifeYrs = Storage.getExpectedLifespan();

  model = new LifespanModel(birthTs, lifeYrs);
  renderer = new LifeMatrixRenderer(UI.canvas);

  if (!birthTs) {
    showSettings();
  }

  UI.btnSettings.addEventListener("click", showSettings);
  UI.btnClose.addEventListener("click", hideSettings);
  UI.form.addEventListener("submit", (e) => {
    e.preventDefault();
    saveSettings();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "s" || e.key === "S") {
      if (UI.modal.hidden) showSettings();
    } else if (e.key === "Escape") {
      if (!UI.modal.hidden && Storage.getBirthTimestamp()) hideSettings();
    }
  });

  loop();
}

function showSettings() {
  const ts = Storage.getBirthTimestamp();
  if (ts) {
    const d = new Date(ts);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
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
  const ts = new Date(dateStr).getTime();
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

  // Col 1 Updates
  if (UI.todayDateStr) UI.todayDateStr.textContent = dateStr;
  if (UI.quoteDate) UI.quoteDate.textContent = dateStr;
  if (UI.todayCountdown) UI.todayCountdown.textContent = formatCountdown(now);

  // Year Cycle Math
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
  const yearTotalMs = endOfYear - startOfYear;
  const yearElapsedMs = now - startOfYear;
  const yearPct = Math.min(100, Math.max(0, (yearElapsedMs / yearTotalMs) * 100)).toFixed(0);
  const yearDaysRemaining = Math.max(0, Math.ceil((endOfYear - now) / 86400000));

  if (UI.yearDaysLeft) UI.yearDaysLeft.textContent = `${yearDaysRemaining} days left`;
  if (UI.yearPctText) UI.yearPctText.textContent = `${yearPct}% of ${now.getFullYear()} has elapsed`;
  if (UI.yearBar) UI.yearBar.style.width = `${yearPct}%`;

  if (!model.birthTimestamp) return;

  const snapshot = model.getSnapshot(now.getTime());
  const { breakdown, expectedYears } = snapshot;

  // Hero Age (Continuous decimal)
  UI.heroInt.textContent = breakdown.years.toString();
  const decStr = breakdown.fraction.toFixed(8).split(".")[1] || "00000000";
  UI.heroDec.textContent = `.${decStr}`;

  // Col 2: Tangible Finite Life Metrics
  const totalWeeks = expectedYears * 52;
  const weeksLived = Math.floor(breakdown.totalDays / 7);
  const weeksLeft = Math.max(0, totalWeeks - weeksLived);

  const totalExpectedDays = Math.floor(expectedYears * 365.242199);
  const daysLeft = Math.max(0, totalExpectedDays - breakdown.totalDays);
  const daysLived = breakdown.totalDays;

  const summersLeft = Math.max(0, expectedYears - breakdown.years);
  const weekendsLeft = weeksLeft;
  // Conscious waking hours left (assuming ~16 waking hours per day)
  const wakingHoursLeft = Math.floor(daysLeft * 16);

  const pctLived = Math.min(100, Math.max(0, (weeksLived / totalWeeks) * 100)).toFixed(1);

  if (UI.expectancyLabel) UI.expectancyLabel.textContent = `If you reach ${expectedYears}`;
  if (UI.weeksLeft) UI.weeksLeft.textContent = formatThousands(weeksLeft);
  if (UI.weeksLived) UI.weeksLived.textContent = `${formatThousands(weeksLived)} lived`;
  if (UI.summersLeft) UI.summersLeft.textContent = formatThousands(summersLeft);
  if (UI.weekendsLeft) UI.weekendsLeft.textContent = formatThousands(weekendsLeft);
  if (UI.wakingHours) UI.wakingHours.textContent = `~${formatThousands(wakingHoursLeft)}`;

  if (UI.pctLived) UI.pctLived.textContent = `${pctLived}%`;
  if (UI.horizonBar) UI.horizonBar.style.width = `${pctLived}%`;
  if (UI.daysLivedText) UI.daysLivedText.textContent = `${formatThousands(daysLived)} days lived`;
  if (UI.daysLeftText) UI.daysLeftText.textContent = `${formatThousands(daysLeft)} days remaining`;

  // Col 3: Render Tapestry
  renderer.render(snapshot);
}

document.addEventListener("DOMContentLoaded", init);
