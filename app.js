// tropical year constant for high precision age math
const TROPICAL_YEAR_DAYS = 365.242199;
const MS_PER_DAY = 86400000;
const MS_PER_YEAR = TROPICAL_YEAR_DAYS * MS_PER_DAY;
const TOTAL_80Y_WEEKS = Math.floor((80 * MS_PER_YEAR) / (MS_PER_DAY * 7));

const STORAGE_KEY_BIRTH = "every_second_counts_birth_timestamp";
const STORAGE_KEY_FOCUS = "every_second_counts_daily_focus";

// grab dom elements
const setupView = document.getElementById("setup-view");
const trackerView = document.getElementById("tracker-view");
const setupForm = document.getElementById("setup-form");
const birthInput = document.getElementById("birth-input");
const setupError = document.getElementById("setup-error");
const editBtn = document.getElementById("edit-btn");
const resetBtn = document.getElementById("reset-btn");

// header clock elems
const headerDateElem = document.getElementById("header-date");
const headerTimeElem = document.getElementById("header-time");

// hero age display elems
const ageIntegerElem = document.getElementById("age-integer");
const ageFractionElem = document.getElementById("age-fraction");
const progressLabelElem = document.getElementById("progress-label");
const progressPercentElem = document.getElementById("progress-percent");
const progressBarFill = document.getElementById("progress-bar-fill");

// metrics grid elems
const daysCountElem = document.getElementById("days-count");
const hoursCountElem = document.getElementById("hours-count");
const countdownValElem = document.getElementById("countdown-val");
const nextAgeLabelElem = document.getElementById("next-age-label");
const weeksCountElem = document.getElementById("weeks-count");
const lifePercentElem = document.getElementById("life-percent");
const heartbeatsCountElem = document.getElementById("heartbeats-count");
const breathsCountElem = document.getElementById("breaths-count");

// daily focus elem
const focusInput = document.getElementById("focus-input");

let birthTimestamp = null;
let animationFrameId = null;

// switch screens smoothly
function showView(viewName) {
  if (viewName === "tracker") {
    setupView.classList.add("hidden");
    trackerView.classList.remove("hidden");
  } else {
    trackerView.classList.add("hidden");
    setupView.classList.remove("hidden");
  }
}

// update top header clock
function updateTopClock(nowDate) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = String(nowDate.getDate()).padStart(2, "0");
  const month = months[nowDate.getMonth()];
  const year = nowDate.getFullYear();
  headerDateElem.textContent = `${day} ${month} ${year}`;

  const hours = String(nowDate.getHours()).padStart(2, "0");
  const mins = String(nowDate.getMinutes()).padStart(2, "0");
  const secs = String(nowDate.getSeconds()).padStart(2, "0");
  headerTimeElem.textContent = `${hours}:${mins}:${secs}`;
}

// format big numbers cleanly
function formatNumber(num) {
  return num.toLocaleString("en-US");
}

