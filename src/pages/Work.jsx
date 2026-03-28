import { useState } from "react";
import { motion } from "framer-motion";
import { SYN, CATS, CAT_COLOR } from "../constants/syn";
import { PROJECTS, SKILLS } from "../constants/projects";
import SectionWave from "../components/SectionWave";
import ProjectCard from "../components/ProjectCard";
import Tag from "../components/Tag";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Work() {
  const [cat, setCat] = useState("ALL");
  const filtered = cat === "ALL" ? PROJECTS : PROJECTS.filter((p) => p.cat === cat);

  return (
    <div style={{ minHeight: "100vh", paddingTop: 72, background: "var(--bg)" }}>

      {/* Header */}
      <section style={{ padding: "56px 24px 48px", maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: 10, color: SYN["7"], letterSpacing: 6, marginBottom: 16 }}>
            ★ SELECTED WORK
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(28px, 5vw, 52px)",
            color: "var(--text)", fontWeight: 400,
            lineHeight: 1.15, margin: "0 0 20px",
          }}>
            Animator. Builder. <em style={{ color: SYN["7"] }}>Educator.</em>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.85, maxWidth: 480, margin: "0 auto" }}>
            Games kids play, tools teachers use, animations that get made.
            Built across classrooms, studios, and late nights.
          </p>
        </motion.div>
      </section>
      {/* Category filters */}
      <div style={{ padding: "0 24px 40px", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {CATS.map((c, i) => (
          <motion.button
            key={c}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            onClick={() => setCat(c)}
            style={{
              background: cat === c ? CAT_COLOR[c] : "transparent",
              color: cat === c ? "#000" : CAT_COLOR[c],
              border: `1px solid ${CAT_COLOR[c]}`,
              borderRadius: 999, padding: "7px 18px",
              fontSize: 10, fontWeight: 700, cursor: "pointer",
              letterSpacing: 3, fontFamily: "'Space Mono', monospace",
              transition: "all 0.15s",
            }}
          >{c}</motion.button>
        ))}
      </div>

      {/* Project grid */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          key={cat}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}
        >
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              animate="visible"
            >
              <ProjectCard p={p} isWide={p.wide && cat === "ALL"} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <SectionWave accent={SYN["6"]} speed={0.9} complexity={1.4} height={40} />

      {/* Skills */}
      <section style={{ borderTop: "1px solid var(--border)", padding: "56px 24px 72px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "var(--text-dim)", marginBottom: 28, textAlign: "center" }}>
          TOOLS I SPEAK
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, justifyContent: "center" }}>
          {SKILLS.map((s) => <Tag key={s.label} color={s.color}>{s.label}</Tag>)}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)", padding: "20px 32px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 12,
        fontSize: 10, color: "var(--text-dim)", letterSpacing: 2,
      }}>
        <div>© 2026 SEAN "MOOK" DIMARCO</div>
        <div style={{ display: "flex", gap: 5 }}>
          {Object.entries(SYN).map(([d, c]) => (
            <span key={d} style={{ color: c, fontWeight: 700 }}>{d}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="https://github.com/sfdimarco" target="_blank" rel="noreferrer"
            style={{ color: "var(--text-dim)", textDecoration: "none", letterSpacing: 2, fontSize: 10 }}>GITHUB</a>
          <span style={{ color: "var(--border)" }}>·</span>
          <a href="https://www.imdb.com/name/nm11904779/" target="_blank" rel="noreferrer"
            style={{ color: "var(--text-dim)", textDecoration: "none", letterSpacing: 2, fontSize: 10 }}>IMDB</a>
          <span style={{ color: "var(--border)" }}>·</span>
          <a href="https://vimeo.com/user6495644" target="_blank" rel="noreferrer"
            style={{ color: "var(--text-dim)", textDecoration: "none", letterSpacing: 2, fontSize: 10 }}>VIMEO</a>
        </div>
      </footer>
    </div>
  );
}