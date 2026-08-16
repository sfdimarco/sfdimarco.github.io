import { useState } from "react";
export default function YouTubeEmbed({ videoId, accent }) {
  const [go, setGo] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000", borderRadius: 8, overflow: "hidden" }}>
      {!go ? (
        <div onClick={() => setGo(true)} style={{ position: "absolute", inset: 0, cursor: "pointer",
          background: `${accent}10`, border: `1px solid ${accent}33`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: accent,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#000" }}>▶</div>
          <div style={{ color: accent, fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3 }}>PLAY FILM</div>
        </div>
      ) : (
        <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          allow="autoplay; fullscreen" allowFullScreen />
      )}
    </div>
  );
}
