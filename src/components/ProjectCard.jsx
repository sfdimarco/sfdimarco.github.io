import { useState } from "react";
import Tag from "./Tag";
import ImgSlot from "./ImgSlot";
import Waveform from "./Waveform";
import ArtGrid from "./ArtGrid";
import PhotoGrid from "./PhotoGrid";
import YouTubeEmbed from "./YouTubeEmbed";

function CardMedia({ p, isWide }) {
  if (!p.renderKey && !p.image) return null;
  let media = null;
  if (p.renderKey === "waveform") {
    media = <div style={{ padding: "16px 16px 0" }}><Waveform accent={p.accent} /></div>;
  } else if (p.renderKey === "youtube") {
    media = <div style={{ padding: "16px 16px 0" }}><YouTubeEmbed videoId={p.youtubeId} accent={p.accent} /></div>;
  } else if (p.renderKey === "dualYoutube") {
    media = <div style={{ padding: "16px 16px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {p.youtubeIds.map(id => <YouTubeEmbed key={id} videoId={id} accent={p.accent} />)}</div>;
  } else if (p.renderKey && p.artImages) {
    media = <div style={{ padding: "16px 16px 0" }}>
      <ArtGrid cols={p.artCols||2} ratio={p.artRatio||"4/3"} accent={p.accent} images={p.artImages} /></div>;
  } else if (p.renderKey === "photoGrid" && p.photoImages) {
    media = <div style={{ padding: "16px 16px 0" }}><PhotoGrid accent={p.accent} images={p.photoImages} /></div>;
  } else if (p.image) {
    media = <div style={{ height: isWide?260:200, overflow: "hidden", position: "relative" }}>
      <ImgSlot src={p.image} alt={p.imageAlt} accent={p.accent} style={{ height: "100%" }} />
      <div style={{ position: "absolute", top: 10, right: 12, background: `${p.accent}22`,
        border: `1px solid ${p.accent}44`, color: p.accent, fontFamily: "'Space Mono',monospace",
        fontSize: 9, letterSpacing: 3, padding: "3px 8px", borderRadius: 4 }}>{p.cat}</div></div>;
  }
  return <div style={{ overflow: "hidden", position: "relative" }}>{media}</div>;
}

export default function ProjectCard({ p, isWide }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ gridColumn: isWide?"1 / -1":"auto", background: hov?"#0f0f0f":"#090909",
        border: `1px solid ${hov?p.accent+"66":"#1e1e1e"}`, borderRadius: 14, overflow: "hidden",
        transition: "all 0.3s", cursor: "default", position: "relative",
        boxShadow: hov?`0 0 28px ${p.accent}28,0 2px 44px ${p.accent}18,inset 0 0 0 1px ${p.accent}11`:"none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: hov?`linear-gradient(90deg,transparent,${p.accent},transparent)`:"transparent",
        transition: "all 0.35s" }} />
      <CardMedia p={p} isWide={isWide} />
      <div style={{ padding: "20px 24px 24px" }}>
        {!p.image&&!p.renderKey&&<div style={{ fontSize: 9, color: p.accent, letterSpacing: 4,
          fontFamily: "'Space Mono',monospace", marginBottom: 10 }}>{p.cat}</div>}
        <div style={{ fontFamily: "'DM Serif Display',Georgia,serif",
          fontSize: isWide?"clamp(20px,2.5vw,28px)":"clamp(17px,2vw,22px)",
          color: "#fff", lineHeight: 1.15, marginBottom: 6 }}>{p.title}</div>
        <div style={{ color: p.accent, fontFamily: "'Space Mono',monospace",
          fontSize: 11, fontStyle: "italic", marginBottom: 14 }}>{p.tagline}</div>
        <p style={{ color: "#777", fontSize: 13, lineHeight: 1.75, margin: "0 0 18px",
          maxWidth: isWide?640:400 }}>{p.desc}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: p.cta?18:0 }}>
          {p.tags.map(t => <Tag key={t} color={p.accent}>{t}</Tag>)}
        </div>
        {p.cta && (p.ctaHref
          ? <a href={p.ctaHref} target={p.ctaTarget||"_self"} style={{ display: "inline-flex",
              alignItems: "center", gap: 8, background: p.accent, color: "#000",
              fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 11, letterSpacing: 2,
              padding: "9px 20px", borderRadius: 6, textDecoration: "none", marginTop: 4 }}>▶ {p.cta}</a>
          : <span style={{ display: "inline-flex", alignItems: "center", gap: 8,
              background: "transparent", color: p.accent, border: `1px solid ${p.accent}55`,
              fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 11, letterSpacing: 2,
              padding: "9px 20px", borderRadius: 6, marginTop: 4, opacity: 0.7 }}>⏳ {p.cta}</span>
        )}
      </div>
    </div>
  );
}
