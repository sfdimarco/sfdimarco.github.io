import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import GamutCursor from "./components/GamutCursor";
import { LightboxProvider } from "./components/Lightbox";
import Home from "./pages/Home";
import Lab from "./pages/Lab";

export default function App() {
  const [dark, setDark] = useState(true);

  return (
    <HashRouter>
      <LightboxProvider>
        <div style={{
          background: "#070707",
          minHeight: "100vh",
          color: "#e0e0e0",
          fontFamily: "'Space Mono', monospace",
          overflowX: "hidden",
          filter: dark ? "none" : "invert(1) hue-rotate(180deg)",
          transition: "filter 0.4s",
        }}>
          <GamutCursor />
          <Nav dark={dark} setDark={setDark} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lab" element={<Lab />} />
          </Routes>
        </div>
      </LightboxProvider>
    </HashRouter>
  );
}
