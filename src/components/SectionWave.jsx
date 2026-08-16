import { useEffect, useRef } from "react";
export default function SectionWave({ accent, speed = 1, complexity = 1, height = 48 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0, raf;
    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.strokeStyle = accent; ctx.lineWidth = 1.5;
      ctx.shadowBlur = 18; ctx.shadowColor = accent; ctx.globalAlpha = 0.45;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h/2 + Math.sin(x*0.018*complexity+t*speed)*h*0.3 + Math.sin(x*0.045*complexity+t*speed*1.6)*h*0.12 + Math.sin(x*0.009*complexity+t*speed*0.7)*h*0.1;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.restore();
      ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.shadowBlur = 0; ctx.globalAlpha = 0.7;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h/2 + Math.sin(x*0.018*complexity+t*speed)*h*0.3 + Math.sin(x*0.045*complexity+t*speed*1.6)*h*0.12 + Math.sin(x*0.009*complexity+t*speed*0.7)*h*0.1;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.globalAlpha = 1; t += 0.025; raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [accent, speed, complexity]);
  return <canvas ref={ref} width={1200} height={height}
    style={{ width: "100%", height, display: "block", pointerEvents: "none", opacity: 0.55 }} />;
}
