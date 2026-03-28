import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SYN } from "../constants/syn";

// ── Breathing SynGrid background ────────────────────────────────────────────
function BreathingGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let t = 0;

    const synColors = Object.values(SYN);
    const digits = "0123456789";

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = 22;
    const rows = 10;

    // Pre-assign stable digits and colors to each cell
    const grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        digit: digits[Math.floor(Math.random() * digits.length)],
        color: synColors[Math.floor(Math.random() * synColors.length)],
        offset: Math.random() * Math.PI * 2, // phase offset for breathing
        speed: 0.3 + Math.random() * 0.4,
      }))
    );
    const draw = (now) => {
      t = now * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
      ctx.font = `${Math.min(cellW, cellH) * 0.55}px 'Space Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[r][c];
          // Slow organic breathing per cell — sin with unique phase & speed
          const breath = (Math.sin(t * cell.speed + cell.offset) + 1) / 2; // 0→1
          const alpha = 0.08 + breath * 0.22; // range 0.08–0.30
          ctx.fillStyle = cell.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
          ctx.fillText(cell.digit, (c + 0.5) * cellW, (r + 0.5) * cellH);
        }
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}

// ── Portal card ──────────────────────────────────────────────────────────────
function Portal({ to, label, sub, color, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={to}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ textDecoration: "none" }}
      >
        <motion.div
          animate={{
            borderColor: hovered ? color : color + "33",
            boxShadow: hovered ? `0 0 40px ${color}28, 0 0 0 1px ${color}44` : "none",
            y: hovered ? -4 : 0,
          }}
          transition={{ duration: 0.25 }}
          style={{
            padding: "28px 40px",
            borderRadius: 14,
            border: `1px solid ${color}33`,
            background: hovered ? color + "0d" : "transparent",
            cursor: "pointer",
            minWidth: 180,
            textAlign: "center",
          }}
        >
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: 5,
            color: hovered ? color : color + "99",
            marginBottom: 8,
            transition: "color 0.25s",
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(11px, 1.5vw, 13px)",
            color: "#444",
            letterSpacing: 1,
          }}>
            {sub}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing() {
  // Slow breathing pulse for the name
  const [breathScale, setBreathScale] = useState(1);
  useEffect(() => {
    let raf;
    const tick = (t) => {
      // Very subtle — 1.000 to 1.004, 8-second cycle
      setBreathScale(1 + Math.sin(t * 0.001 * 0.8) * 0.004);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const portals = [
    { to: "/work", label: "WORK", sub: "portfolio & archive", color: SYN["7"] },
    { to: "/lab",  label: "LAB",  sub: "tools in progress",  color: SYN["4"] },
    { to: "/about", label: "ABOUT", sub: "who I am",         color: SYN["2"] },
  ];

  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      background: "var(--bg)",
    }}>
      <BreathingGrid />

      {/* Radial gradient vignette so grid fades at edges */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 30%, var(--bg) 80%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        textAlign: "center",
        padding: "0 24px",
        maxWidth: 700,
        width: "100%",
      }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10, letterSpacing: 6,
            color: SYN["0"] + "99",
            marginBottom: 24,
          }}
        >
          CREATIVE TECHNOLOGIST · ANIMATOR · EDUCATOR
        </motion.div>

        {/* Name — breathing */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(52px, 11vw, 110px)",
            fontWeight: 400,
            lineHeight: 1.0,
            margin: "0 0 12px",
            color: "var(--text)",
            transform: `scale(${breathScale})`,
            transformOrigin: "center",
            letterSpacing: "-0.02em",
          }}
        >
          {/* MOOK spelled out in synesthetic color */}
          {"MOOK".split("").map((char, i) => (
            <span key={i} style={{ color: [SYN["3"], SYN["8"], SYN["8"], SYN["2"]][i] }}>
              {char}
            </span>
          ))}
          {" "}
          <span style={{ color: "var(--text-muted)" }}>DiMarco</span>
        </motion.h1>

        {/* Thin SYN color bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", height: 2, margin: "0 auto 48px", maxWidth: 320, transformOrigin: "left" }}
        >
          {Object.entries(SYN).map(([d, c]) => (
            <div key={d} style={{ flex: 1, background: c }} />
          ))}
        </motion.div>

        {/* Portal cards */}
        <div style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          {portals.map((p, i) => (
            <Portal key={p.to} {...p} delay={0.9 + i * 0.12} />
          ))}
        </div>

        {/* Quiet footer line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          style={{
            marginTop: 64,
            fontFamily: "'Space Mono', monospace",
            fontSize: 9, letterSpacing: 3,
            color: "var(--text-dim)",
          }}
        >
          BOSTON, MA
        </motion.div>

      </div>
    </div>
  );
}