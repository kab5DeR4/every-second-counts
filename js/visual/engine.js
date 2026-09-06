// high performance canvas engine with smooth damping physics
import { LifeField } from "./field.js";
import { LifeRibbon } from "./ribbon.js";
import { LifeOrbit } from "./orbit.js";

export class VisualEngine {
  constructor(canvasElement, onHoverCallback) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.onHover = onHoverCallback;

    this.modes = {
      field: new LifeField(),
      ribbon: new LifeRibbon(),
      orbit: new LifeOrbit()
    };

    this.activeModeKey = "field";
    this.zoomLevel = 0.0;
    this.targetZoomLevel = 0.0;

    this.mousePos = { x: null, y: null };
    this.isRunning = false;
    this.animationFrameId = null;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.initListeners();
    this.resize();
  }

  initListeners() {
    window.addEventListener("resize", () => this.resize());

    window.addEventListener("mousemove", (e) => {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
      this.mousePos.x = null;
      this.mousePos.y = null;
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  setMode(modeKey) {
    if (this.modes[modeKey]) {
      this.activeModeKey = modeKey;
    }
  }

  setZoom(targetNormalized) {
    this.targetZoomLevel = Math.max(0, Math.min(1, targetNormalized));
  }

  adjustZoom(delta) {
    this.setZoom(this.targetZoomLevel + delta);
  }

  renderFrame(snapshot, memories) {
    // critically damped camera interpolation
    const zoomDiff = this.targetZoomLevel - this.zoomLevel;
    this.zoomLevel += zoomDiff * 0.15;

    // clean canvas fill
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);

    const activeMode = this.modes[this.activeModeKey];
    if (activeMode) {
      activeMode.render(
        this.ctx,
        this.width,
        this.height,
        snapshot,
        this.zoomLevel,
        memories,
        this.mousePos
      );

      if (this.onHover) {
        this.onHover(activeMode.hoveredPoint);
      }
    }
  }

  start(tickCallback) {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = () => {
      if (!this.isRunning) return;
      if (tickCallback) tickCallback();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
