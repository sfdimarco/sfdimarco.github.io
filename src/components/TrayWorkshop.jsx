import { useState } from "react";

export default function TrayWorkshop() {
  const [braced, setBraced] = useState(false);
  const [received, setReceived] = useState(false);
  const [passed, setPassed] = useState(false);
  const [message, setMessage] = useState("One cup. Two grippers. An entirely reasonable amount of preparation.");
  function release() {
    if (!braced) return setMessage("Kip: First, the landing needs a brace. Gravity has declined to negotiate.");
    if (!received) return setMessage("Lo: Happy to help. Ideally before you let go. Offer the receiving hand.");
    setPassed(true);
    setMessage("Transfer complete. The cup has travelled 30 centimetres. A small triumph for cooperation.");
  }
  function reset() { setBraced(false); setReceived(false); setPassed(false); setMessage("One cup. Two grippers. An entirely reasonable amount of preparation."); }
  return <section className="ft-workshop" aria-labelledby="ft-workshop-title">
    <div className="ft-workshop-intro"><span className="ft-tag">A tiny browser experiment</span><h2 id="ft-workshop-title">Please mind <br />the very small gap.</h2><p>Make the handoff readable: brace the landing, offer a hand, then release. Or test your confidence in gravity.</p><p className="ft-small">A simplified web diagram, not footage or the show's GeoV rig. The dialogue here is just for this experiment.</p></div>
    <div className="ft-console">
      <svg className="ft-tray-diagram" viewBox="0 0 620 280" role="img" aria-label={`Tray diagram: landing ${braced ? "braced" : "unbraced"}, receiving hand ${received ? "offered" : "absent"}, cup ${passed ? "transferred" : "held by Kip"}.`}>
        <defs><pattern id="ft-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#315262" strokeWidth="1" /></pattern></defs>
        <rect width="620" height="280" fill="url(#ft-grid)" />
        <path d="M40 185H258M362 185H580" stroke="#9aafac" strokeWidth="16" />
        <path d="M70 195V250M228 195V250M392 195V250M550 195V250" stroke="#9aafac" strokeWidth="10" />
        <path d="M258 215H362M258 207V223M362 207V223" stroke="#bdd1d6" strokeWidth="2" /><text x="310" y="245" textAnchor="middle" fill="#bdd1d6" fontSize="15">the gap</text>
        {braced && <path d="M390 249L510 192M510 249L390 192" stroke="#e9bd46" strokeWidth="8" />}
        {!passed && <path d="M105 106H200V132H240" fill="none" stroke="#e9bd46" strokeWidth="13" strokeLinejoin="round" />}
        {received && <path d={passed ? "M540 106H450V132H415" : "M540 106H420V132H338"} fill="none" stroke="#79b6e5" strokeWidth="13" strokeLinejoin="round" />}
        <g transform={passed ? "translate(130 0)" : "translate(0 0)"}><path d="M230 122H350" stroke="#ebeee5" strokeWidth="10" /><path d="M269 73H308L303 117H274Z" fill="#e9bd46" /><path d="M309 80H320V99H307" fill="none" stroke="#e9bd46" strokeWidth="6" /><path d="M280 55V42M296 55V36" stroke="#bdd1d6" strokeWidth="3" /></g>
        <text x="55" y="35" fill="#e9bd46" fontSize="18">Kip's side</text><text x="455" y="35" fill="#79b6e5" fontSize="18">Lo's side</text>
      </svg>
      <div className="ft-controls"><button type="button" aria-pressed={braced} disabled={passed} onClick={() => { setBraced(!braced); setMessage(braced ? "Brace removed. The landing would like a second opinion." : "Landing braced. One less thing to worry about."); }}>{braced ? "✓ Landing braced" : "Brace the landing"}</button><button type="button" aria-pressed={received} disabled={passed} onClick={() => { setReceived(!received); setMessage(received ? "Receiving hand withdrawn. The cup remains your responsibility." : "Receiving hand in place. Cooperation: now visible."); }}>{received ? "✓ Hand offered" : "Offer a hand"}</button><button className="ft-release" type="button" disabled={passed} onClick={release}>{passed ? "✓ Cup delivered" : "Release the tray"}</button></div>
      <p className="ft-workshop-status" role="status" aria-live="polite">{message}</p><button className="ft-reset" type="button" onClick={reset}>Reset the experiment</button>
    </div>
  </section>;
}
