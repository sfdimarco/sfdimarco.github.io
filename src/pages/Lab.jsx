import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SYN } from "../constants/syn";
import Tag from "../components/Tag";

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const palette = {
    DEV:   { bg: SYN["1"] + "18", border: SYN["1"] + "55", color: SYN["1"] },
    BETA:  { bg: SYN["3"] + "18", border: SYN["3"] + "55", color: SYN["3"] },
    READY: { bg: SYN["4"] + "18", border: SYN["4"] + "55", color: SYN["4"] },
  };
  const p = palette[status] || palette.DEV;
  return (
    <span style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: 9, letterSpacing: 3,
      padding: "3px 10px", borderRadius: 3,
      background: p.bg, border: `1px solid ${p.border}`, color: p.color,
    }}>
      {status === "DEV" ? "● DEV" : status === "BETA" ? "◐ BETA" : "✓ READY"}
    </span>
  );
}

// ── SynPaintCanvas (inline experiment) ───────────────────────────────────────
function SynPaintCanvas() {
  const canvasRef = useRef(null);
  const state = useRef({ painting: false, last: null });
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      const img = canvas.toDataURL();
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0);
      image.src = img;
    };
    resize();
    const synColors = Object.values(SYN);
    const getColor = (x) => {
      const idx = Math.floor((x / canvas.width) * synColors.length);
      return synColors[Math.min(idx, synColors.length - 1)];
    };
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return e.touches
        ? { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
        : { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };    const startPaint = (e) => { e.preventDefault(); state.current.painting = true; state.current.last = getPos(e); };
    const paint = (e) => {
      e.preventDefault();
      if (!state.current.painting) return;
      const pos = getPos(e);
      const color = getColor(pos.x);
      const pressure = e.pressure || 0.5;
      ctx.beginPath();
      ctx.moveTo(state.current.last.x, state.current.last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 + pressure * 12;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.shadowBlur = 8; ctx.shadowColor = color;
      ctx.globalAlpha = 0.75 + pressure * 0.25;
      ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      state.current.last = pos;
    };
    const stopPaint = () => { state.current.painting = false; };
    canvas.addEventListener("mousedown", startPaint);
    canvas.addEventListener("mousemove", paint);
    canvas.addEventListener("mouseup", stopPaint);
    canvas.addEventListener("mouseleave", stopPaint);
    canvas.addEventListener("touchstart", startPaint, { passive: false });
    canvas.addEventListener("touchmove", paint, { passive: false });
    canvas.addEventListener("touchend", stopPaint);
    return () => {
      canvas.removeEventListener("mousedown", startPaint);
      canvas.removeEventListener("mousemove", paint);
      canvas.removeEventListener("mouseup", stopPaint);
      canvas.removeEventListener("mouseleave", stopPaint);
      canvas.removeEventListener("touchstart", startPaint);
      canvas.removeEventListener("touchmove", paint);
      canvas.removeEventListener("touchend", stopPaint);
    };
  }, [cleared]);

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} style={{
        width: "100%", height: 280, display: "block",
        background: "#050505", borderRadius: 10,
        border: "1px solid #1a1a1a", cursor: "crosshair", touchAction: "none",
      }} />
      <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>0=cyan → 9=black</span>
        <button onClick={() => {
          const c = canvasRef.current;
          if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
          setCleared(x => !x);
        }} style={{
          background: "transparent", border: "1px solid #333", color: "#555",
          fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2,
          padding: "4px 10px", borderRadius: 4, cursor: "pointer",
        }}>CLEAR</button>
      </div>
    </div>
  );
}

// ── NumberRain (inline experiment) ────────────────────────────────────────────
function NumberRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const synColors = Object.values(SYN);
    const cols = Math.floor(canvas.width / 20);
    const drops = Array.from({ length: cols }, () => Math.random() * -canvas.height);
    let raf;
    const draw = () => {
      ctx.fillStyle = "rgba(5,5,5,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < cols; i++) {
        const digit = String(Math.floor(Math.random() * 10));
        const color = synColors[parseInt(digit)];
        ctx.fillStyle = color;
        ctx.font = "14px 'Space Mono', monospace";
        ctx.shadowBlur = 6; ctx.shadowColor = color;
        ctx.fillText(digit, i * 20, drops[i]);
        ctx.shadowBlur = 0;
        if (drops[i] > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 16;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      width: "100%", height: 240, display: "block",
      background: "#050505", borderRadius: 10, border: "1px solid #1a1a1a",
    }} />
  );
}

