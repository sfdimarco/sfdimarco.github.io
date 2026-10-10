import { Link } from "react-router-dom";
import { episodes, watchUrl } from "../content/episodes";
import { CHANNEL_URL, SHOW_TITLE } from "../content/show";
import { usePageTitle } from "../lib/usePageTitle";
export default function About() {
  usePageTitle("About");
  return <div className="wrap page about-page">
    <header className="page-heading"><h1>About</h1><p>An independent cartoon. An original world. A workflow built along the way.</p></header>
    <section className="about-layout">
      <div className="about-copy"><h2>Sean “Mook” DiMarco</h2><p className="role-line">Animator & creative technologist</p><p>I’m Sean “Mook” DiMarco, an animator and creative technologist making <em>{SHOW_TITLE}</em>.</p><p>I use Claude Opus 5.5 with a custom set of tools and skills to develop and produce the show, from story and visual direction through animation, sound, and editing. I build the workflow as I make the episodes, bringing original cartoon-making and creative technology together in one independent production practice.</p><div className="actions"><a className="button button-yellow" href={episodes[0] ? watchUrl(episodes[0].videoId) : CHANNEL_URL} target="_blank" rel="noreferrer">Watch the latest episode</a><Link className="text-link" to="/breakdowns">Read the breakdowns</Link><a className="text-link" href="https://www.linkedin.com/in/sean-dimarco/" target="_blank" rel="noreferrer">LinkedIn</a></div></div>
      <figure className="about-art"><img src="/images/show/title-2020.jpg" alt="Sean’s 2020 drawing of Mook and Mush above the neighbourhoods of Mowersville" /><figcaption>The world began in drawings. Original title art, 2020.</figcaption></figure>
    </section>
    <section className="about-show"><h2>Welcome to Mowersville</h2><div><p>On the small planet Dwarf, Mook and his friends are finding their place in the world. A mysterious deck of cards turns ordinary neighbourhood disputes into holographic space battles—and points toward a much bigger adventure.</p><p>The show grows out of original drawings, writing, and a custom animation pipeline. This site is its ongoing notebook: finished cartoons, episode explanations, and a look at the creative and technical decisions behind them.</p><div className="actions"><a className="text-link" href={CHANNEL_URL} target="_blank" rel="noreferrer">YouTube channel</a><a className="text-link" href="https://github.com/sfdimarco" target="_blank" rel="noreferrer">GitHub</a></div></div></section>
  </div>;
}
