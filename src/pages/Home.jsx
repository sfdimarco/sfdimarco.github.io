import { Link } from "react-router-dom";
import HaloLettering from "../components/HaloLettering";
import YouTubeEmbed from "../components/YouTubeEmbed";
import PostList from "../components/PostList";
import MushYard from "../components/MushYard";
import { episodes, watchUrl } from "../content/episodes";
import { breakdowns } from "../content/breakdowns";
import { CHANNEL_URL, GEOV_URL, GEOV_ARTICLE, MUSEUM_URL } from "../content/show";
import { formatDate } from "../lib/formatDate";
import { usePageTitle } from "../lib/usePageTitle";

export default function Home() {
  usePageTitle();
  const latest = episodes[0];
  return <>
    <section className="home-hero wrap">
      <div className="show-intro">
        <h1 className="show-title"><span className="title-intro">The MisAdventures of</span><HaloLettering text="Mook and Mush" cap={66} animate /><span className="sr-only">:</span><span className="title-sub">or; Eat the Rectangle <span>with Finley and Puff</span></span></h1>
        <p className="show-deck">New cartoons from Mowersville.</p>
        <p className="intro-copy">Mook, Mush, Finley and Puff live on the little planet Dwarf, where a deck of cards can turn any argument into a space battle. Start with the newest episode.</p>
        <Link className="text-link" to="/episodes">All episodes</Link>
      </div>
      <div className="latest-feature">
        <p className="feature-label">Latest cartoon</p>
        {latest ? <><YouTubeEmbed videoId={latest.videoId} title={latest.title} eager /><div className="feature-copy"><time dateTime={latest.publishedAt}>{formatDate(latest.publishedAt)}</time><h2>{latest.title}</h2><p>{latest.description}</p><div className="actions"><a className="button button-yellow" href={watchUrl(latest.videoId)} target="_blank" rel="noreferrer">Watch on YouTube</a><Link className="text-link" to="/episodes">All episodes</Link></div></div></> : <div className="feature-copy"><p>Find the cartoons on YouTube.</p><a href={CHANNEL_URL}>Visit the channel</a></div>}
      </div>
    </section>
    <section className="mush-section wrap" aria-labelledby="mush-title">
      <MushYard />
      <div className="mush-copy">
        <h2 id="mush-title">Say hi to Mush.</h2>
        <p>He’s animated in code, live in your browser, by the same rig as the show. Mook draws the characters; Claude animates them in GeoV Studio. Point or tap anywhere and he’ll come and find it. Poke him if you dare.</p>
        <div className="actions"><a className="button button-yellow" href={GEOV_URL}>Made in GeoV Studio</a><Link className="text-link" to={GEOV_ARTICLE}>What’s GeoV Studio?</Link></div>
      </div>
    </section>
    <section className="channel-banner wrap" aria-labelledby="museum-title"><h2 id="museum-title">Walk the Museum.</h2><p>Every painting in the show hangs in four galleries on the Council’s planet, a place nobody in the cartoon has been to yet. Walk Mook through it. Nothing there is an image file: each picture is painted by its own painter, live in your browser, when the page opens.</p><a className="button" href={MUSEUM_URL}>Walk in</a></section>
    <section className="journal-section wrap" aria-labelledby="journal-title">
      <div className="section-heading"><div><h2 id="journal-title">Inside the show</h2><p>Drawings, episode notes, and how the cartoons get made.</p></div><Link className="text-link" to="/breakdowns">All breakdowns</Link></div>
      <PostList posts={breakdowns.slice(0, 3)} />
    </section>
    <section className="channel-banner wrap"><h2>There’s more in Mowersville.</h2><p>Catch up on the cartoons, or follow the channel for the next misadventure.</p><a className="button" href={CHANNEL_URL} target="_blank" rel="noreferrer">Watch @MookandMush on YouTube</a></section>
  </>;
}
