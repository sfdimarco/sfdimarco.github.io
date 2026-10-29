import { Link } from "react-router-dom";
import "../styles/faultyTolerance.css";

export default function FaultyDoorway() {
  return <section className="ft-doorway wrap" aria-labelledby="ft-door-title">
    <img src="/images/faulty-tolerance/one-good-look.jpg" alt="Lo, blue and round, beside the smaller yellow Kip in One Good Look" loading="lazy" width="1280" height="720" />
    <div><p className="ft-door-kicker">Meanwhile, on the aqueduct…</p><h2 id="ft-door-title">Faulty Tolerance</h2><p>Two robot engineers. Small repairs. Occasionally, a much bigger question.</p><Link className="ft-button" to="/faulty-tolerance">Meet Kip &amp; Lo <span aria-hidden="true">↗</span></Link></div>
  </section>;
}
