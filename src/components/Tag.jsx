export default function Tag({ children, color }) {
  return (
    <span style={{
      display: "inline-block", border: `1px solid ${color}55`, color,
      background: `${color}11`, borderRadius: 4, padding: "3px 10px",
      fontSize: 10, letterSpacing: 2, fontFamily: "'Space Mono', monospace",
      fontWeight: 700, textTransform: "uppercase",
    }}>{children}</span>
  );
}
