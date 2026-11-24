import { useEffect } from "react";
import "./FirstRoad.css";

const playRoot = `${import.meta.env.BASE_URL}first-road/play/`;

function HarborIllustration() {
  return (
    <svg className="first-road-art" viewBox="0 0 620 448" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="fr-water-lines" width="38" height="21" patternUnits="userSpaceOnUse" patternTransform="rotate(-9)">
          <path d="M4 11h16m9 0h5" stroke="#c6d5c0" opacity=".23" fill="none"/>
        </pattern>
        <pattern id="fr-paper-grid" width="38" height="38" patternUnits="userSpaceOnUse">
          <path d="M38 0H0V38" fill="none" stroke="#556659" opacity=".12"/>
        </pattern>
      </defs>
      <rect width="620" height="448" fill="#e5ddbe"/>
      <rect width="620" height="448" fill="url(#fr-paper-grid)"/>
      <circle cx="435" cy="114" r="53" fill="#e9ab69" stroke="#273531" strokeWidth="2"/>
      <path d="M0 189 96 136l86 32 112-66 125 86 89-54 112 37v104H0z" fill="#b5b697" stroke="#273531" strokeWidth="2"/>
      <path d="M0 218 102 195l93 36 130-56 91 44 102-35 102 11v88H0z" fill="#899981" stroke="#273531" strokeWidth="2"/>
      <path d="M0 273c103-36 159 23 218-4s158-71 237-28 106 44 165 17v190H0z" fill="#426c6a" stroke="#253a35" strokeWidth="2"/>
      <path d="M0 273c103-36 159 23 218-4s158-71 237-28 106 44 165 17v190H0z" fill="url(#fr-water-lines)"/>
      <path d="M0 244 139 219l51 38-73 32L0 287m620-63-116 17-47 52 42 35 121 6" fill="#c2b58c" stroke="#273531" strokeWidth="2"/>
      <path d="m0 272 117-1 18 11m-73-43v33m46-42v38m512-18-114 18-31 36m66-48-30 59m78-66-12 77" fill="none" stroke="#5a6558" strokeWidth="2"/>
      <path d="M75 231v-41m-25-2 25-24 25 24zm13 12c0-12 24-12 24 0l4 10H58z" fill="#c67752" stroke="#273531" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M493 237v-47l31-34 33 22v47l-31 17z" fill="#a7624d" stroke="#273531" strokeWidth="3"/>
      <path d="m484 193 39-45 43 27-8 7-35-24-34 45z" fill="#d8a276" stroke="#273531" strokeWidth="3"/>
      <path d="M523 239v-31l14-5v30" fill="#273531"/>
      <path d="M99 332c36 15 104 35 150 29m146-8c59-29 77-38 132-32" fill="none" stroke="#f5df99" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 10"/>
      <path d="m249 344 44 55 99-13 33-56z" fill="#363c36" stroke="#273531" strokeWidth="4" strokeLinejoin="round"/>
      <path d="m257 343 38 43 95-14 34-42-102 21z" fill="#b5674d" stroke="#273531" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M329 352V218m0 0-53 119 53-14zm2 1 55 104-55 8z" fill="#f5e7b7" stroke="#273531" strokeWidth="3" strokeLinejoin="round"/>
      <path d="m331 215 36 11-36 15z" fill="#bd6449" stroke="#273531" strokeWidth="2"/>
    </svg>
  );
}

export default function FirstRoad() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "First Road · In Dev";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <article className="first-road">
      <div className="wrap">
        <section className="first-road-hero" aria-labelledby="first-road-title">
          <div className="first-road-intro">
            <p className="first-road-kicker"><span className="first-road-badge">IN DEV</span> A playable RPG by Sean DiMarco</p>
            <h1 id="first-road-title">First Road</h1>
            <p className="first-road-deck">Set out with a familiar and get to know the towns that keep the road alive.</p>
            <p className="first-road-summary">Explore Brindlewick, take on a job with your familiar, or stay awhile and play something the neighbors made.</p>
            <div className="first-road-actions">
              <a className="first-road-button" href={`${playRoot}adventure.html`}>Play First Road</a>
              <a className="first-road-secondary" href={`${playRoot}paper-harbor.html`}>Try Paper Harbor</a>
            </div>
            <p className="first-road-note">The 3D adventure needs WebGL 2 and saves in this browser. Paper Harbor runs without WebGL and doesn’t touch your save.</p>
          </div>
          <figure className="first-road-plate">
            <HarborIllustration />
            <figcaption>Paper Harbor • A miniature coast folded by hand</figcaption>
          </figure>
        </section>
        <section className="first-road-fieldnotes" aria-labelledby="first-road-fieldnotes-title">
          <h2 id="first-road-fieldnotes-title">Upper Steps demo</h2>
          <p><a className="first-road-secondary" href={playRoot}>Play the earlier demo</a></p>
          <div className="first-road-guides">
            <div><h3>Brindlewick’s paper theatre</h3><p>June puts the town onstage. Guide a paper captain home through three tiny route puzzles.</p></div>
            <div><h3>The waterworks</h3><p>Work alongside your familiar and follow a missing shift note from the orchard to the Rain Engine Junction.</p></div>
            <div><h3>The Upper Steps</h3><p>Move a windbreak at the station’s little boat trough so both toy boats make it to the dock.</p></div>
          </div>
        </section>
      </div>
    </article>
  );
}
