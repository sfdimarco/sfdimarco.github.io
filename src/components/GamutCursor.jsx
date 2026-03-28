import { useEffect, useRef } from "react";
import { SYN } from "../constants/syn";
export default function GamutCursor() {
  const canvasRef = useRef(null);
  const state = useRef({ mx: 0, my: 0, ripples: [], t: 0 });
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const synColors = Object.values(SYN);
    const RING_R = 18, SEGS = synColors.length;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const onMove = e => { state.current.mx = e.clientX; state.current.my = e.clientY; };
    const onClick = e => { state.current.ripples.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 60, alpha: 0.7 }); };
    window.addEventListener("mousemove", onMove); window.addEventListener("click", onClick);
    let raf;
    const draw = () => {
      const { mx, my, ripples } = state.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = ripples.length-1; i >= 0; i--) {
        const rp = ripples[i]; rp.r += 3; rp.alpha -= 0.025;
        if (rp.alpha <= 0) { ripples.splice(i,1); continue; }
        const seg = Math.floor((rp.r / rp.maxR) * SEGS) % SEGS;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
        ctx.strokeStyle = synColors[seg]; ctx.lineWidth = 2; ctx.globalAlpha = rp.alpha;
        ctx.shadowBlur = 10; ctx.shadowColor = synColors[seg]; ctx.stroke();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
      for (let i = 0; i < SEGS; i++) {
        const angle = (i/SEGS)*Math.PI*2 + state.current.t;
        const nextAngle = ((i+1)/SEGS)*Math.PI*2 + state.current.t;
        ctx.beginPath(); ctx.arc(mx, my, RING_R, angle, nextAngle);
        ctx.strokeStyle = synColors[i]; ctx.lineWidth = 3;
        ctx.shadowBlur = 8; ctx.shadowColor = synColors[i]; ctx.globalAlpha = 0.9;
        ctx.stroke(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
      ctx.beginPath(); ctx.arc(mx, my, 2, 0, Math.PI*2);
      ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1;
      state.current.t += 0.04; raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove); window.removeEventListener("click", onClick); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999 }} />;
}
