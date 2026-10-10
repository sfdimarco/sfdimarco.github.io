import { Link } from "react-router-dom";
import HaloLettering from "../components/HaloLettering";
import YouTubeEmbed from "../components/YouTubeEmbed";
import PostList from "../components/PostList";
import { episodes, watchUrl } from "../content/episodes";
import { breakdowns } from "../content/breakdowns";
import { CHANNEL_URL } from "../content/show";
import { formatDate } from "../lib/formatDate";
import { usePageTitle } from "../lib/usePageTitle";

export default function Home() {
  usePageTitle();
  const latest = episodes[0];
  return <>
    <section className="home-hero wrap">
      <div className="show-intro">
        <h1 className="show-title"><span className="title-intro">The MisAdventures of</span><HaloLettering text="Mook and Mush" cap={66} animate /><span className="sr-only">:</span><span className="title-sub">or; Eat the Rectangle <span>with Finley and Puff</span></span></h1>
        <p className="show-deck">Big trouble on a small planet.</p>
        <p className="intro-copy">Welcome to Mowersville. Follow Mook, Mush, Finley and Puff through card battles, cosmic mishaps, and the everyday business of getting out of chores.</p>
        <Link className="text-link" to="/about">About the show and its maker</Link>
        <img className="hero-sketch" src="/images/show/mook-mush-pod.jpg" alt="Original line drawing of Mook and Mush peering out of their pod" />
      </div>
      <div className="latest-feature">
        <p className="feature-label">Latest cartoon</p>
        {latest ? <><YouTubeEmbed videoId={latest.videoId} title={latest.title} eager /><div className="feature-copy"><time dateTime={latest.publishedAt}>{formatDate(latest.publishedAt)}</time><h2>{latest.title}</h2><p>{latest.description}</p><div className="actions"><a className="button button-yellow" href={watchUrl(latest.videoId)} target="_blank" rel="noreferrer">Watch on YouTube</a><Link className="text-link" to="/episodes">All episodes</Link></div></div></> : <div className="feature-copy"><p>Find the cartoons on YouTube.</p><a href={CHANNEL_URL}>Visit the channel</a></div>}
      </div>
    </section>
    <section className="journal-section wrap" aria-labelledby="journal-title">
      <div className="section-heading"><div><h2 id="journal-title">Inside the show</h2><p>Drawings, episode notes, and how the cartoons get made.</p></div><Link className="text-link" to="/breakdowns">All breakdowns</Link></div>
      <PostList posts={breakdowns.slice(0, 3)} />
    </section>
    <section className="channel-banner wrap"><h2>There’s more in Mowersville.</h2><p>Catch up on the cartoons, or follow the channel for the next misadventure.</p><a className="button" href={CHANNEL_URL} target="_blank" rel="noreferrer">Visit the YouTube channel</a></section>
  </>;
}
