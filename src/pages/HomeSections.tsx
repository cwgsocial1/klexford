import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Img } from "../components/ui";
import { ProjectInquiryForm } from "../components/ProjectInquiryForm";
import { audiences, IMG, plans, resources, services } from "../data";
import { resourcePath } from "../lib/publicPaths";
import { portfolioUrl, usePublishedQuotes, usePublishedWork } from "../lib/portfolio";
import "../home-sections.css";
import ProcessStory from "./ProcessStory";

function SectionLink({ to, children }: { to: string; children: string }) {
  return <Link className="hs-link" to={to}>{children}<ArrowUpRight size={16} aria-hidden="true" /></Link>;
}

function Introduction() {
  return (
    <section className="hs-wrap hs-intro hs-pad" id="studio-intro" aria-labelledby="studio-title">
      <div><p className="hs-label">The studio</p><SectionLink to="/about">About Klexford</SectionLink></div>
      <div>
        <h2 id="studio-title">A team for the book, the brand and everything around it.</h2>
        <p>Work with an editor on a manuscript, a designer on your identity, or a team on a launch. One project lead coordinates the specialists, deadlines and handover.</p>
      </div>
    </section>
  );
}

function Departments() {
  const [book, ...departments] = services;
  return (
    <section className="hs-wrap hs-pad hs-top-rule" id="services" aria-labelledby="services-title">
      <div className="hs-head"><h2 id="services-title">Our services</h2><SectionLink to="/services">Compare services</SectionLink></div>
      <div className="hs-services">
        <Link className="hs-service-feature" to={book.route}>
          <Img src="/images/library.jpg" loading="lazy" alt="" />
          <div className="hs-feature-top"><span className="hs-glass-label"><BookOpen size={15} />Flagship department</span><ArrowUpRight /></div>
          <div className="hs-feature-copy"><h3>{book.title}</h3><p>Bring a manuscript to publication and plan how it will find its readers.</p></div>
        </Link>
        {departments.map(s => <Link className="hs-service" key={s.slug} to={s.route}>
          <div className="hs-service-icon"><s.icon size={22} strokeWidth={1.6} aria-hidden="true" /></div>
          <h3>{s.title}</h3><p>{s.desc}</p><ArrowUpRight className="hs-card-arrow" size={17} aria-hidden="true" />
        </Link>)}
      </div>
    </section>
  );
}

function AudienceIndex() {
  return (
    <section className="hs-wash" id="who-we-help" aria-labelledby="audience-title"><div className="hs-wrap hs-pad">
      <div className="hs-head"><h2 id="audience-title">Who we help</h2><SectionLink to="/who-we-help">Explore pathways</SectionLink></div>
      <div className="hs-audiences">{audiences.map(a => <Link key={a.slug} to={a.route}>
        <a.icon size={22} strokeWidth={1.6} aria-hidden="true"/><div><h3>{a.title}</h3><p>{a.desc}</p></div><ArrowUpRight size={15} aria-hidden="true"/>
      </Link>)}</div>
    </div></section>
  );
}

