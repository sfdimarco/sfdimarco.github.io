import { motion } from "framer-motion";
import { SYN } from "../constants/syn";
import { IMG } from "../constants/images";
import SynGrid from "../components/SynGrid";
import SectionWave from "../components/SectionWave";
import Tag from "../components/Tag";
import ImgSlot from "../components/ImgSlot";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" },
  }),
};

export default function About() {
  return (
    <div style={{ minHeight: "100vh", paddingTop: 72, background: "var(--bg)" }}>

      {/* Header */}
      <section style={{ padding: "56px 24px 40px", maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
          <div style={{ fontSize: 10, color: SYN["2"], letterSpacing: 6, marginBottom: 16 }}>
            THE BRAIN
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(28px, 5vw, 52px)",
            color: "var(--text)", fontWeight: 400,
            lineHeight: 1.15, margin: "0 0 20px",
          }}>
            I build AI tools kids <em style={{ color: SYN["4"] }}>actually use.</em>
          </h1>
        </motion.div>
      </section>

      {/* Split: Educator / Builder */}
      <section className="split-section" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
      }}>
        <motion.div
          variants={fadeUp} custom={1} initial="hidden" animate="visible"
          style={{
            padding: "56px 44px",
            borderRight: "1px solid var(--border)",
            background: `linear-gradient(160deg,${SYN["3"]}06,transparent)`,
          }}
        >
          <div style={{ fontSize: 10, color: SYN["3"], letterSpacing: 5, marginBottom: 20 }}>THE EDUCATOR</div>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(20px, 2.4vw, 32px)", color: "var(--text)",
            lineHeight: 1.25, margin: "0 0 18px", fontWeight: 400,
          }}>I've taught hundreds of kids to think in systems.</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.85 }}>
            The Chestnut Hill School · 10 years · EMPOW Studios · 25 schools · Bowen After School ·
            MagicSchool AI Certified · BFA Animation, Lesley University. I don't just demo AI tools —
            I hand them to a 4th grader and watch what breaks.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 20 }}>
            {["K–8 Teaching", "STEAM Education", "MagicSchool AI", "Curriculum Design", "BFA Animation"].map((t) => (
              <Tag key={t} color={SYN["3"]}>{t}</Tag>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp} custom={2} initial="hidden" animate="visible"
          style={{
            padding: "56px 44px",
            background: `linear-gradient(160deg,${SYN["2"]}06,transparent)`,
          }}
        >
          <div style={{ fontSize: 10, color: SYN["2"], letterSpacing: 5, marginBottom: 20 }}>THE BUILDER</div>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(20px, 2.4vw, 32px)", color: "var(--text)",
            lineHeight: 1.25, margin: "0 0 18px", fontWeight: 400,
          }}>I ship interactive AI tools from scratch, in the browser.</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.85 }}>
            React · Web Audio API · Unity · Three.js · Google Flow · Java. I have synesthesia —
            numbers are colours, sounds are shapes. My UI decisions aren't aesthetic preferences.
            They're perceptual data.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 20 }}>
            {["React", "Three.js", "Unity", "Web Audio API", "Java", "Vite"].map((t) => (
              <Tag key={t} color={SYN["2"]}>{t}</Tag>
            ))}
          </div>
        </motion.div>
      </section>

      <SectionWave accent={SYN["6"]} speed={0.7} complexity={0.9} height={40} />

      {/* Synesthesia section */}
      <section style={{ padding: "72px 24px", maxWidth: 820, margin: "0 auto" }}>
        <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div style={{ fontSize: 10, color: SYN["6"], letterSpacing: 5, marginBottom: 16, textAlign: "center" }}>
            THE SYNESTHETIC DEVELOPER
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(22px, 3.5vw, 40px)", color: "var(--text)",
            lineHeight: 1.2, margin: "0 0 28px", fontWeight: 400, textAlign: "center",
          }}>
            I don't experience data the way most people do.
          </h2>
        </motion.div>

        {/* SYN color bar */}
        <div style={{ display: "flex", gap: 0, marginBottom: 40, borderRadius: 8, overflow: "hidden", height: 6 }}>
          {Object.entries(SYN).map(([d, col]) => (
            <div key={d} style={{ flex: 1, background: col }} />
          ))}
        </div>

        {/* Number grid — the actual color system */}
        <motion.div
          variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{
            display: "flex", gap: 8, justifyContent: "center",
            flexWrap: "wrap", marginBottom: 44,
          }}
        >
          <span style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: 3, alignSelf: "center", marginRight: 8 }}>
            I SEE
          </span>
          {Object.entries(SYN).map(([d, c]) => (
            <div key={d} style={{
              width: 36, height: 36, borderRadius: 6,
              background: c + "1a", border: `1px solid ${c}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700, color: c,
            }}>{d}</div>
          ))}
          <span style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: 2, alignSelf: "center", marginLeft: 8 }}>
            as color
          </span>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 36 }}>
          <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div style={{ fontSize: 10, color: SYN["1"], letterSpacing: 4, marginBottom: 10 }}>HOW IT WORKS</div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.9, margin: 0 }}>
              I have grapheme-color synesthesia. Numbers and letters each have a fixed color —
              not a metaphor, an actual perceptual event. 0 is cyan, 1 is red, 2 is blue, 3 is yellow,
              4 green, 5 orange, 6 purple, 7 pink, 8 near-white, 9 near-black. Letters encode from
              those same digits. When I read code, I'm reading color patterns. When something is
              wrong, it looks wrong before I can say why.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div style={{ fontSize: 10, color: SYN["2"], letterSpacing: 4, marginBottom: 10 }}>WHY IT MATTERS FOR AI</div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.9, margin: 0 }}>
              AI systems are high-dimensional pattern spaces. Synesthetic perception is native
              multi-channel processing — I navigate token spaces, embeddings, and latent structure
              the way most people navigate physical rooms: by feel, shape, color. UI decisions I
              make aren't aesthetic preferences. They're perceptual data.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{
            background: "var(--card-bg)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "28px 32px", marginBottom: 28,
          }}
        >
          <div style={{ fontSize: 10, color: SYN["3"], letterSpacing: 4, marginBottom: 14 }}>
            ON COLLABORATING WITH AI — HONESTLY
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.9, margin: "0 0 14px" }}>
            I've worked with Claude and Gemini not just as a user but as someone who documents the
            texture of the interaction. My synesthesia means I notice when a response feels off in
            ways I can't immediately articulate — when a model is pattern-matching instead of
            reasoning, when something is structurally almost right but perceptually wrong. That's a
            different feedback signal than most developers provide.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.9, margin: "0 0 14px" }}>
            The Mowersville production backgrounds were built by developing a visual grammar with
            Gemini that it could hold consistently across six scenes. That's not prompting — that's a
            collaborative design process with a non-human creative partner.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.9, margin: 0 }}>
            I hand an AI tool to a 9-year-old and observe what breaks. That's field research.
          </p>
        </motion.div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {["Grapheme-Color Synesthesia", "ADHD", "Autism", "Multi-Channel Perception",
            "Perceptual UI Design", "AI Collaboration", "Pattern Recognition"].map((t) => (
            <Tag key={t} color={SYN["6"]}>{t}</Tag>
          ))}
        </div>
      </section>

      <SectionWave accent={SYN["4"]} speed={0.6} complexity={1.0} height={40} />

      {/* Contact */}
      <section id="contact" style={{
        borderTop: "1px solid var(--border)", padding: "80px 24px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.2 }}><SynGrid /></div>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%", overflow: "hidden",
            margin: "0 auto 20px",
            border: `3px solid ${SYN["4"]}44`,
            boxShadow: `0 0 24px ${SYN["4"]}33`,
          }}>
            <ImgSlot src={IMG.headshot} alt="Sean DiMarco" accent={SYN["4"]} style={{ height: "100%", borderRadius: 0 }} fit="cover" />
          </div>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "var(--text-dim)", marginBottom: 20 }}>
            LET'S WORK TOGETHER
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(24px, 4vw, 48px)", color: "var(--text)",
            margin: "0 0 16px", fontWeight: 400,
          }}>
            Hire the person who builds <em style={{ color: SYN["4"] }}>and</em> teaches.
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.85, maxWidth: 420, margin: "0 auto 40px" }}>
            Looking for a hybrid EdTech / Creative AI role in the Boston area.<br />
            Open to fully remote for the right team.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:sfdimarco@gmail.com" style={{
              background: SYN["4"], color: "#000", fontFamily: "'Space Mono', monospace",
              fontWeight: 700, fontSize: 11, letterSpacing: 3,
              padding: "15px 34px", borderRadius: 6, textDecoration: "none",
            }}>Email Me</a>
            <a href="https://www.linkedin.com/in/sean-dimarco/" target="_blank" rel="noreferrer" style={{
              background: "transparent", color: "var(--text-muted)",
              fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 11,
              letterSpacing: 3, padding: "15px 34px", borderRadius: 6,
              textDecoration: "none", border: "1px solid var(--border)",
            }}>LinkedIn</a>
            <a href="https://www.instagram.com/dumbnot_stupid/" target="_blank" rel="noreferrer" style={{
              background: "transparent", color: SYN["7"],
              fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 11,
              letterSpacing: 3, padding: "15px 34px", borderRadius: 6,
              textDecoration: "none", border: `1px solid ${SYN["7"]}44`,
            }}>Art / Process</a>
            <a href="https://www.imdb.com/name/nm11904779/" target="_blank" rel="noreferrer" style={{
              background: "transparent", color: SYN["3"],
              fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 11,
              letterSpacing: 3, padding: "15px 34px", borderRadius: 6,
              textDecoration: "none", border: `1px solid ${SYN["3"]}44`,
            }}>IMDB</a>
            <a href="https://vimeo.com/user6495644" target="_blank" rel="noreferrer" style={{
              background: "transparent", color: "#1ab7ea",
              fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 11,
              letterSpacing: 3, padding: "15px 34px", borderRadius: 6,
              textDecoration: "none", border: "1px solid #1ab7ea44",
            }}>Vimeo</a>
          </div>
        </div>
      </section>

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
        <div style={{ display: "flex", gap: 16 }}>
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