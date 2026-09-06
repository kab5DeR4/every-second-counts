// app bootstrap: wires up engine, ui, and storage
import { Storage } from "./core/storage.js";
import { LifespanModel } from "./core/lifespan.js";
import { VisualEngine } from "./visual/engine.js";
import { CalibrationUI } from "./ui/calibration.js";
import { MemoryUI } from "./ui/memory.js";
import { InstrumentUI } from "./ui/instrument.js";

// grab canvas
const canvas = document.getElementById("instrument-canvas");

let lifespanModel = null;
let visualEngine = null;
let calibrationUI = null;
let memoryUI = null;
let instrumentUI = null;

function init() {
  // load saved calibration
  let birthTs = Storage.getBirthTimestamp();
  const lifespanYears = Storage.getExpectedLifespan();
  const savedMode = Storage.getVisualMode();

  lifespanModel = new LifespanModel(birthTs, lifespanYears);

  // setup visual engine
  visualEngine = new VisualEngine(canvas, (hoverPoint) => {
    if (instrumentUI) {
      instrumentUI.showTooltip(hoverPoint);
    }
  });

  visualEngine.setMode(savedMode);

  // setup ui controllers
  calibrationUI = new CalibrationUI((newTs, newLifespan) => {
    lifespanModel.setBirthTimestamp(newTs);
    lifespanModel.setExpectedYears(newLifespan);
  });

  memoryUI = new MemoryUI(() => {
    // memories updated
  });

  instrumentUI = new InstrumentUI(visualEngine, calibrationUI, memoryUI);

  // sync active mode button
  const activeBtn = document.querySelector(`.mode-btn[data-mode="${savedMode}"]`);
  if (activeBtn) {
    document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
    activeBtn.classList.add("active");
  }

  // start silky 60fps loop
  visualEngine.start(() => {
    const snapshot = lifespanModel.getSnapshot();
    instrumentUI.updateHUD(snapshot);
    visualEngine.renderFrame(snapshot, Storage.getMemories());
  });

  // if no birthdate calibrated yet, launch setup view immediately
  if (!birthTs) {
    calibrationUI.openSetup();
  }
}

// kick off when dom is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

