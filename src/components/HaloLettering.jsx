import { useEffect, useRef, useState } from "react";
import { c7UText, c7UWidth } from "../lib/haloHand";

// The visible Canvas is decorative; the original string stays in HTML.
export default function HaloLettering({ text, cap = 64, animate = false, className = "" }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const width = c7UWidth(text, 100) + 24;
  const height = 142;
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || typeof Path2D === "undefined") return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame, last = -Infinity;
    const draw = (time = 0) => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(width * scale);
      canvas.height = Math.ceil(height * scale);
      ctx.scale(scale, scale);
      c7UText(ctx, text, 12, 116, 100, { col: "#211e24", seed: 17, t: time, whim: 0.9 });
      setReady(true);
    };
    const tick = (ms) => {
      if (ms - last >= 1000 / 7.5) { draw(ms / 1000); last = ms; }
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      draw(0);
      if (animate && !motion.matches) frame = requestAnimationFrame(tick);
    };
    update();
    motion.addEventListener("change", update);
    return () => { cancelAnimationFrame(frame); motion.removeEventListener("change", update); };
  }, [text, width, animate]);
  return (
    <span className={`halo-lettering ${className}`} style={{ width: width * cap / 100 }} data-ready={ready}>
      <span className="halo-fallback">{text}</span>
      <canvas ref={ref} aria-hidden="true" style={{ aspectRatio: `${width} / ${height}` }} />
    </span>
  );
}
