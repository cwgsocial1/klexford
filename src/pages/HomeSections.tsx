import { ArrowRight, ArrowUpRight, BookOpen, Check, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { ProjectInquiryForm } from "../components/ProjectInquiryForm";
import { audiences, IMG, plans, resources, services, steps, work } from "../data";
import { casePath, resourcePath } from "../lib/publicPaths";
import "../home-sections.css";

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
          <img src="/images/library.jpg" loading="lazy" alt="" />
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
  return (
    <section className="hs-wrap hs-pad" id="work" aria-labelledby="work-title">
      <div className="hs-head"><h2 id="work-title">Selected work</h2><SectionLink to="/work">All project examples</SectionLink></div>
      <div className="hs-work">{[work[0], work[2], work[5]].map(w => <Link to={casePath(w.title)} key={w.title}>
        <div className="hs-work-image"><img src={w.image} loading="lazy" alt="" /><span><ArrowUpRight size={19}/></span></div>
        <p className="hs-meta">{w.tag} · Illustrative project</p><h3>{w.title}</h3><p>{w.summary}</p>
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
      </div><img src={IMG.book_author_services} alt="Books arranged on shelves" loading="lazy"/></div>
    </section>
  );
}

function Engagements() {
  return <>
    <section className="hs-wrap hs-pad" id="process" aria-labelledby="process-title">
      <div className="hs-head"><h2 id="process-title">How we work</h2></div>
      <ol className="hs-steps">{steps.map(s => <li key={s.n}>
        <span className="hs-step-number">{s.n}</span><h3>{s.title}</h3><p>{s.desc}</p>
      </li>)}</ol>
    </section>
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
      <img src="/images/studio.jpg" alt="A sunlit studio workspace" loading="lazy"/>
      <div><p className="hs-label">Team &amp; experts</p><h2 id="team-title">Who works on your brief?</h2>
        <p>Editors, designers, developers and campaign specialists each own a part of the work. Before a project begins, we agree who will deliver it, who will review it and who you’ll hear from.</p>
        <div className="hs-actions"><SectionLink to="/experts">Explore specialties</SectionLink><SectionLink to="/become-an-expert">Become an expert</SectionLink></div>
      </div>
    </section>
    <section id="resources" className="hs-wrap hs-pad hs-top-rule" aria-labelledby="resource-title">
      <div className="hs-head"><h2 id="resource-title">Resources &amp; tools</h2><SectionLink to="/resources">All resources</SectionLink></div>
      <div className="hs-resource-grid"><div className="hs-reading-list">{resources.slice(0, 3).map(r => <Link key={r.title} to={resourcePath(r.title)}>
        <img src={r.image} alt="" loading="lazy"/><div><small>{r.type}</small><h3>{r.title}</h3></div><ArrowUpRight size={17} aria-hidden="true"/>
      </Link>)}</div>
      <div id="visibility" className="hs-visibility"><Search size={25} strokeWidth={1.6} aria-hidden="true"/><h3>Free Visibility Check</h3>
        <p>Share a public book page, author profile or business website for a manual review with up to three observations and two practical next steps.</p>
        <SectionLink to="/tools/visibility-check">Request a review</SectionLink><SectionLink to="/tools">Browse all tools</SectionLink>
      </div></div>
    </section>
  </>;
}

export default function HomeSections() {
  return <div className="home-sections">
    <Introduction/><Departments/><AudienceIndex/><SelectedWork/><BookFeature/><Engagements/><StudioAndResources/>
    <section id="inquiry" className="hs-wash" aria-labelledby="inquiry-title"><div className="hs-wrap hs-pad hs-inquiry">
      <div><p className="hs-label">Start a project</p><h2 id="inquiry-title">Tell us what you’re building.</h2>
        <p>Which audience do you want to reach, and what would you like them to do? Share your brief so the right specialists can prepare.</p>
      </div><div className="hs-form"><ProjectInquiryForm/></div>
    </div></section>
  </div>;
}
