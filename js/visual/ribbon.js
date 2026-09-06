// Mode B: The Ribbon - continuous life timeline vector
import { MS_PER_DAY } from "../core/time.js";

export class LifeRibbon {
  constructor() {
    this.hoveredPoint = null;
  }

  // render continuous geometric life filament
  render(ctx, width, height, snapshot, zoomLevel, memories, mousePos) {
    const { birthTimestamp, expectedYears, ratios, breakdown } = snapshot;
    if (!birthTimestamp) return;

    const lifeRatio = ratios.life;
    const centerY = height / 2;
    const margin = Math.max(60, width * 0.1);
    const ribbonLength = width - margin * 2;

    const startX = margin;
    const endX = margin + ribbonLength;
    const currentX = startX + ribbonLength * lifeRatio;

    // 1. Future trajectory track line (faint guideline)
    ctx.strokeStyle = "#161616";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(currentX, centerY);
    ctx.lineTo(endX, centerY);
    ctx.stroke();

    // 2. Decade milestone ticks and labels along the vector
    ctx.font = "8px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let yr = 0; yr <= expectedYears; yr += 10) {
      const tx = startX + ribbonLength * (yr / expectedYears);
      const isPast = yr <= breakdown.totalAgeYears;

      ctx.strokeStyle = isPast ? "#444444" : "#1a1a1a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, centerY - 6);
      ctx.lineTo(tx, centerY + 6);
      ctx.stroke();

      ctx.fillStyle = isPast ? "#777777" : "#282828";
      ctx.fillText(`${yr}y`, tx, centerY + 12);
    }

    // 3. Past dense life filament with harmonic micro-wave vibration
    const elapsedSegments = Math.max(20, Math.floor(300 * lifeRatio));
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(startX, centerY);

    const nowTime = Date.now();
    for (let i = 1; i <= elapsedSegments; i++) {
      const segRatio = (i / elapsedSegments) * lifeRatio;
      const px = startX + ribbonLength * segRatio;
      // subtle micro-frequency flutter representing velocity of lived time
      const waveAmplitude = (0.6 + zoomLevel * 1.8) * Math.sin((i / elapsedSegments) * Math.PI);
      const py = centerY + Math.sin(px * 0.06 + nowTime * 0.003) * waveAmplitude;
      ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 4. Memory markers along ribbon as ruby vertical needles
    memories.forEach((mem) => {
      const memDiff = mem.timestamp - birthTimestamp;
      const memRatio = memDiff / (expectedYears * 365.242 * MS_PER_DAY);
      if (memRatio >= 0 && memRatio <= 1) {
        const mx = startX + ribbonLength * memRatio;
        ctx.strokeStyle = "#ff3333";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(mx, centerY - 14);
        ctx.lineTo(mx, centerY + 14);
        ctx.stroke();

        ctx.fillStyle = "#ff3333";
        ctx.beginPath();
        ctx.arc(mx, centerY - 14, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Active current moment cursor & forward light emission
    const secondFraction = (nowTime % 1000) / 1000;
    const haloRadius = 6 + (1 - secondFraction) * 6;

    // pulsing halo
    ctx.strokeStyle = `rgba(255, 51, 51, ${1 - secondFraction})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(currentX, centerY, haloRadius, 0, Math.PI * 2);
    ctx.stroke();

    // active point core
    ctx.fillStyle = "#ff3333";
    ctx.beginPath();
    ctx.arc(currentX, centerY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // vertical reference cursor line
    ctx.strokeStyle = "rgba(255, 51, 51, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(currentX, centerY - 28);
    ctx.lineTo(currentX, centerY + 28);
    ctx.stroke();

    // 6. Hover detection
    this.hoveredPoint = null;
    if (mousePos && mousePos.x !== null) {
      if (mousePos.x >= startX && mousePos.x <= endX && Math.abs(mousePos.y - centerY) < 36) {
        const hoverRatio = (mousePos.x - startX) / ribbonLength;
        const hoverTimestamp = birthTimestamp + hoverRatio * (expectedYears * 365.242 * MS_PER_DAY);

        // find closest memory
        const closeMem = memories.find((m) => Math.abs(m.timestamp - hoverTimestamp) < 20 * MS_PER_DAY);
        const isCurrent = Math.abs(mousePos.x - currentX) < 10;
        const isPast = mousePos.x < currentX;

        this.hoveredPoint = {
          x: mousePos.x,
          y: centerY,
          timestamp: hoverTimestamp,
          isNow: isCurrent,
          isPast,
          memory: closeMem || null
        };

        // draw hover reticle on ribbon
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mousePos.x, centerY - 20);
        ctx.lineTo(mousePos.x, centerY + 20);
        ctx.stroke();
      }
    }
  }
}
