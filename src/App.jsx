import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import GamutCursor from "./components/GamutCursor";
import { LightboxProvider } from "./components/Lightbox";
import Landing from "./pages/Landing";
import Work from "./pages/Work";
import Lab from "./pages/Lab";
import About from "./pages/About";

export default function App() {
  const [dark, setDark] = useState(true);

  return (
    <HashRouter>
      <LightboxProvider>
        <div
          data-theme={dark ? "dark" : "light"}
          style={{
            minHeight: "100vh",
            overflowX: "hidden",
            transition: "background 0.4s, color 0.4s",
          }}
        >
          <GamutCursor />
          <Nav dark={dark} setDark={setDark} />
          <Routes>
            <Route path="/"      element={<Landing />} />
            <Route path="/work"  element={<Work />} />
            <Route path="/lab"   element={<Lab />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </LightboxProvider>
    </HashRouter>
  );
}