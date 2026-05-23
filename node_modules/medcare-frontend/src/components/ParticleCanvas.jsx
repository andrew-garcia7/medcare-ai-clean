import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', onResize);

    // 🔥 Particles
    const parts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      life: 0,
      maxLife: 200 + Math.random() * 400,
      col: Math.random() < 0.6 ? 'rgba(0,212,180,' : 'rgba(79,156,249,',
    }));

    let t = 0;
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.0007;

      // 🔥 Glow orbs
      const orbs = [
        { x: 0.15, y: 0.3, r: 180, c: 'rgba(0,212,180,0.018)' },
        { x: 0.8, y: 0.2, r: 240, c: 'rgba(79,156,249,0.015)' },
        { x: 0.5, y: 0.72, r: 200, c: 'rgba(0,212,180,0.013)' },
      ];

      orbs.forEach((o) => {
        const ox = (o.x + Math.sin(t) * 0.04) * W;
        const oy = (o.y + Math.cos(t) * 0.04) * H;

        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, o.c);
        g.addColorStop(1, 'transparent');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 🔥 Grid dots
      ctx.fillStyle = 'rgba(255,255,255,0.016)';
      for (let x = 0; x < W; x += 60) {
        for (let y = 0; y < H; y += 60) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 🔥 Particles
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (
          p.life > p.maxLife ||
          p.x < 0 ||
          p.x > W ||
          p.y < 0 ||
          p.y > H
        ) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.life = 0;
        }

        const a =
          p.life < 50
            ? p.life / 50
            : p.life > p.maxLife - 50
            ? (p.maxLife - p.life) / 50
            : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col + a * 0.4 + ')';
        ctx.fill();
      });

      // 🔥 Lines
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const dx = parts[i].x - parts[j].x;
          const dy = parts[i].y - parts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < 70) {
            ctx.beginPath();
            ctx.moveTo(parts[i].x, parts[i].y);
            ctx.lineTo(parts[j].x, parts[j].y);
            ctx.strokeStyle = `rgba(0,212,180,${
              (1 - d / 70) * 0.06
            })`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}