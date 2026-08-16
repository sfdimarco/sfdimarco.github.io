import { useState } from "react";
export default function ImgSlot({ src, alt, accent, label, style, fit = "cover" }) {
  const [err, setErr] = useState(false);
  if (err || !src) return (
    <div style={{ background: `${accent}14`, border: `1px dashed ${accent}44`,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", color: accent, fontFamily: "'Space Mono', monospace",
      fontSize: 11, letterSpacing: 2, textAlign: "center", gap: 6, ...style }}>
      <div style={{ fontSize: 20 }}>🖼</div><div>{label || alt}</div>
    </div>
  );
  return <img src={src} alt={alt} onError={() => setErr(true)}
    style={{ objectFit: fit, width: "100%", height: "100%", display: "block", ...style }} />;
}
