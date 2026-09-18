// clean 52-week per year life canvas renderer with crisp Swiss typography

export function getLifeEra(age) {
  if (age < 4) return { name: "Infancy", desc: "Dawn of being" };
  if (age < 13) return { name: "Childhood", desc: "Wonder & discovery" };
  if (age < 20) return { name: "Adolescence", desc: "Awakening & growth" };
  if (age < 30) return { name: "Early Adulthood", desc: "Forging path & purpose" };
  if (age < 46) return { name: "Prime", desc: "Creation, craft & resolve" };
  if (age < 61) return { name: "Mastery", desc: "Perspective & harvest" };
  if (age < 76) return { name: "Elderhood", desc: "Wisdom & legacy" };
  return { name: "Winter Years", desc: "Twilight & reflection" };
}

export class LifeMatrixRenderer {
  constructor(canvasElement, onHoverCallback) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d", { alpha: true });
    this.onHover = onHoverCallback;

    this.mousePos = { x: null, y: null };
    this.hoveredPoint = null;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.initEvents();
    this.resize();
  }

  initEvents() {
    window.addEventListener("resize", () => this.resize());

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mousePos.x = null;
      this.mousePos.y = null;
      this.hoveredPoint = null;
      if (this.onHover) this.onHover(null);
    });
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = Math.max(10, rect.width);
    this.height = Math.max(10, rect.height);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  render(snapshot) {
    const { expectedYears, breakdown } = snapshot;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (!snapshot.birthTimestamp) return;

    const cols = 52;
    const rows = expectedYears || 80;
    const totalWeeks = cols * rows;

    const elapsedWeeksTotal = Math.min(totalWeeks, Math.max(0, Math.floor(breakdown.totalDays / 7)));
    const currentYearRow = Math.min(rows - 1, Math.floor(breakdown.totalAgeYears));
    const currentWeekCol = Math.min(cols - 1, Math.floor((breakdown.totalAgeYears - currentYearRow) * cols));

    const paddingLeft = 24;
    const paddingRight = 8;
    const paddingTop = 8;
    const paddingBottom = 8;

    const availableW = this.width - paddingLeft - paddingRight;
    const availableH = this.height - paddingTop - paddingBottom;

    // keep square dot grid
    const step = Math.min(availableW / (cols - 1 || 1), availableH / (rows - 1 || 1));
    const stepX = step;
    const stepY = step;

    const gridW = (cols - 1) * stepX;
    const gridH = (rows - 1) * stepY;
    const startX = paddingLeft + (availableW - gridW) / 2;
    const startY = paddingTop + (availableH - gridH) / 2;

    const dotRadius = Math.max(1.0, Math.min(2.0, step * 0.35));

    // 1. clean decade markers
    this.ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";

    for (let r = 0; r <= rows; r += 10) {
      const y = startY + r * stepY;
      const isCurrentDecade = currentYearRow >= r && currentYearRow < r + 10;
      this.ctx.fillStyle = isCurrentDecade ? "#ffffff" : "rgba(161, 161, 170, 0.4)";
      this.ctx.fillText(`${r}`, startX - 7, y);
    }

    // 2. future unlived weeks
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    for (let i = elapsedWeeksTotal + 1; i < totalWeeks; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * stepX;
      const y = startY + row * stepY;

      this.ctx.beginPath();
      this.ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 3. past lived weeks (crisp bone white)
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    for (let i = 0; i < elapsedWeeksTotal; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * stepX;
      const y = startY + row * stepY;

      this.ctx.beginPath();
      this.ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 4. active present week (clean white core with crisp subtle pulse)
    const activeX = startX + currentWeekCol * stepX;
    const activeY = startY + currentYearRow * stepY;
    const nowMs = Date.now();

    // subtle breathing ring
    const pulsePhase = (nowMs % 2000) / 2000;
    const ringRadius = dotRadius + pulsePhase * 7;
    const ringAlpha = (1 - pulsePhase) * 0.7;

    this.ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(activeX, activeY, ringRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    // core active dot
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(activeX, activeY, dotRadius + 1, 0, Math.PI * 2);
    this.ctx.fill();

    // 5. hover inspection
    this.hoveredPoint = null;
    if (this.mousePos.x !== null && this.mousePos.y !== null) {
      const relX = this.mousePos.x - startX;
      const relY = this.mousePos.y - startY;

      const hoverCol = Math.round(relX / stepX);
      const hoverRow = Math.round(relY / stepY);

      if (hoverCol >= 0 && hoverCol < cols && hoverRow >= 0 && hoverRow < rows) {
        const hoverIdx = hoverRow * cols + hoverCol;
        if (hoverIdx >= 0 && hoverIdx < totalWeeks) {
          const ptX = startX + hoverCol * stepX;
          const ptY = startY + hoverRow * stepY;
          const dist = Math.hypot(this.mousePos.x - ptX, this.mousePos.y - ptY);

          if (dist < Math.max(stepX, stepY) * 1.5) {
            const era = getLifeEra(hoverRow);
            this.hoveredPoint = {
              ageYear: hoverRow,
              weekNum: hoverCol + 1,
              isNow: hoverIdx === elapsedWeeksTotal,
              isPast: hoverIdx < elapsedWeeksTotal,
              eraName: era.name,
              eraDesc: era.desc,
              x: ptX,
              y: ptY
            };

            // clean minimalist reticle
            this.ctx.strokeStyle = "#ffffff";
            this.ctx.lineWidth = 1;
            const box = dotRadius * 2 + 5;
            this.ctx.strokeRect(ptX - box / 2, ptY - box / 2, box, box);
          }
        }
      }
    }

    if (this.onHover) {
      this.onHover(this.hoveredPoint);
    }
  }
}
