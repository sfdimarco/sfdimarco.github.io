import { createContext, useContext, useState } from "react";
export const LightboxCtx = createContext(null);
export function LightboxProvider({ children }) {
  const [lb, setLb] = useState(null);
  const open = (src, alt) => setLb({ src, alt });
  const close = () => setLb(null);
  return (
    <LightboxCtx.Provider value={open}>
      {children}
      {lb && (
        <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.94)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "zoom-out", padding: 24 }}>
          <img src={lb.src} alt={lb.alt} onClick={e => e.stopPropagation()}
            style={{ maxWidth: "92vw", maxHeight: "88vh", objectFit: "contain",
              borderRadius: 10, boxShadow: "0 0 120px rgba(0,0,0,0.9)" }} />
          <div onClick={close} style={{ position: "absolute", top: 18, right: 26, color: "#fff",
            fontSize: 32, cursor: "pointer", fontFamily: "monospace", lineHeight: 1, opacity: 0.7 }}>×</div>
          {lb.alt && <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center",
            color: "#666", fontSize: 10, letterSpacing: 3, fontFamily: "'Space Mono', monospace" }}>{lb.alt}</div>}
        </div>
      )}
    </LightboxCtx.Provider>
  );
}
export function useLightbox() { return useContext(LightboxCtx); }
