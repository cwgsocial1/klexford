import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { audiences, services } from "../data";
import { useSiteSettings } from "../lib/siteSettings";
import Brand from "./Brand";
import ReadingProgress from "./ReadingProgress";
import "./navigation-motion.css";
import "./home-navigation.css";

const pages = [["Our Work", "/work"], ["Team & Experts", "/experts"], ["About", "/about"]];
const groups = [
  { name: "Services", route: "/services", items: services },
  { name: "Who We Help", route: "/who-we-help", items: audiences },
];
const footerGroups = [
  ...groups.map(g => ({ title: g.name, links: g.items.map(i => [i.title, i.route]) })),
  { title: "Explore", links: [...pages, ["Resources", "/resources"], ["Tools", "/tools"], ["Visibility Check", "/tools/visibility-check"], ["Become an Expert", "/become-an-expert"], ["Start a Project", "/start-a-project"]] },
  { title: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Team portal", "/login"]] },
];

export default function Layout() {
  const { agency_name, contact_email } = useSiteSettings();
  const { pathname, hash } = useLocation();
  const header = useRef<HTMLElement>(null);
  const main = useRef<HTMLElement>(null);
  const lastPath = useRef(pathname);
  const curtain = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState("");
  useEffect(() => {
    if (open) header.current?.querySelector<HTMLButtonElement>(".nav-group > button")?.focus();
  }, [open]);
  const close = () => { setOpen(false); setGroup(""); };
  useLayoutEffect(() => {
    const changed = pathname !== lastPath.current;
    close();
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: "instant" });
    if (changed && !hash) main.current?.focus({ preventScroll: true });
    lastPath.current = pathname;
    if (!changed || hash || !curtain.current?.animate) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    if (!motion.matches) return;
    const wipe = curtain.current.animate([
      { transform: "translateX(0)", opacity: .72 },
      { transform: "translateX(108%)", opacity: 0 },
    ], { duration: 410, easing: "cubic-bezier(.35,0,.18,1)" });
    const stop = () => wipe.cancel();
    motion.addEventListener("change", stop);
    return () => {
      motion.removeEventListener("change", stop);
      stop();
    };
  }, [pathname, hash]);
  useEffect(() => {
    const title = document.querySelector("main h1")?.textContent;
    document.title = pathname === "/" ? agency_name + " — Publishing, Digital & Growth Services" : (title || "Studio") + " | " + agency_name;
  }, [pathname, agency_name]);
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (!header.current?.contains(e.target as Node)) close(); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return <>
    <ReadingProgress/>
    <div className="route-curtain" aria-hidden="true" ref={curtain}/>
    <a className="skip" href="#content">Skip to content</a>
    <header ref={header} className={'masthead ' + (pathname === "/" ? "on-cover" : "")} onKeyDown={e => {
      if(e.key !== "Escape") return;
      const active = header.current?.querySelector<HTMLButtonElement>('.nav-group button[aria-expanded="true"]');
      if(active) { setGroup(""); active.focus(); } else { close(); header.current?.querySelector<HTMLButtonElement>(".menu-toggle")?.focus(); }
    }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) close(); }}>
      <div className="mast-inner">
        <Brand name={agency_name}/>
        <nav id="agency-nav" className={'agency-nav ' + (open ? "is-open" : "")} aria-label="Main navigation">
          {groups.map(g => <div className="nav-group" key={g.route}>
            <button aria-expanded={group === g.name} aria-controls={'menu-'+g.route.slice(1)} onClick={() => setGroup(group === g.name ? "" : g.name)}>{g.name}<ChevronDown size={12}/></button>
            <div className="nav-panel" hidden={group !== g.name} id={'menu-'+g.route.slice(1)} onClick={close}>
              <Link to={g.route}>Explore {g.name.toLowerCase()}</Link>
              {g.items.map(i => <Link key={i.route} to={i.route}>{i.title}</Link>)}
            </div>
          </div>)}
          {pages.map(([name,url]) => <NavLink key={url} to={url} onClick={close}>{name}</NavLink>)}
        </nav>
        <Link to="/start-a-project" className="nav-cta" onClick={close}>Start a Project</Link>
        <button className="menu-toggle" aria-controls="agency-nav" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => {setOpen(!open);setGroup("");}}>
          <span className="menu-glyph" aria-hidden="true"><i/><i/><i/></span>
        </button>
      </div>
    </header>
    <main key={pathname} ref={main} id="content" tabIndex={-1} className={pathname === "/" ? undefined : "route-arrival"}><Outlet/></main>
    <footer className="site-footer"><div className="container-x">
      <div className="footer-grid"><div>
        <Brand name={agency_name}/>
        <a href="https://cyberworldgroups.com" className="footer-partner">
          <img src="/images/cyberworldgroups.webp" alt="" width="48" height="48" loading="lazy" className="h-12 w-12 shrink-0 rounded-full"/>
          <span>In partnership with <strong className="block">CyberworldGroups</strong></span>
        </a>
        <p>Publishing, digital and growth services for authors and businesses.</p>
      </div>
        {footerGroups.map(g => <div key={g.title}><h2>{g.title}</h2>{g.links.map(([name,url]) => <Link key={url} to={url}>{name}</Link>)}</div>)}
      </div><div className="footer-meta">© {new Date().getFullYear()} {agency_name} · <a href={`mailto:${contact_email}`}>{contact_email}</a> · <a href="tel:+17408604870">Call +1 740 860 4870</a></div>
    </div></footer>
  </>;
}
