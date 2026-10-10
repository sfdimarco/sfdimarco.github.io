import { useState } from "react";
import { useLocation } from "react-router-dom";
import PostList from "../components/PostList";
import { breakdowns } from "../content/breakdowns";
import { usePageTitle } from "../lib/usePageTitle";
export default function Breakdowns() {
  usePageTitle("Breakdowns");
  const [query, setQuery] = useState("");
  const location = useLocation();
  const search = query.trim().toLocaleLowerCase();
  const posts = breakdowns.filter(post => [post.title, post.summary, post.category, ...post.body.map(b => typeof b === "string" ? b : b.h || (b.list || []).join(" ") || "")].join(" ").toLocaleLowerCase().includes(search));
  return <div className="wrap page">
    <header className="page-heading"><h1>Breakdowns</h1><p>A closer look at the episodes, the drawings, and the tools behind the show.</p></header>
    {location.state?.notFound && <p className="notice" role="status">That breakdown wasn’t found. Browse the articles below.</p>}
    <div className="search-row"><label htmlFor="post-search">Find a breakdown</label><input id="post-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search episodes, art, or process" /></div>
    <p className="sr-only" role="status">{posts.length} {posts.length === 1 ? "article" : "articles"} found</p>
    {posts.length ? <PostList posts={posts} headingLevel={2} /> : <p className="empty-state">No breakdowns match “{query}”. Try another word or clear your search.</p>}
  </div>;
}
