import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { services, audiences } from "../data";

function Drop({ label, to, items }: { label: string; to: string; items: { title: string; route: string }[] }) {
  return (
    <div className="group relative">
      <NavLink to={to} className={({ isActive }) => `flex items-center gap-1 py-6 hover:text-brand-500 ${isActive ? "text-brand-500" : ""}`}>{label}<ChevronDown size={14} /></NavLink>
      <div className="invisible absolute left-0 top-full w-72 rounded-xl border border-slate-100 bg-white p-2 opacity-0 shadow-card transition group-hover:visible group-hover:opacity-100">
        {items.map((i) => <Link key={i.route} to={i.route} className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-600">{i.title}</Link>)}
      </div>
    </div>
  );
}

const links = [["Our Work", "/work"], ["Team & Experts", "/experts"], ["About", "/about"]];

function Navbar() {
  const [open, setOpen] = useState(false);
  const nav = ({ isActive }: { isActive: boolean }) => `hover:text-brand-500 ${isActive ? "text-brand-500" : ""}`;
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="container-x flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">K</span>Klexford
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          <Drop label="Services" to="/services" items={services} />
          <Drop label="Who We Help" to="/who-we-help" items={audiences} />
          {links.map(([l, h]) => <NavLink key={h} to={h} className={nav}>{l}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login" className="text-sm font-medium hover:text-brand-500">Login</Link>
          <Link to="/start-a-project" className="btn-primary">Start a Project</Link>
        </div>
        <button className="py-5 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="container-x max-h-[80vh] space-y-1 overflow-y-auto pb-5 lg:hidden" onClick={() => setOpen(false)}>
          {[["Services", "/services"], ["Who We Help", "/who-we-help"], ...links, ["Resources", "/resources"], ["Login", "/login"]].map(([l, h]) => (
            <Link key={h} to={h} className="block rounded-lg px-3 py-2 hover:bg-brand-50">{l}</Link>
          ))}
          <Link to="/start-a-project" className="btn-primary mt-2 w-full justify-center">Start a Project</Link>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const cols = [
    { h: "Services", l: services.map((s) => [s.title, s.route]) },
    { h: "Who We Help", l: audiences.map((a) => [a.title, a.route]) },
    { h: "Company", l: [["About", "/about"], ["Our Work", "/work"], ["Team & Experts", "/experts"], ["Become an Expert", "/become-an-expert"], ["Expert / Admin Login", "/login"]] },
    { h: "Resources", l: [["Resources", "/resources"], ["Tools", "/tools"], ["Free Visibility Check", "/tools/visibility-check"], ["Book Marketing", "/book-author-services/book-marketing"], ["Start a Project", "/start-a-project"]] },
  ];
  return (
    <footer className="bg-slate-50 pt-16">
      <div className="container-x grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="flex items-center gap-2 text-xl font-bold text-brand-600"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">K</span>Klexford</p>
          <p className="mt-3 text-sm text-slate-600">Publishing, Digital and Growth Services for authors and businesses.</p>
          <div className="mt-5 flex gap-2">
            {[Facebook, Instagram, Linkedin, Twitter].map((I, k) => <a key={k} href="#" className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white hover:bg-brand-600"><I size={15} /></a>)}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="font-semibold">{c.h}</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">{c.l.map(([t, r]) => <li key={r}><Link to={r} className="hover:text-brand-600">{t}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="bg-ink py-4 text-xs text-white/70">
        <div className="container-x flex flex-wrap justify-between gap-2">
          <p>© {new Date().getFullYear()} Klexford. All rights reserved.</p>
          <p><Link to="/privacy" className="hover:text-white">Privacy Policy</Link> · <Link to="/terms" className="hover:text-white">Terms</Link></p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return (<><Navbar /><main><Outlet /></main><Footer /></>);
}
