import { Link, NavLink } from "react-router-dom";
import HaloLettering from "./HaloLettering";
import { GEOV_URL, MUSEUM_URL } from "../content/show";

const links = [{ to: "/", label: "Home" }, { to: "/episodes", label: "Episodes" }, { to: "/breakdowns", label: "Breakdowns" }, { to: "/about", label: "About" }];

export default function Nav() {
  return (
    <header className="site-header">
      <div className="nav-inner wrap">
        <Link className="site-mark" to="/" aria-label="Mook and Mush home"><HaloLettering text="Mook & Mush" cap={21} /></Link>
        <nav aria-label="Main navigation">
          {links.map(({ to, label }) => <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>)}
          <a className="nav-studio" href={MUSEUM_URL}>The Museum</a>
          <a className="nav-studio" href={GEOV_URL}>GeoV Studio</a>
          <NavLink to="/faulty-tolerance">Faulty Tolerance</NavLink>
        </nav>
      </div>
    </header>
  );
}
