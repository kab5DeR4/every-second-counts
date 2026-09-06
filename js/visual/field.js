// Mode A: The Field - astronomical 52-week-by-year life matrix
import { MS_PER_DAY } from "../core/time.js";

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export class LifeField {
  constructor() {
    this.hoveredPoint = null;
  }

  // render complete 52-week by year astronomical life tapestry
  render(ctx, width, height, snapshot, zoomLevel, memories, mousePos) {
    const { birthTimestamp, expectedYears, breakdown } = snapshot;
    if (!birthTimestamp) return;

    const cols = 52; // 52 weeks per year
    const rows = expectedYears; // 1 row per year of life
    const totalWeeks = cols * rows;

    const elapsedYearsFloat = breakdown.totalAgeYears;
    const elapsedWeeksTotal = Math.min(totalWeeks, Math.max(0, Math.floor(breakdown.totalDays / 7)));
    const currentYearRow = Math.min(rows - 1, Math.floor(elapsedYearsFloat));
    const currentWeekCol = Math.min(cols - 1, Math.floor((elapsedYearsFloat - currentYearRow) * cols));

    // compute spacing to fit screen at zoom 0
    const paddingX = Math.max(50, width * 0.08); // space for decade labels
    const paddingY = Math.max(80, height * 0.16);
    const availableWidth = width - paddingX * 2;
    const availableHeight = height - paddingY * 2;

    const baseCellW = availableWidth / cols;
    const baseCellH = availableHeight / rows;
    const baseSpacing = Math.min(baseCellW, baseCellH);

    // scale factor driven by life zoom
    const scale = 1.0 + zoomLevel * 3.8;
    const spacing = baseSpacing * scale;
    const gridWidth = cols * spacing;
    const gridHeight = rows * spacing;

    // camera focal point: blends from center (macro) to active current year/week (micro)
    const activePosX = currentWeekCol * spacing;
    const activePosY = currentYearRow * spacing;

    const macroFocusX = width / 2 - gridWidth / 2;
    const macroFocusY = height / 2 - gridHeight / 2 + 10;

    const microFocusX = width / 2 - activePosX;
    const microFocusY = height / 2 - activePosY;

    const originX = macroFocusX * (1 - zoomLevel) + microFocusX * zoomLevel;
    const originY = macroFocusY * (1 - zoomLevel) + microFocusY * zoomLevel;

    // memory lookup by year & week index
    const memoryWeekMap = new Map();
    memories.forEach((m) => {
      const diffMs = m.timestamp - birthTimestamp;
      const weekIdx = Math.floor(diffMs / (7 * MS_PER_DAY));
      if (weekIdx >= 0 && weekIdx < totalWeeks) {
        memoryWeekMap.set(weekIdx, m);
      }
    });

    const dotRadius = Math.max(1.0, Math.min(4.5, 1.3 * (0.85 + zoomLevel * 1.4)));

    // 1. Draw top calendar month headers (JAN - DEC)
    ctx.font = "8px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const monthColStep = 52 / 12;

    for (let m = 0; m < 12; m++) {
      const colX = originX + (m * monthColStep + monthColStep / 2) * spacing;
      const colY = originY - 8;
      if (colX >= 20 && colX <= width - 20 && colY >= 20 && colY <= height - 20) {
        ctx.fillStyle = "#333333";
        ctx.fillText(MONTH_NAMES[m], colX, colY);
      }
    }

    // 2. Draw decade horizontal guide lines & left axis decade numbers
    ctx.font = "9px ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let r = 0; r <= rows; r += 10) {
      const y = originY + r * spacing;
      if (y >= 40 && y <= height - 40) {
        // decade label
        const isCurrentDecade = currentYearRow >= r && currentYearRow < r + 10;
        ctx.fillStyle = isCurrentDecade ? "#ffffff" : "#444444";
        ctx.fillText(`AGE ${String(r).padStart(2, "0")}`, originX - 16, y);

        // subtle decade divider rule
        ctx.strokeStyle = isCurrentDecade ? "rgba(255, 51, 51, 0.25)" : "#121212";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(originX - 8, y);
        ctx.lineTo(originX + gridWidth + 8, y);
        ctx.stroke();
      }
    }

    // 3. Batch draw future unlived weeks (faint, ghosted stars)
    ctx.fillStyle = "#161616";
    for (let i = elapsedWeeksTotal + 1; i < totalWeeks; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = originX + col * spacing;
      const y = originY + row * spacing;

      if (x < -10 || x > width + 10 || y < -10 || y > height + 10) continue;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Batch draw past lived weeks (solid graphite / soft white depth)
    for (let i = 0; i < elapsedWeeksTotal; i++) {
      if (memoryWeekMap.has(i)) continue;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = originX + col * spacing;
      const y = originY + row * spacing;

      if (x < -10 || x > width + 10 || y < -10 || y > height + 10) continue;

      // recent years are subtly brighter than distant childhood
      const ageRatio = row / Math.max(1, currentYearRow);
      const alpha = 0.35 + ageRatio * 0.45;
      ctx.fillStyle = `rgba(180, 180, 180, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Draw memories as prominent ruby beacons
    memoryWeekMap.forEach((mem, weekIdx) => {
      const col = weekIdx % cols;
      const row = Math.floor(weekIdx / cols);
      const x = originX + col * spacing;
      const y = originY + row * spacing;

      if (x >= -10 && x <= width + 10 && y >= -10 && y <= height + 10) {
        // memory ruby core
        ctx.fillStyle = "#ff3333";
        ctx.beginPath();
        ctx.arc(x, y, dotRadius + 1.2, 0, Math.PI * 2);
        ctx.fill();

        // diamond halo reticle
        ctx.strokeStyle = "rgba(255, 51, 51, 0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.strokeRect(x - dotRadius - 2, y - dotRadius - 2, (dotRadius + 2) * 2, (dotRadius + 2) * 2);
      }
    });

    // 6. Draw active current week/day point with dynamic temporal pulse
    const activeX = originX + currentWeekCol * spacing;
    const activeY = originY + currentYearRow * spacing;

    const nowMs = Date.now();
    const secondFraction = (nowMs % 1000) / 1000;
    const ringRadius = (dotRadius + 3) + (1 - secondFraction) * 6;

    // pulsating wave
    ctx.strokeStyle = `rgba(255, 51, 51, ${Math.max(0, 1 - secondFraction)})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(activeX, activeY, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // active point core (bright white)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(activeX, activeY, Math.max(2.5, dotRadius + 1.2), 0, Math.PI * 2);
    ctx.fill();

    // active crosshair reticle
    ctx.strokeStyle = "rgba(255, 51, 51, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(activeX - 12, activeY);
    ctx.lineTo(activeX + 12, activeY);
    ctx.moveTo(activeX, activeY - 12);
    ctx.lineTo(activeX, activeY + 12);
    ctx.stroke();

    // 7. Hover hit testing
    this.hoveredPoint = null;
    if (mousePos && mousePos.x !== null) {
      const relX = mousePos.x - originX;
      const relY = mousePos.y - originY;

      const hoverCol = Math.round(relX / spacing);
      const hoverRow = Math.round(relY / spacing);

      if (hoverCol >= 0 && hoverCol < cols && hoverRow >= 0 && hoverRow < rows) {
        const hoverIdx = hoverRow * cols + hoverCol;
        if (hoverIdx >= 0 && hoverIdx < totalWeeks) {
          const pointX = originX + hoverCol * spacing;
          const pointY = originY + hoverRow * spacing;
          const dist = Math.hypot(mousePos.x - pointX, mousePos.y - pointY);

          if (dist < spacing * 1.5) {
            const pointTimestamp = birthTimestamp + hoverIdx * (7 * MS_PER_DAY);
            const isCurrent = hoverIdx === elapsedWeeksTotal;
            const isPast = hoverIdx < elapsedWeeksTotal;

            this.hoveredPoint = {
              index: hoverIdx,
              year: hoverRow,
              week: hoverCol + 1,
              x: pointX,
              y: pointY,
              timestamp: pointTimestamp,
              isNow: isCurrent,
              isPast,
              memory: memoryWeekMap.get(hoverIdx) || null
            };

            // hover square reticle box
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            const reticleSize = dotRadius * 2 + 8;
            ctx.strokeRect(pointX - reticleSize / 2, pointY - reticleSize / 2, reticleSize, reticleSize);

            // subtle axis projection lines
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.beginPath();
            ctx.moveTo(originX - 10, pointY);
            ctx.lineTo(pointX - reticleSize / 2, pointY);
            ctx.moveTo(pointX, originY - 10);
            ctx.lineTo(pointX, pointY - reticleSize / 2);
            ctx.stroke();
          }
        }
      }
    }
  }
}
