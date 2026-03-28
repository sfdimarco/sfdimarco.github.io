import { useEffect, useRef } from "react";
export default function Waveform({ accent }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0, raf;
    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = accent; ctx.lineWidth = 2;
      ctx.shadowBlur = 10; ctx.shadowColor = accent;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h/2 + Math.sin(x*0.03+t)*h*0.28 + Math.sin(x*0.07+t*1.7)*h*0.1 + Math.sin(x*0.015+t*0.5)*h*0.08;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); t += 0.04; raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [accent]);
  return <canvas ref={ref} width={700} height={64}
    style={{ width: "100%", height: 64, borderRadius: 8, background: accent + "0a" }} />;
}
