// 52-week per year life canvas renderer (Compact square-grid tapestry)

export class LifeMatrixRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    window.addEventListener("resize", () => this.resize());
    this.resize();
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
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

    // Pure obsidian background
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (!snapshot.birthTimestamp) return;

    const cols = 52;
    const rows = expectedYears || 80;
    const totalWeeks = cols * rows;

    const elapsedWeeksTotal = Math.min(totalWeeks, Math.max(0, Math.floor(breakdown.totalDays / 7)));
    const currentYearRow = Math.min(rows - 1, Math.floor(breakdown.totalAgeYears));
    const currentWeekCol = Math.min(cols - 1, Math.floor((breakdown.totalAgeYears - currentYearRow) * cols));

    const paddingLeft = 24;
    const paddingRight = 8;
    const paddingTop = 12;
    const paddingBottom = 12;

    const availableW = this.width - paddingLeft - paddingRight;
    const availableH = this.height - paddingTop - paddingBottom;

    // Strict square aspect ratio: stepX equals stepY
    const step = Math.min(availableW / (cols - 1 || 1), availableH / (rows - 1 || 1));
    const stepX = step;
    const stepY = step;

    // Center grid inside available space
    const gridW = (cols - 1) * stepX;
    const gridH = (rows - 1) * stepY;
    const startX = paddingLeft + (availableW - gridW) / 2;
    const startY = paddingTop + (availableH - gridH) / 2;

    const dotRadius = Math.max(0.6, Math.min(1.8, step * 0.35));

    // 1. Decade labels on left
    this.ctx.font = "8px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";

    for (let r = 0; r <= rows; r += 10) {
      const y = startY + r * stepY;
      const isCurrentDecade = currentYearRow >= r && currentYearRow < r + 10;
      this.ctx.fillStyle = isCurrentDecade ? "#ffffff" : "#3f3f46";
      this.ctx.fillText(`${r}`, startX - 6, y);
    }

    // 2. Future unlived weeks (barely visible faint points)
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
    for (let i = elapsedWeeksTotal + 1; i < totalWeeks; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * stepX;
      const y = startY + row * stepY;

      this.ctx.beginPath();
      this.ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 3. Past lived weeks (dense solid texture)
    for (let i = 0; i < elapsedWeeksTotal; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * stepX;
      const y = startY + row * stepY;

      const ageRatio = row / Math.max(1, currentYearRow);
      const alpha = 0.22 + ageRatio * 0.3;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 4. Active Present Week
    const activeX = startX + currentWeekCol * stepX;
    const activeY = startY + currentYearRow * stepY;

    const nowMs = Date.now();
    const secondFraction = (nowMs % 1000) / 1000;
    const ringRadius = (dotRadius + 1.2) + (1 - secondFraction) * 2.8;

    this.ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - secondFraction) * 0.7})`;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(activeX, activeY, ringRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(activeX, activeY, dotRadius + 0.6, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
