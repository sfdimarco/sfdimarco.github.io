import { Link, Navigate, useParams } from "react-router-dom";
import { breakdowns } from "../content/breakdowns";
import { episodes, watchUrl } from "../content/episodes";
import { formatDate } from "../lib/formatDate";
import { usePageTitle } from "../lib/usePageTitle";
export default function BreakdownPost() {
  const { slug } = useParams();
  const post = breakdowns.find(item => item.slug === slug);
  usePageTitle(post?.title || "Breakdowns", post?.summary);
  if (!post) return <Navigate to="/breakdowns" replace state={{ notFound: true }} />;
  const episode = episodes.find(item => item.id === post.episodeId);
  return <article className="wrap page article-page">
    <Link className="text-link back-link" to="/breakdowns">All breakdowns</Link>
    <header className="article-heading"><p className="post-meta">{post.category} <span aria-hidden="true">/</span> <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></p><h1>{post.title}</h1><p className="article-summary">{post.summary}</p></header>
    <figure className="article-art"><img src={post.image} alt={post.imageAlt} /><figcaption>{post.imageAlt}</figcaption></figure>
    <div className="article-body">{post.body.map((block, i) => typeof block === "string" ? <p key={i}>{block}</p> : block.h ? <h2 key={i}>{block.h}</h2> : block.list ? <ul key={i}>{block.list.map((item, j) => <li key={j}>{item}</li>)}</ul> : block.img ? <figure key={i}><img src={block.img} alt={block.alt} loading="lazy" /><figcaption>{block.alt}</figcaption></figure> : null)}{post.links && <div className="actions">{post.links.map(l => <a key={l.href} className="button" href={l.href}>{l.label}</a>)}</div>}</div>
    {episode && <aside className="related-episode"><p>Watch the cartoon</p><h2>{episode.title}</h2><a className="button button-yellow" href={watchUrl(episode.videoId)} target="_blank" rel="noreferrer">Watch on YouTube</a><Link className="text-link" to="/episodes">Browse episodes</Link></aside>}
  </article>;
}