function SelectedWork() {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const { rows, loading, error, retry } = usePublishedWork({ homepage: true, limit: 6 });

  function updateEdges() {
    const el = track.current;
    if (!el) return;
    const start = el.scrollLeft <= 2;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setEdges(old => old.start === start && old.end === end ? old : { start, end });
  }

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [rows.length]);

  function move(direction: -1 | 1) {
    const el = track.current;
    if (!el) return;
    const positions = Array.from(el.children, card => (card as HTMLElement).offsetLeft);
    const next = direction > 0
      ? positions.find(left => left > el.scrollLeft + 2)
      : positions.reverse().find(left => left < el.scrollLeft - 2);
    if (next !== undefined) el.scrollTo({
      left: next,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <section className="hs-wrap hs-pad" id="work" aria-labelledby="work-title">
      <div className="hs-head"><h2 id="work-title">Selected work</h2>
        <div className="hs-work-nav"><SectionLink to="/work">Browse all work</SectionLink>
          {rows.length > 1 && !(edges.start && edges.end) && <div className="hs-reel-controls">
            <button aria-label="Previous project" aria-controls="project-reel" disabled={edges.start} onClick={() => move(-1)}><ArrowLeft size={17}/></button>
            <button aria-label="Next project" aria-controls="project-reel" disabled={edges.end} onClick={() => move(1)}><ArrowRight size={17}/></button>
          </div>}
        </div>
      </div>
      {loading && <p role="status">Loading projects…</p>}
      {error && <p role="status">Projects couldn’t be loaded. <button className="underline" onClick={retry}>Try again</button></p>}
      {!loading && !error && rows.length === 0 && <p>No projects are published yet.</p>}
      <div className="hs-work" id="project-reel" ref={track} onScroll={updateEdges}>{rows.map(w => <Link to={portfolioUrl(w)} key={w.id}>
        <div className="hs-work-image">{w.image ? <Img src={w.image} loading="lazy" alt="" /> : <div className="media-fallback" aria-hidden="true"/>}<span><ArrowUpRight size={19}/></span></div>
        <p className="hs-meta">{[w.category, w.legacy_slug ? "Illustrative project" : "Portfolio"].filter(Boolean).join(" · ")}</p><h3 className="break-words">{w.title}</h3><p className="line-clamp-3 break-words">{w.summary}</p>
      </Link>)}</div>
    </section>
  );
}

function BookFeature() {
  return (
    <section className="hs-wrap" id="book-marketing" aria-labelledby="book-title">
      <div className="hs-book"><div className="hs-book-copy">
        <p className="hs-label">Book marketing</p>
        <h2 id="book-title">Give your readers a way to find you.</h2>
        <p>Start with the genre, the reader and the release date. We shape the launch plan, develop the campaign materials and review how readers respond.</p>
        <Link className="hs-button hs-light-button" to="/book-author-services/book-marketing">Explore book marketing <ArrowRight size={16}/></Link>
      </div><Img src={IMG.book_author_services} alt="Books arranged on shelves" loading="lazy"/></div>
    </section>
  );
}

function Engagements() {
  return <>
    <ProcessStory/>
    <section id="ways-to-work" className="hs-wash" aria-labelledby="plans-title"><div className="hs-wrap hs-pad">
      <div className="hs-head"><h2 id="plans-title">Ways to work together</h2><p>We quote each engagement once the scope and deliverables are agreed.</p></div>
      <div className="hs-plans">{plans.map(p => <article key={p.title} className={p.featured ? "hs-plan hs-plan-featured" : "hs-plan"}>
        <h3>{p.title}</h3><p>{p.desc}</p><ul>{p.points.map(point => <li key={point}><Check size={15} aria-hidden="true"/>{point}</li>)}</ul>
        <Link className="hs-button" to={'/start-a-project?plan=' + encodeURIComponent(p.title)}>Discuss {p.title.toLowerCase()} <ArrowRight size={16}/></Link>
      </article>)}</div>
    </div></section>
  </>;
}

function StudioAndResources() {
  return <>
    <section id="experts" className="hs-wrap hs-pad hs-team" aria-labelledby="team-title">
      <Img src="/images/studio.jpg" alt="A sunlit studio workspace" loading="lazy"/>
      <div><p className="hs-label">Team &amp; experts</p><h2 id="team-title">Who works on your brief?</h2>
        <p>Editors, designers, developers and campaign specialists each own a part of the work. Before a project begins, we agree who will deliver it, who will review it and who you’ll hear from.</p>
        <div className="hs-actions"><SectionLink to="/experts">Explore specialties</SectionLink><SectionLink to="/become-an-expert">Become an expert</SectionLink></div>
      </div>
    </section>
    <section id="resources" className="hs-wrap hs-pad hs-top-rule" aria-labelledby="resource-title">
      <div className="hs-head"><h2 id="resource-title">Resources &amp; tools</h2><SectionLink to="/resources">All resources</SectionLink></div>
      <div className="hs-resource-grid"><div className="hs-reading-list">{resources.slice(0, 3).map(r => <Link key={r.title} to={resourcePath(r.title)}>
        <Img src={r.image} alt="" loading="lazy"/><div><small>{r.type}</small><h3>{r.title}</h3></div><ArrowUpRight size={17} aria-hidden="true"/>
      </Link>)}</div>
      <div id="visibility" className="hs-visibility"><Search size={25} strokeWidth={1.6} aria-hidden="true"/><h3>Free Visibility Check</h3>
        <p>Share a public book page, author profile or business website for a manual review with up to three observations and two practical next steps.</p>
        <SectionLink to="/tools/visibility-check">Request a review</SectionLink><SectionLink to="/tools">Browse all tools</SectionLink>
      </div></div>
    </section>
  </>;
}

function Testimonials() {
  const quotes = usePublishedQuotes();
  if (!quotes.rows.length) return null;
  return <section className="hs-wash" aria-labelledby="testimonials-title"><div className="hs-wrap hs-pad">
    <div className="hs-head"><h2 id="testimonials-title">Client testimonials</h2></div>
    <div className="grid gap-5 md:grid-cols-2">{quotes.rows.map(t => <figure key={t.id} className="rounded-2xl border border-slate-200 bg-white p-7">
      <blockquote className="whitespace-pre-line break-words text-xl">“{t.quote}”</blockquote>
      <figcaption className="mt-5 text-sm"><strong>{t.client_name}</strong>{t.client_title && <span> · {t.client_title}</span>}</figcaption>
    </figure>)}</div>
    {quotes.more && <div className="mt-6">
      {quotes.error && <p role="alert" className="mb-2">More testimonials could not be loaded.</p>}
      <button type="button" className="btn-ghost" disabled={quotes.loading} onClick={quotes.next}>{quotes.loading ? "Loading…" : quotes.error ? "Try again" : "More testimonials"}</button>
    </div>}
  </div></section>;
}

export default function HomeSections() {
  const sectionRoot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = sectionRoot.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;

    function observeEntrances() {
      observer?.disconnect();
      if (preference.matches || !root) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          target.classList.add("hs-arrived");
          observer?.unobserve(target);
        });
      }, { threshold: 0.08 });
      const panels = root.querySelectorAll(".hs-intro > div, .hs-head, .hs-services > a, .hs-audiences > a, .hs-book-copy, .hs-plans > article, .hs-team > div, .hs-reading-list > a, .hs-visibility, .hs-inquiry > div:first-child");
      panels.forEach(el => { if (!el.classList.contains("hs-arrived")) observer?.observe(el); });
    }

    observeEntrances();
    preference.addEventListener("change", observeEntrances);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", observeEntrances);
    };
  }, []);
  return <div className="home-sections" ref={sectionRoot}>
    <Introduction/><Departments/><AudienceIndex/><SelectedWork/><BookFeature/><Engagements/><Testimonials/><StudioAndResources/>
    <section id="inquiry" className="hs-wash" aria-labelledby="inquiry-title"><div className="hs-wrap hs-pad hs-inquiry">
      <div><p className="hs-label">Start a project</p><h2 id="inquiry-title">Tell us what you’re building.</h2>
        <p>Which audience do you want to reach, and what would you like them to do? Share your brief so the right specialists can prepare.</p>
      </div><div className="hs-form"><ProjectInquiryForm/></div>
    </div></section>
  </div>;
}