// ── Tool registry ─────────────────────────────────────────────────────────────
// status: "DEV" = active dev, "BETA" = mostly working, "READY" = move to showcase
const TOOLS = [
  {
    id: "robot-dog",
    title: "ROBOT DOG AI",
    tagline: "Neural Network / Three.js",
    accent: SYN["2"],
    status: "DEV",
    desc: "A robot dog learns to walk toward a bone using a simple neural network and evolutionary mutation. Watch the brain connections light up in real time. Three.js 3D world + canvas brain visualizer.",
    tags: ["Three.js", "Neural Network", "Evolutionary AI", "Educational"],
    type: "external",
    href: "/tools/robot-dog.html",
  },
  {
    id: "synpaint",
    title: "SYN PAINT",
    tagline: "Canvas / Synesthesia",
    accent: SYN["7"],
    status: "BETA",
    desc: "Draw on the canvas. Color is mapped left→right by the synesthesia number system: 0=cyan on the left, 9=near-black on the right. Pressure controls brush weight.",
    tags: ["Canvas", "Synesthesia", "Interactive", "Paint"],
    type: "inline",
    component: SynPaintCanvas,
  },
  {
    id: "rain",
    title: "NUMBER RAIN",
    tagline: "Canvas / Matrix",
    accent: SYN["4"],
    status: "BETA",
    desc: "A matrix-style rain of digits — each falling in its synesthetic color. Raw Canvas API, same building blocks as the MOOK SYNTH waveform.",
    tags: ["Canvas", "Synesthesia", "Animation"],
    type: "inline",
    component: NumberRain,
  },
  {
    id: "mook-synth",
    title: "MOOK SYNTH",
    tagline: "Web Audio API / React",
    accent: SYN["5"],
    status: "DEV",
    desc: "A browser-based music instrument built for 4th graders. Synesthetic color keys mapped to sound frequencies. Still has bugs — active development.",
    tags: ["Web Audio API", "React", "Educational", "Music"],
    type: "external",
    href: "/mook-synth.html",
  },
];

// ── Tool card ─────────────────────────────────────────────────────────────────
function ToolCard({ tool, i }) {
  const [open, setOpen] = useState(false);
  const Comp = tool.component;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
      style={{
        background: "var(--card-bg)",
        border: `1px solid ${open ? tool.accent + "44" : "var(--border)"}`,
        borderRadius: 14, overflow: "hidden",
        boxShadow: open ? `0 0 32px ${tool.accent}18` : "none",
        transition: "border 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Preview / component area */}
      {tool.type === "inline" && Comp && (
        <div style={{ pointerEvents: open ? "auto" : "none", opacity: open ? 1 : 0.5, transition: "opacity 0.3s" }}>
          <Comp />
        </div>
      )}

      {/* Top accent line */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, transparent, ${tool.accent}, transparent)`,
        opacity: open ? 1 : 0.3,
        transition: "opacity 0.3s",
      }} />

      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(16px, 2vw, 20px)", color: "var(--text)",
          }}>{tool.title}</div>
          <StatusBadge status={tool.status} />
        </div>

        <div style={{
          color: tool.accent, fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: 2, marginBottom: 10,
        }}>{tool.tagline}</div>

        <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.75, margin: "0 0 14px" }}>
          {tool.desc}
        </p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {tool.tags.map((t) => <Tag key={t} color={tool.accent}>{t}</Tag>)}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {tool.type === "inline" && (
            <button
              onClick={() => setOpen(!open)}
              style={{
                background: open ? tool.accent : "transparent",
                color: open ? "#000" : tool.accent,
                border: `1px solid ${tool.accent}`,
                fontFamily: "'Space Mono', monospace", fontWeight: 700,
                fontSize: 10, letterSpacing: 2,
                padding: "7px 18px", borderRadius: 6, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {open ? "◼ CLOSE" : "▶ OPEN"}
            </button>
          )}
          {tool.type === "external" && (
            <a
              href={tool.href}
              target="_blank" rel="noreferrer"
              style={{
                background: "transparent", color: tool.accent,
                border: `1px solid ${tool.accent}`,
                fontFamily: "'Space Mono', monospace", fontWeight: 700,
                fontSize: 10, letterSpacing: 2,
                padding: "7px 18px", borderRadius: 6,
                textDecoration: "none", display: "inline-block",
                transition: "all 0.2s",
              }}
            >
              ↗ LAUNCH
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Lab Page ──────────────────────────────────────────────────────────────────
export default function Lab() {
  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, background: "var(--bg)" }}>

      {/* Header */}
      <section style={{ padding: "48px 24px 32px", maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: 10, color: SYN["4"], letterSpacing: 6, marginBottom: 16 }}>
            THE WORKSHOP
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(28px, 5vw, 52px)", color: "var(--text)",
            fontWeight: 400, lineHeight: 1.15, margin: "0 0 20px",
          }}>
            Tools in progress.<br />
            <em style={{ color: SYN["4"] }}>Try them anyway.</em>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.85, maxWidth: 480, margin: "0 auto" }}>
            This is the workshop, not the gallery. Things break here.
            That's the point — this is where I figure out what they are.
          </p>

          {/* Status legend */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            {[
              { status: "DEV", label: "active dev — things will break" },
              { status: "BETA", label: "mostly working" },
              { status: "READY", label: "ready to share" },
            ].map(({ status, label }) => (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusBadge status={status} />
                <span style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: 1 }}>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SYN color bar */}
      <div style={{ display: "flex", height: 2, margin: "0 24px 48px" }}>
        {Object.entries(SYN).map(([d, c]) => (
          <motion.div key={d} style={{ flex: 1, background: c }}
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ delay: parseInt(d) * 0.04, duration: 0.4 }}
          />
        ))}
      </div>

      {/* Tool grid */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: 24 }}>
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} i={i} />
          ))}
        </div>

        {/* Coming soon placeholder */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: 4, marginBottom: 16 }}>
            WHAT'S NEXT
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {["Particle Playground", "Three.js Point Cloud", "Shader Editor", "Audio Visualizer", "GSAP Text Morph"].map((t) => (
              <div key={t} style={{
                border: "1px solid var(--border)", borderRadius: 6,
                padding: "6px 14px", fontSize: 10, color: "var(--text-dim)",
                letterSpacing: 2, fontFamily: "'Space Mono', monospace",
              }}>{t}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}