// Mode C: The Orbit - concentric Keplerian time spheres
export class LifeOrbit {
  constructor() {
    this.hoveredPoint = null;
  }

  // render astronomical concentric time orbits
  render(ctx, width, height, snapshot, zoomLevel, memories, mousePos) {
    const { birthTimestamp, ratios, breakdown, expectedYears } = snapshot;
    if (!birthTimestamp) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.38 * (0.85 + zoomLevel * 0.55);

    const rLife = maxRadius;
    const rYear = maxRadius * 0.68;
    const rDay = maxRadius * 0.36;

    // 1. Life Ring (outer orbit: macro lifespan)
    ctx.strokeStyle = "#161616";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, rLife, 0, Math.PI * 2);
    ctx.stroke();

    // Life ring graduation ticks (every 10 years)
    for (let yr = 0; yr <= expectedYears; yr += 10) {
      const angle = -Math.PI / 2 + (yr / expectedYears) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle) * (rLife - 4);
      const y1 = centerY + Math.sin(angle) * (rLife - 4);
      const x2 = centerX + Math.cos(angle) * (rLife + 4);
      const y2 = centerY + Math.sin(angle) * (rLife + 4);
      ctx.strokeStyle = yr <= breakdown.totalAgeYears ? "#333333" : "#161616";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Life progress arc
    const lifeAngle = -Math.PI / 2 + ratios.life * Math.PI * 2;
    ctx.strokeStyle = "#444444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, rLife, -Math.PI / 2, lifeAngle);
    ctx.stroke();

    // 2. Year Ring (middle orbit: annual solar cycle)
    ctx.strokeStyle = "#141414";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, rYear, 0, Math.PI * 2);
    ctx.stroke();

    // Solstice & Equinox 4 cardinal markers
    for (let i = 0; i < 4; i++) {
      const angle = -Math.PI / 2 + (i / 4) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle) * (rYear - 3);
      const y1 = centerY + Math.sin(angle) * (rYear - 3);
      const x2 = centerX + Math.cos(angle) * (rYear + 3);
      const y2 = centerY + Math.sin(angle) * (rYear + 3);
      ctx.strokeStyle = "#282828";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    const yearAngle = -Math.PI / 2 + ratios.year * Math.PI * 2;
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, rYear, -Math.PI / 2, yearAngle);
    ctx.stroke();

    // 3. Day Ring (inner orbit: diurnal 24-hour cycle)
    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, rDay, 0, Math.PI * 2);
    ctx.stroke();

    const dayAngle = -Math.PI / 2 + ratios.day * Math.PI * 2;
    ctx.strokeStyle = "#ff3333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, rDay, -Math.PI / 2, dayAngle);
    ctx.stroke();

    // 4. Celestial orbital bodies
    // Life body (White)
    const lifeX = centerX + Math.cos(lifeAngle) * rLife;
    const lifeY = centerY + Math.sin(lifeAngle) * rLife;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(lifeX, lifeY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Year body (Silver)
    const yearX = centerX + Math.cos(yearAngle) * rYear;
    const yearY = centerY + Math.sin(yearAngle) * rYear;
    ctx.fillStyle = "#aaaaaa";
    ctx.beginPath();
    ctx.arc(yearX, yearY, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Day body with real-time breathing pulse (Razor red)
    const dayX = centerX + Math.cos(dayAngle) * rDay;
    const dayY = centerY + Math.sin(dayAngle) * rDay;

    const secondFraction = (Date.now() % 1000) / 1000;
    ctx.strokeStyle = `rgba(255, 51, 51, ${1 - secondFraction})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(dayX, dayY, 4 + (1 - secondFraction) * 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ff3333";
    ctx.beginPath();
    ctx.arc(dayX, dayY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Central gravitational horizon node
    ctx.fillStyle = "#333333";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 6. Hover detection
    this.hoveredPoint = null;
    if (mousePos && mousePos.x !== null) {
      const distFromCenter = Math.hypot(mousePos.x - centerX, mousePos.y - centerY);
      if (Math.abs(distFromCenter - rLife) < 16) {
        this.hoveredPoint = {
          x: mousePos.x,
          y: mousePos.y,
          timestamp: Date.now(),
          isNow: true,
          label: `LIFE SPHERE: ${(ratios.life * 100).toFixed(1)}%`
        };
      } else if (Math.abs(distFromCenter - rYear) < 16) {
        this.hoveredPoint = {
          x: mousePos.x,
          y: mousePos.y,
          timestamp: Date.now(),
          isNow: true,
          label: `SOLAR YEAR: ${(ratios.year * 100).toFixed(1)}%`
        };
      } else if (Math.abs(distFromCenter - rDay) < 16) {
        this.hoveredPoint = {
          x: mousePos.x,
          y: mousePos.y,
          timestamp: Date.now(),
          isNow: true,
          label: `DIURNAL DAY: ${(ratios.day * 100).toFixed(1)}%`
        };
      }
    }
  }
}