// silky smooth 60fps counter loop
function startAgeLoop() {
  function tick() {
    const now = Date.now();
    const nowDate = new Date(now);

    // keep header clock running
    updateTopClock(nowDate);

    if (!birthTimestamp) return;

    const diffMs = now - birthTimestamp;

    if (diffMs <= 0) {
      ageIntegerElem.textContent = "0";
      ageFractionElem.textContent = "00000000";
      daysCountElem.textContent = "0";
      hoursCountElem.textContent = "0";
      weeksCountElem.textContent = "0";
      countdownValElem.textContent = "--d --h --m --s";
    } else {
      const ageTotal = diffMs / MS_PER_YEAR;
      const ageInt = Math.floor(ageTotal);
      const fractionVal = ageTotal - ageInt;
      const ageDec = fractionVal.toFixed(8).substring(2);

      // update main age hero
      ageIntegerElem.textContent = ageInt;
      ageFractionElem.textContent = ageDec;

      // year progress bar
      const progressPercentNum = fractionVal * 100;
      const nextAge = ageInt + 1;
      progressLabelElem.textContent = `PROGRESS TOWARDS AGE ${nextAge}`;
      progressPercentElem.textContent = `${progressPercentNum.toFixed(2)}%`;
      progressBarFill.style.width = `${progressPercentNum}%`;

      // metric 1: days & hours
      const elapsedDays = Math.floor(diffMs / MS_PER_DAY);
      const elapsedHours = Math.floor(diffMs / 3600000);
      daysCountElem.textContent = formatNumber(elapsedDays);
      hoursCountElem.textContent = formatNumber(elapsedHours);

      // metric 2: next birthday milestone countdown
      const nextBirthdayMs = birthTimestamp + nextAge * MS_PER_YEAR;
      const remainingMs = Math.max(0, nextBirthdayMs - now);
      const remDays = Math.floor(remainingMs / MS_PER_DAY);
      const remHours = Math.floor((remainingMs % MS_PER_DAY) / 3600000);
      const remMins = Math.floor((remainingMs % 3600000) / 60000);
      const remSecs = Math.floor((remainingMs % 60000) / 1000);

      countdownValElem.textContent = `${remDays}d ${String(remHours).padStart(2, "0")}h ${String(remMins).padStart(2, "0")}m ${String(remSecs).padStart(2, "0")}s`;
      nextAgeLabelElem.textContent = `TURNING AGE ${nextAge}`;

      // metric 3: life in weeks (80y perspective)
      const elapsedWeeks = Math.floor(diffMs / (MS_PER_DAY * 7));
      const lifePct = Math.min(100, (diffMs / (80 * MS_PER_YEAR)) * 100);
      weeksCountElem.textContent = formatNumber(elapsedWeeks);
      lifePercentElem.textContent = `${lifePct.toFixed(1)}%`;

      // metric 4: biological heartbeats & breaths (est. 72 bpm & 16 bpm)
      const elapsedSeconds = diffMs / 1000;
      const totalBeats = Math.floor(elapsedSeconds * 1.2);
      const totalBreaths = Math.floor(elapsedSeconds * (16 / 60));
      heartbeatsCountElem.textContent = `~${formatNumber(totalBeats)}`;
      breathsCountElem.textContent = `~${formatNumber(totalBreaths)}`;
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  // stop any old loop before starting a fresh one
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  animationFrameId = requestAnimationFrame(tick);
}

// helper to format timestamp into datetime-local value
function toDatetimeLocalString(ts) {
  const date = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

// handle form submit & lock in the bday
setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  setupError.hidden = true;

  const rawValue = birthInput.value;
  if (!rawValue) return;

  const parsedDate = new Date(rawValue);
  const timestamp = parsedDate.getTime();

  // no future dates allowed
  if (isNaN(timestamp) || timestamp > Date.now()) {
    setupError.hidden = false;
    return;
  }

  birthTimestamp = timestamp;
  localStorage.setItem(STORAGE_KEY_BIRTH, timestamp.toString());
  showView("tracker");
  startAgeLoop();
});

// edit birth date button: prefill input and show setup
editBtn.addEventListener("click", () => {
  if (birthTimestamp) {
    birthInput.value = toDatetimeLocalString(birthTimestamp);
  }
  setupError.hidden = true;
  showView("setup");
});

// nuke saved date and reset back to setup
resetBtn.addEventListener("click", () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  localStorage.removeItem(STORAGE_KEY_BIRTH);
  localStorage.removeItem(STORAGE_KEY_FOCUS);
  // check for legacy key
  localStorage.removeItem("age_in_motion_birth_timestamp");
  localStorage.removeItem("age_in_motion_daily_focus");
  birthTimestamp = null;
  birthInput.value = "";
  focusInput.value = "";
  setupError.hidden = true;
  showView("setup");
});

// save daily focus on input
focusInput.addEventListener("input", (e) => {
  localStorage.setItem(STORAGE_KEY_FOCUS, e.target.value);
});

// boot up app on load
function init() {
  let savedTimestamp = localStorage.getItem(STORAGE_KEY_BIRTH);
  if (!savedTimestamp) {
    savedTimestamp = localStorage.getItem("age_in_motion_birth_timestamp");
  }
  let savedFocus = localStorage.getItem(STORAGE_KEY_FOCUS);
  if (!savedFocus) {
    savedFocus = localStorage.getItem("age_in_motion_daily_focus");
  }

  if (savedFocus) {
    focusInput.value = savedFocus;
  }

  if (savedTimestamp) {
    birthTimestamp = parseInt(savedTimestamp, 10);
    if (!isNaN(birthTimestamp) && birthTimestamp <= Date.now()) {
      showView("tracker");
      startAgeLoop();
      return;
    }
  }

  // fallback to setup if no valid timestamp exists
  showView("setup");
  // keep header clock running even on setup view
  startAgeLoop();
}

init();
