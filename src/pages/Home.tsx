import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { audiences, services, team, work } from "../data";
import { CTA, Img } from "../components/ui";

export function ServiceCards() {
  return <div className="service-index">{services.map(s =>
    <Link to={s.route} key={s.slug}><s.icon aria-hidden="true" size={23} strokeWidth={1.4}/>
      <div><h3>{s.title}</h3><p>{s.desc}</p></div><ArrowUpRight size={22}/>
    </Link>)}</div>;
}

export function AudienceCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {audiences.map((a) => (
        <Link key={a.route} to={a.route} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-brand-500 hover:shadow-card">
          <div className="relative">
            <Img src={a.image} alt={a.title} className="h-40 w-full" />
            <span className="absolute -bottom-5 left-5 grid h-11 w-11 place-items-center rounded-lg bg-white text-mint shadow-card"><a.icon size={20} /></span>
          </div>
          <div className="p-6 pt-8">
            <h3 className="font-semibold group-hover:text-brand-600">{a.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{a.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function WorkCard({ w }: { w: (typeof work)[number] }) {
  return <article className="work-card">
    <Img src={w.image} alt="" className="work-image" />
    <div className="work-copy"><p className="eyebrow">{w.tag}</p><h3>{w.title}</h3><p>{w.summary}</p></div>
  </article>;
}

export function TeamGrid({ limit }: { limit?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {team.slice(0, limit).map((m) => (
        <div key={m.role} className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-card">
          <Img src={m.image} alt={m.role} className="aspect-square w-full" />
          <div className="p-5 text-center"><h3 className="font-semibold">{m.role}</h3></div>
        </div>
      ))}
    </div>
  );
}


const features = [
  { image: "/images/architecture.jpg", alt: "Looking up between two curved architectural facades", title: "Form & identity", route: "/branding-creative", tone: "architecture" },
  { image: "/images/library.jpg", alt: "Rows of books arranged on library shelves", title: "Books & publishing", route: "/book-author-services", tone: "library" },
  { image: "/images/studio.jpg", alt: "Light falling across a design studio", title: "Digital experiences", route: "/website-development", tone: "studio" },
];
const disciplines = ["Publishing", "Digital experiences", "Automation", "Growth strategy", "Brand identity"];

export default function Home() {
  const [index, setIndex] = useState(0);
  const feature = features[index];
  const cycle = (direction: number) => setIndex(i => (i + direction + features.length) % features.length);
  return <>
    <section className="cover">
      <div className="cover-copy"><p className="kicker"><i/>Independent creative agency</p>
        <h1>Ideas into<br/><em>influence.</em></h1>
        <p className="lead">We bring publishing, brand and digital together to help authors and businesses find their audience.</p>
        <Link to="/work" className="cover-link">Explore our work <ArrowRight size={17}/></Link>
      </div>
      <div className={`feature-art ${feature.tone}`}>
        <img key={feature.image} src={feature.image} alt={feature.alt} fetchPriority="high"/>
        <div className="feature-caption"><div aria-live="polite"><span>Studio perspectives · 0{index + 1} / 03</span>
          <Link to={feature.route}>{feature.title} <ArrowUpRight size={17}/></Link></div>
          <div className="feature-controls"><button aria-label="Previous perspective" onClick={() => cycle(-1)}><ChevronLeft size={18}/></button><button aria-label="Next perspective" onClick={() => cycle(1)}><ChevronRight size={18}/></button></div>
        </div>
      </div>
    </section>
    <nav className="discipline-strip" aria-label="Agency disciplines"><div className="container-x">
      {services.map((s,i) => <Link key={s.slug} to={s.route}><s.icon size={18} strokeWidth={1.4}/>{disciplines[i]}</Link>)}
    </div></nav>
    <section className="folio container-x"><p className="kicker dark"><i/>Portfolio</p>
      <div className="section-title"><h2>Selected <em>work.</em></h2><Link to="/work" className="line-link">View all work <ArrowUpRight size={16}/></Link></div>
      <div className="folio-grid">{[work[0], work[5]].map(w => <WorkCard key={w.title} w={w}/>)}</div>
    </section>
    <section className="capabilities"><div className="container-x capability-layout"><div><p className="kicker dark"><i/>Our capabilities</p>
      <h2>Five disciplines.<br/><em>One studio.</em></h2>
      <Link to="/who-we-help" className="line-link">Who we work with <ArrowUpRight size={16}/></Link></div>
      <ServiceCards/></div>
    </section>
    <CTA/>
  </>;
}
