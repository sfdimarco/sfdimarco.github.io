import { Link } from "react-router-dom";
import { formatDate } from "../lib/formatDate";
export default function PostList({ posts, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return <div className="post-list">{posts.map(post => (
    <article className="post-teaser" key={post.slug}>
      <Link className="post-image" to={`/breakdowns/${post.slug}`} tabIndex={-1} aria-hidden="true"><img src={post.image} alt="" loading="lazy" /></Link>
      <div className="post-teaser-copy">
        <p className="post-meta">{post.category} <span aria-hidden="true">/</span> <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></p>
        <Heading><Link to={`/breakdowns/${post.slug}`}>{post.title}</Link></Heading>
        <p>{post.summary}</p>
        <Link className="text-link" to={`/breakdowns/${post.slug}`}>Read the breakdown<span className="sr-only">: {post.title}</span></Link>
      </div>
    </article>
  ))}</div>;
}
