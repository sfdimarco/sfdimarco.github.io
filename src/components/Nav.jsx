import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { SYN } from "../constants/syn";
export default function Nav({ dark, setDark }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 32px",
      height: 54, display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(7,7,7,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid #1a1a1a" : "1px solid transparent",
      transition: "all 0.3s" }}>
      <Link to="/" style={{ textDecoration: "none", fontWeight: 700, fontSize: 14, letterSpacing: 3 }}>
        {[["M","4"],["O","5"],["O","5"],["K","1"]].map(([l,c],i) => (
          <span key={i} style={{ color: SYN[c] }}>{l}</span>
        ))}
      </Link>
      <div style={{ display: "flex", gap: 28, fontSize: 11, letterSpacing: 2, alignItems: "center" }}>
        <a href="/#work" style={{ color: "#666", textDecoration: "none" }}>WORK</a>
        <a href="/#about" style={{ color: "#666", textDecoration: "none" }}>ABOUT</a>
        <NavLink to="/lab" style={({ isActive }) => ({ color: isActive ? SYN["6"] : "#666",
          textDecoration: "none", fontWeight: isActive ? 700 : 400 })}>LAB</NavLink>
        <a href="https://github.com/sfdimarco" target="_blank" rel="noreferrer" style={{ color: "#666", textDecoration: "none" }}>GITHUB</a>
        <a href="/#contact" style={{ color: SYN["4"], textDecoration: "none", fontWeight: 700 }}>HIRE ME</a>
        <button onClick={() => setDark(d => !d)} style={{ background: "transparent", border: "1px solid #333",
          borderRadius: 6, color: "#888", fontFamily: "'Space Mono', monospace", fontSize: 10,
          letterSpacing: 2, padding: "5px 11px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {dark ? "◑ LIGHT" : "◐ DARK"}
        </button>
      </div>
    </nav>
  );
}
