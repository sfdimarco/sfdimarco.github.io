import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Episodes from "./pages/Episodes";
import Breakdowns from "./pages/Breakdowns";
import BreakdownPost from "./pages/BreakdownPost";
import About from "./pages/About";
import { CHANNEL_URL } from "./content/show";

function Site() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main" onClick={(event) => {
        event.preventDefault();
        document.getElementById("main")?.focus();
      }}>Skip to content</a>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/episodes" element={<Episodes />} />
          <Route path="/breakdowns" element={<Breakdowns />} />
          <Route path="/breakdowns/:slug" element={<BreakdownPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/work" element={<Navigate to="/" replace />} />
          <Route path="/lab" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer wrap">
        <p>A cartoon by Sean “Mook” DiMarco, made with Claude in GeoV Studio.</p>
        <div><a href={CHANNEL_URL} target="_blank" rel="noreferrer">YouTube</a><a href="https://github.com/sfdimarco" target="_blank" rel="noreferrer">GitHub</a></div>
      </footer>
    </>
  );
}

export default function App() {
  return <HashRouter><Site /></HashRouter>;
}
