import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Brand from "./Brand";

const mainLinks = [["Work", "/work"], ["Capabilities", "/services"], ["Studio", "/about"], ["Resources", "/resources"]];
const footerLinks = [
  { title: "Explore", links: mainLinks },
  { title: "Studio", links: [["Who we help", "/who-we-help"], ["Our specialists", "/experts"], ["Join the team", "/become-an-expert"]] },
  { title: "Connect", links: [["Start a project", "/start-a-project"], ["Visibility check", "/tools/visibility-check"], ["Tools", "/tools"], ["Team portal", "/login"]] },
];

export default function Layout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setOpen(false);
    const title = document.querySelector("main h1")?.textContent;
    document.title = pathname === "/" ? "Klexford — Independent Creative Agency" : `${title || "Studio"} | Klexford`;
  }, [pathname]);
  return <>
    <a className="skip" href="#content">Skip to content</a>
    <header className="masthead">
      <div className="container-x mast-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary">{mainLinks.map(([name, url]) => <NavLink key={url} to={url}>{name}</NavLink>)}</nav>
        <Link to="/start-a-project" className="nav-cta">Start a project <ArrowUpRight size={15} /></Link>
        <button className="menu-toggle" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
      </div>
      {open && <nav id="mobile-nav" className="mobile-nav container-x" aria-label="Mobile" onClick={() => setOpen(false)}>
        {[...mainLinks, ["Who we help", "/who-we-help"], ["Team portal", "/login"]].map(([name, url]) => <NavLink to={url} key={url}>{name}<ArrowUpRight size={17}/></NavLink>)}
      </nav>}
    </header>
    <main id="content"><Outlet /></main>
    <footer className="site-footer"><div className="container-x">
      <div className="footer-grid"><div><Brand/><p>Publishing, digital and growth.<br/>An independent creative agency.</p></div>
        {footerLinks.map(group => <div key={group.title}><h2>{group.title}</h2>{group.links.map(([name, url]) => <Link key={url} to={url}>{name}</Link>)}</div>)}
      </div>
      <div className="footer-meta"><span>© {new Date().getFullYear()} Klexford</span><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div>
    </div></footer>
  </>;
}
