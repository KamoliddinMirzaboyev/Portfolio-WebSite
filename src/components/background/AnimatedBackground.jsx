import { useEffect, useRef } from "react";
import "./AnimatedBackground.css";
import { useTheme } from "../../theme/ThemeContext";

function readThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    bg: styles.getPropertyValue("--canvas-bg").trim() || "#050506",
    grid: styles.getPropertyValue("--grid-line").trim() || "rgba(160,160,170,0.22)",
    bolt: styles.getPropertyValue("--bolt").trim() || "255, 255, 255",
  };
}

function AnimatedBackground() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let cell = 40;
    let cols = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    let bolts = [];
    let nextBoltAt = 0.8;
    let time = 0;
    let colors = readThemeColors();

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = wrap.clientWidth || window.innerWidth;
      h = wrap.clientHeight || window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cell = window.innerWidth < 768 ? 32 : 40;
      cols = Math.ceil(w / cell) + 1;
      rows = Math.ceil(h / cell) + 1;
      offsetX = (w - (cols - 1) * cell) / 2;
      offsetY = (h - (rows - 1) * cell) / 2;
      colors = readThemeColors();
    };

    const spawnBolt = () => {
      const col = Math.floor(Math.random() * cols);
      const x = offsetX + col * cell;
      const down = Math.random() > 0.35;
      const speed = 380 + Math.random() * 420;
      const len = 50 + Math.random() * 90;

      bolts.push({
        x,
        y: down ? -len : h + len,
        vy: down ? speed : -speed,
        len,
        life: 0,
        maxLife: 1.1 + Math.random() * 0.7,
        width: 1.4 + Math.random() * 1.1,
      });
    };

    let last = performance.now();

    const drawGrid = () => {
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < cols; i++) {
        const x = Math.round(offsetX + i * cell) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let j = 0; j < rows; j++) {
        const y = Math.round(offsetY + j * cell) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    };

    const draw = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      time += dt;

      // theme o'zgarganda ranglarni yangilash
      colors = readThemeColors();

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      drawGrid();

      const bolt = colors.bolt;

      if (!prefersReduced) {
        if (time >= nextBoltAt) {
          spawnBolt();
          if (Math.random() > 0.72) spawnBolt();
          nextBoltAt = time + 1.8 + Math.random() * 3.8;
        }

        for (let i = bolts.length - 1; i >= 0; i--) {
          const b = bolts[i];
          b.life += dt;
          b.y += b.vy * dt;
          const t = b.life / b.maxLife;
          if (t >= 1 || b.y < -b.len * 2 || b.y > h + b.len * 2) {
            bolts.splice(i, 1);
            continue;
          }
          const fade = t < 0.12 ? t / 0.12 : t > 0.65 ? (1 - t) / 0.35 : 1;
          const goingDown = b.vy > 0;
          const headY = b.y;
          const tailY = goingDown ? b.y - b.len : b.y + b.len;
          const grad = ctx.createLinearGradient(b.x, tailY, b.x, headY);
          grad.addColorStop(0, `rgba(${bolt},0)`);
          grad.addColorStop(0.45, `rgba(${bolt},${0.28 * fade})`);
          grad.addColorStop(1, `rgba(${bolt},${0.95 * fade})`);
          ctx.beginPath();
          ctx.moveTo(b.x, tailY);
          ctx.lineTo(b.x, headY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = b.width;
          ctx.lineCap = "round";
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(b.x, tailY);
          ctx.lineTo(b.x, headY);
          ctx.strokeStyle = `rgba(${bolt},${0.12 * fade})`;
          ctx.lineWidth = b.width + 4;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(b.x, headY, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${bolt},${fade})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    last = performance.now();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <div className="animated-bg" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} className="scene-canvas" />
    </div>
  );
}

export default AnimatedBackground;
