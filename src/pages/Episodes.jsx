import YouTubeEmbed from "../components/YouTubeEmbed";
import { episodes, watchUrl } from "../content/episodes";
import { CHANNEL_URL } from "../content/show";
import { formatDate } from "../lib/formatDate";
import { usePageTitle } from "../lib/usePageTitle";
export default function Episodes() {
  usePageTitle("Episodes");
  return <div className="wrap page">
    <header className="page-heading"><h1>Episodes</h1><p>The cartoons, newest first. Watch here or on YouTube.</p></header>
    <div className="episode-list">{episodes.map((episode, i) => <article className="episode-row" key={episode.id}>
      <YouTubeEmbed videoId={episode.videoId} title={episode.title} eager={i === 0} />
      <div className="episode-copy"><time dateTime={episode.publishedAt}>{formatDate(episode.publishedAt)}</time><h2>{episode.title}</h2><p>{episode.description}</p><a className="text-link" href={watchUrl(episode.videoId)} target="_blank" rel="noreferrer">Watch on YouTube<span className="sr-only">: {episode.title}</span></a></div>
    </article>)}</div>
    <a className="button" href={CHANNEL_URL} target="_blank" rel="noreferrer">Follow the channel</a>
  </div>;
}
