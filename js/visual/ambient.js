// smooth ambient dark void with subtle cursor radial depth (no dirty noise or specs)

export class AmbientBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.targetMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    this.initEvents();
    this.resize();
  }

  initEvents() {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (e) => {
      this.targetMouse.x = e.clientX;
      this.targetMouse.y = e.clientY;
    });
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  render() {
    // smooth camera lerp
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.04;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.04;

    // clean base obsidian void
    this.ctx.fillStyle = "#050508";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // ultra subtle ambient glow following cursor
    const glowRadius = Math.max(500, Math.min(this.width, this.height) * 0.7);
    const mouseGlow = this.ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, glowRadius
    );
    mouseGlow.addColorStop(0, "rgba(25, 27, 36, 0.45)");
    mouseGlow.addColorStop(0.5, "rgba(12, 13, 18, 0.2)");
    mouseGlow.addColorStop(1, "rgba(5, 5, 8, 0)");

    this.ctx.fillStyle = mouseGlow;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
