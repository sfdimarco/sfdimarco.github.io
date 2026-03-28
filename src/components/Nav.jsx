import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { SYN } from "../constants/syn";

const NAV_LINKS = [
  { to: "/work",  label: "WORK",  color: SYN["7"] },
  { to: "/lab",   label: "LAB",   color: SYN["4"] },
  { to: "/about", label: "ABOUT", color: SYN["2"] },
];

export default function Nav({ dark, setDark }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 32px", height: 54,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "var(--nav-bg)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      transition: "all 0.3s",
    }}>

      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", fontWeight: 700, fontSize: 14, letterSpacing: 3 }}>
        {/* M=4(green) O=5(orange) O=5 K=1(red) — synesthetic */}
        {[["M", "4"], ["O", "5"], ["O", "5"], ["K", "1"]].map(([l, c], i) => (
          <span key={i} style={{ color: SYN[c] }}>{l}</span>
        ))}
      </Link>

      {/* Links */}
      <div style={{ display: "flex", gap: 24, fontSize: 10, letterSpacing: 3, alignItems: "center" }}>
        {NAV_LINKS.map(({ to, label, color }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              color: isActive ? color : "var(--text-muted)",
              textDecoration: "none",
              fontWeight: isActive ? 700 : 400,
              borderBottom: isActive ? `1px solid ${color}` : "1px solid transparent",
              paddingBottom: 2,
              transition: "color 0.2s, border-color 0.2s",
            })}
          >{label}</NavLink>
        ))}

        <a
          href="https://github.com/sfdimarco"
          target="_blank" rel="noreferrer"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >GITHUB</a>

        <NavLink
          to="/about"
          style={({ isActive }) => ({
            color: isActive ? "#000" : SYN["4"],
            background: isActive ? SYN["4"] : "transparent",
            border: `1px solid ${SYN["4"]}`,
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700, fontSize: 10, letterSpacing: 2,
            padding: "5px 14px", borderRadius: 5,
            textDecoration: "none", transition: "all 0.2s",
          })}
          end={false}
        >HIRE ME</NavLink>

        {/* Dark/light toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--text-muted)",
            fontFamily: "'Space Mono', monospace",
            fontSize: 10, letterSpacing: 2,
            padding: "5px 11px", cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {dark ? "◑ LIGHT" : "◐ DARK"}
        </button>
      </div>
    </nav>
  );
}