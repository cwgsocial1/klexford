import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Mail, MapPin, Search, Target, Megaphone, Users, Rocket, Award, Heart, Shield } from "lucide-react";
import { services, audiences, work, steps, faqs, resources, tools, IMG, plans } from "../data";
import { Section, Heading, Img, PageHero, CTA, FAQ, field, Label } from "../components/ui";
import { ServiceCards, AudienceCards, WorkCard, TeamGrid } from "./Home";
import { addInquiry } from "../lib/store";

/* ---------- Services ---------- */
export function Services() {
  return (<>
    <PageHero eyebrow="Our Services" title="Five departments," accent="one connected team." text="Compare our services and go straight to the department you need. Book & Author Services is our flagship." image={IMG.office}>
      <Link to="/start-a-project" className="btn-primary">Start a Project</Link>
    </PageHero>
    <Section><ServiceCards /></Section>
    <Section className="bg-slate-50"><div className="capability-layout">
      <Heading eyebrow="Finding your team" pre="Start with" accent="your audience."/>
      <div><p className="max-w-xl text-lg">An author preparing for publication needs a different team from a business redesigning its booking system. Explore the services that fit your brief.</p>
      <Link to="/who-we-help" className="line-link mt-6">Find your team <ArrowRight size={16}/></Link></div></div></Section>
    <CTA />
  </>);
}

const bookGroups = [
  ["Book Marketing & Promotion", "Audience and positioning review, launch planning, author email strategy, promotional assets and agreed campaign management."],
  ["Editing & Proofreading", "Developmental editing, line or copyediting and proofreading, matched to manuscript needs."],
  ["Book Design & Formatting", "Cover design, paperback or hardback interiors, EPUB conversion and promotional design."],
  ["Publishing Support", "File preparation, upload assistance, metadata research and platform setup within the agreed scope."],
  ["Author Presence", "Author websites, book landing pages, newsletter setup and reader signup journeys."],
];

export function ServiceDetail({ slug }: { slug: string }) {
  const s = services.find((x) => x.slug === slug)!;
  const isBook = slug === "book-author-services";
  const groups = isBook ? bookGroups : s.items.map((it) => [it, `${it} delivered within an agreed scope, owned by an identified Klexford specialist and quality-reviewed before handover.`]);
  const related = work.filter((w) => w.tag.toLowerCase().includes(s.title.split(" ")[0].toLowerCase()) || (isBook && w.tag.startsWith("Book"))).slice(0, 3);
  return (<>
    <PageHero eyebrow={s.title} title={isBook ? "Develop your book. Prepare its launch." : s.desc} accent={isBook ? "Reach your readers." : undefined}
      text={isBook ? "Commission one service, or receive coordinated support across every stage your book needs." : `Explore what our ${s.title} team delivers and how we work.`} image={s.image}>
      <Link to={`/start-a-project?service=${encodeURIComponent(s.title)}`} className="btn-primary">Start a Project <ArrowRight size={16} /></Link>
      {isBook && <Link to="/book-author-services/book-marketing" className="btn-ghost">Book Marketing</Link>}
    </PageHero>
    <Section>
      <Heading eyebrow="What's Included" pre="Services in" accent="this department" center />
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(([t, d], i) => (
          <div key={t} className={`rounded-2xl border p-7 ${isBook && i === 0 ? "border-brand-500 bg-brand-500 text-white" : "border-slate-200"}`}>
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${isBook && i === 0 ? "bg-white text-brand-500" : "bg-brand-50 text-brand-500"}`}><s.icon size={20} /></span>
            <h3 className="mt-4 text-lg font-semibold">{t}</h3>
            <p className={`mt-2 text-sm ${isBook && i === 0 ? "text-white/85" : "text-slate-600"}`}>{d}</p>
            {isBook && i === 0 && <Link to="/book-author-services/book-marketing" className="mt-4 inline-block text-sm font-semibold">Learn more →</Link>}
          </div>
        ))}
      </div>
    </Section>
    <Section className="bg-ink text-white">
      <Heading eyebrow="Process" pre="How we" accent="deliver" center light />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{steps.map((st) => <div key={st.n} className="rounded-2xl border border-white/10 bg-white/5 p-6"><span className="text-3xl font-bold text-brand-500">{st.n}</span><h3 className="mt-3 font-semibold">{st.title}</h3><p className="mt-2 text-sm text-white/70">{st.desc}</p></div>)}</div>
    </Section>
    {related.length > 0 && <Section className="bg-slate-50"><Heading eyebrow="Related Work" pre="Examples from" accent="this team" /><div className="mt-10 grid gap-6 md:grid-cols-3">{related.map((w) => <WorkCard key={w.title} w={w} />)}</div></Section>}
    <Section><Heading eyebrow="FAQ" pre="Common" accent="questions" center /><div className="mt-10"><FAQ items={faqs} /></div></Section>
    <CTA />
  </>);
}

/* ---------- Book Marketing ---------- */
export function BookMarketing() {
  const blocks = [
    { icon: Target, t: "Define the reader", pts: ["Intended audience & genre", "Book stage & release date", "Current author platform", "Campaign goal"] },
    { icon: Megaphone, t: "Present the work", pts: ["Positioning review", "Campaign plan", "Author platform improvements", "Promotional assets & channels"] },
    { icon: Rocket, t: "Launch & review", pts: ["Agreed responsibilities & dates", "Deliverables & media costs", "Launch activity", "Post-launch review"] },
  ];
  return (<>
    <PageHero eyebrow="Book & Author Services" title="Book Marketing that" accent="reaches real readers." text="Reader-focused planning, launch support and promotional assets — delivered by a dedicated team, with honest reporting and no guaranteed-sales claims." image={IMG.bookLaunch}>
      <Link to="/start-a-project?service=Book%20%26%20Author%20Services&type=Authors%20%26%20Publishers" className="btn-primary">Plan My Launch</Link>
      <Link to="/tools/visibility-check" className="btn-ghost">Free Visibility Check</Link>
    </PageHero>
    <Section>
      <div className="grid gap-6 lg:grid-cols-3">
        {blocks.map((b, i) => (
          <div key={b.t} className="rounded-2xl border border-slate-200 p-8">
            <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-500"><b.icon /></span><span className="text-sm font-bold text-slate-400">STEP 0{i + 1}</span></div>
            <h3 className="mt-5 text-xl font-semibold">{b.t}</h3>
            <ul className="mt-5 space-y-3">{b.pts.map((p) => <li key={p} className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-mint" />{p}</li>)}</ul>
          </div>
        ))}
      </div>
    </Section>
    <Section className="bg-slate-50">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Img src={IMG.writing} className="aspect-[4/3] w-full rounded-3xl shadow-card" />
        <div>
          <Heading eyebrow="The Complete Pathway" pre="From manuscript to" accent="reader's hands" />
          <p className="mt-5 text-slate-600">Marketing works best when the book is ready. Combine your campaign with any of our book services:</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">{bookGroups.map(([t]) => <div key={t} className="flex items-center gap-2 rounded-lg bg-white p-3 text-sm font-medium shadow-sm"><Check size={16} className="text-brand-500" />{t}</div>)}</div>
          <Link to="/book-author-services" className="btn-primary mt-8">All Book Services</Link>
        </div>
      </div>
    </Section>
    <CTA title="Let's plan your book launch." to="/start-a-project?service=Book%20%26%20Author%20Services" />
  </>);
}

/* ---------- Who We Help ---------- */
export function WhoWeHelp() {
  return (<>
    <PageHero eyebrow="Who We Help" title="Choose the pathway" accent="built for you." text="Six audience pathways, each linking to the services, work and process most relevant to you." />
    <Section><AudienceCards /></Section>
    <CTA />
  </>);
}

const audienceExtra: Record<string, { needs: string[]; svc: string[] }> = {
  "authors-publishers": { needs: ["Reach the right readers", "A professional, ready-to-publish book", "An author platform that grows"], svc: ["book-author-services", "website-development", "branding-creative"] },
  creators: { needs: ["A portfolio that wins work", "A recognisable brand", "Organised inquiries"], svc: ["website-development", "branding-creative", "crm-automation"] },
  agencies: { needs: ["Reliable white-label delivery", "Clear scope & communication", "Defined responsibilities"], svc: ["website-development", "branding-creative", "crm-automation"] },
  "home-services": { needs: ["More estimate requests", "Fast follow-up", "Repeat customers"], svc: ["website-development", "crm-automation", "growth-studio"] },
  appointments: { needs: ["Easy online booking", "Fewer no-shows", "Consistent communication"], svc: ["crm-automation", "website-development", "growth-studio"] },
  "local-businesses": { needs: ["Be found locally", "A credible brand", "Organised inquiries"], svc: ["website-development", "growth-studio", "branding-creative"] },
};

export function AudienceDetail() {
  const { slug } = useParams();
  const a = audiences.find((x) => x.slug === slug);
  if (!a) return <NotFound />;
  const ex = audienceExtra[a.slug];
  return (<>
    <PageHero eyebrow="Who We Help" title={a.title} text={a.desc} image={a.image}>
      <Link to={`/start-a-project?type=${encodeURIComponent(a.title)}`} className="btn-primary">Start a Project</Link>
    </PageHero>
    <Section>
      <div className="grid gap-12 lg:grid-cols-2">
        <div><Heading eyebrow="Your Needs" pre="What matters" accent="most to you" />
          <ul className="mt-8 space-y-4">{ex.needs.map((n) => <li key={n} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"><Check className="text-mint" />{n}</li>)}</ul></div>
        <div><Heading eyebrow="Recommended" pre="Relevant" accent="services" />
          <div className="mt-8 space-y-4">{ex.svc.map((sl) => { const s = services.find((x) => x.slug === sl)!; return (
            <Link key={sl} to={s.route} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 hover:border-brand-500 hover:shadow-card"><Img src={s.image} className="h-16 w-16 rounded-lg" /><div><p className="font-semibold">{s.title}</p><p className="text-sm text-slate-600">{s.desc}</p></div></Link>); })}</div></div>
      </div>
    </Section>
    <Section className="bg-slate-50"><Heading eyebrow="FAQ" pre="Questions from" accent={a.title} center /><div className="mt-10"><FAQ items={faqs} /></div></Section>
    <CTA to={`/start-a-project?type=${encodeURIComponent(a.title)}`} />
  </>);
}

/* ---------- Work ---------- */
export function Work() {
  const tags = ["All", ...Array.from(new Set(work.map((w) => w.tag)))];
  const [f, setF] = useState("All");
  return (<>
    <PageHero eyebrow="Our Work" title="The work" accent="in practice." text="Explore example briefs across publishing, brand, growth and digital. Choose a discipline to see the work it can involve." />
    <Section>
      <div className="mb-10 flex flex-wrap justify-center gap-2">{tags.map((t) => <button key={t} aria-pressed={f === t} onClick={() => setF(t)} className={`rounded-full px-4 py-2 text-sm font-medium ${f === t ? "bg-brand-500 text-white" : "bg-slate-100 hover:bg-brand-50"}`}>{t}</button>)}</div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{work.filter((w) => f === "All" || w.tag === f).map((w) => <WorkCard key={w.title} w={w} />)}</div>
    </Section>
    <CTA />
  </>);
}

/* ---------- Experts ---------- */
export function Experts() {
  return (<>
    <PageHero eyebrow="Team & Experts" title="The people" accent="behind the work." text="Every Klexford offer is owned by an identified specialist responsible for scope, quality review and delivery.">
      <Link to="/become-an-expert" className="btn-primary">Become an Expert</Link><Link to="/login" className="btn-ghost">Expert Login</Link>
    </PageHero>
    <Section><TeamGrid /></Section>
    <CTA title="Want to collaborate with Klexford?" text="We welcome skilled specialists in publishing, web, automation, growth and creative work." to="/become-an-expert" />
  </>);
}

/* ---------- Generic form wrapper ---------- */
function Done({ title }: { title: string }) {
  return <div className="py-12 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50"><Check className="text-mint" size={32} /></span><h3 className="mt-4 text-xl font-semibold">{title}</h3><p className="mt-1 text-slate-600">Saved in this browser’s demo workspace.</p></div>;
}
const fd = (e: FormEvent<HTMLFormElement>) => Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;

export function BecomeExpert() {
  const [sent, setSent] = useState(false);
  return (<>
    <PageHero eyebrow="Become an Expert" title="Deliver great work" accent="with Klexford." text="Apply to join our network of delivery collaborators." image={IMG.agencies} />
    <Section>
      <div className="grid gap-12 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-2">
          {[[Users, "Real clients", "Work on scoped projects for authors and businesses."], [Award, "Clear ownership", "Own your scope, quality review and delivery."], [Heart, "Supportive team", "Collaborate across five departments."], [Shield, "Get paid simply", "Create invoices and receive payment from your expert dashboard."]].map(([I, t, d]) => { const Icon = I as typeof Users; return (
            <div key={t as string} className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500"><Icon size={20} /></span><div><h4 className="font-semibold">{t as string}</h4><p className="text-sm text-slate-600">{d as string}</p></div></div>); })}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const d = fd(e); addInquiry({ kind: "expert", name: d.name, email: d.email, data: d }); setSent(true); }} className="grid gap-4 rounded-2xl border border-slate-200 p-8 shadow-card sm:grid-cols-2 lg:col-span-3">
          {sent ? <div className="sm:col-span-2"><Done title="Application received." /></div> : (<>
            <input name="name" required placeholder="Full name" className={field} />
            <input name="email" required type="email" placeholder="Email" className={field} />
            <select name="department" required className={field} defaultValue=""><option value="" disabled>Department</option>{services.map((s) => <option key={s.slug}>{s.title}</option>)}</select>
            <input name="portfolio" placeholder="Portfolio / LinkedIn URL" className={field} />
            <textarea name="experience" required rows={4} placeholder="Tell us about your experience" className={`${field} sm:col-span-2`} />
            <button className="btn-primary justify-center sm:col-span-2">Submit Application</button>
          </>)}
        </form>
      </div>
    </Section>
  </>);
}

/* ---------- Resources & Tools ---------- */
export function Resources() {
  return (<>
    <PageHero eyebrow="Resources" title="Guides & checklists" accent="you can use." text="Practical guidance for authors and businesses." />
    <Section><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{resources.map((r) => (
      <article key={r.title} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-card">
        <Img src={r.image} className="h-48 w-full" />
        <div className="p-6"><span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">{r.type}</span><h3 className="mt-3 text-lg font-semibold">{r.title}</h3><details className="mt-4 border-t border-slate-200 pt-3"><summary className="cursor-pointer text-sm font-semibold">Read {r.type.toLowerCase()}</summary><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">{r.notes.map(note => <li key={note}>{note}</li>)}</ul></details></div>
      </article>))}</div></Section>
    <CTA />
  </>);
}

export function Tools() {
  return (<>
    <PageHero eyebrow="Tools" title="Free checklists" accent="& assessments." text="Quick ways to see where your book, website or business stands." />
    <Section><div className="grid gap-6 md:grid-cols-3">{tools.map((t) => (
      <Link key={t.title} to={t.route} className="rounded-2xl border border-slate-200 p-8 hover:border-brand-500 hover:shadow-card"><Search className="text-brand-500" /><h3 className="mt-4 text-lg font-semibold">{t.title}</h3><p className="mt-2 text-sm text-slate-600">{t.desc}</p><span className="mt-4 inline-block text-sm font-semibold text-brand-600">Open →</span></Link>))}</div></Section>
  </>);
}

export function VisibilityCheck() {
  const [sent, setSent] = useState(false);
  return (<>
    <PageHero eyebrow="Free Tool" title="Free" accent="Visibility Check" text="Share a few details and we'll send a scoped initial review of how easily your audience can find you." image={IMG.growth_studio} />
    <Section>
      <form onSubmit={(e) => { e.preventDefault(); const d = fd(e); addInquiry({ kind: "visibility", name: d.name, email: d.email, data: d }); setSent(true); }} className="mx-auto grid max-w-3xl gap-4 rounded-2xl border border-slate-200 p-8 shadow-card sm:grid-cols-2">
        {sent ? <div className="sm:col-span-2"><Done title="Request received." /></div> : (<>
          <input name="name" required placeholder="Full name" className={field} />
          <input name="email" required type="email" placeholder="Email" className={field} />
          <select name="type" required className={field} defaultValue=""><option value="" disabled>I am a…</option>{audiences.map((a) => <option key={a.slug}>{a.title}</option>)}</select>
          <input name="url" placeholder="Website, book or profile link" className={field} />
          <textarea name="goal" rows={4} placeholder="What would you like more people to find or do?" className={`${field} sm:col-span-2`} />
          <button className="btn-primary justify-center sm:col-span-2">Request My Free Check</button>
        </>)}
      </form>
    </Section>
  </>);
}

/* ---------- About ---------- */
export function About() {
  return (<>
    <PageHero eyebrow="About Klexford" title="Publishing, Digital" accent="& Growth Services." text="Klexford helps authors and businesses develop their work, strengthen their presence and connect with the people they want to reach." image={IMG.about1} />
    <Section>
      <div className="grid gap-6 md:grid-cols-3">
        {[["Our mission", "Give every author and business a clear, connected path from idea to audience."], ["Our approach", "One agency brand, five departments, and an identified owner for every offer."], ["Our promise", "Agreed scope, honest reporting and quality review before every handover."]].map(([t, d]) => (
          <div key={t} className="rounded-2xl bg-brand-50 p-8"><h3 className="text-lg font-semibold text-brand-700">{t}</h3><p className="mt-3 text-slate-600">{d}</p></div>))}
      </div>
    </Section>
    <Section className="bg-ink text-white"><Heading eyebrow="Process" pre="How we" accent="work" center light />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{steps.map((st) => <div key={st.n} className="rounded-2xl border border-white/10 bg-white/5 p-6"><span className="text-3xl font-bold text-brand-500">{st.n}</span><h3 className="mt-3 font-semibold">{st.title}</h3><p className="mt-2 text-sm text-white/70">{st.desc}</p></div>)}</div>
    </Section>
    <Section><Heading eyebrow="Team" pre="Meet our" accent="experts" center /><div className="mt-12"><TeamGrid limit={3} /></div></Section>
    <CTA />
  </>);
}

/* ---------- Start a Project ---------- */
export function StartProject() {
  const [q] = useSearchParams();
  const [sent, setSent] = useState(false);
  return (<>
    <PageHero eyebrow="Start a Project" title="Tell us what" accent="you're building." text="Share the service and customer type so the right team member can prepare before our first conversation." />
    <Section>
      <div className="grid gap-12 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Img src={IMG.about2} className="aspect-[4/3] w-full rounded-2xl" />
          <p className="flex items-center gap-3"><Mail className="text-brand-500" /> hello@klexford.com</p>

          <p className="flex items-center gap-3"><MapPin className="text-brand-500" /> Serving clients worldwide</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const d = fd(e); addInquiry({ kind: "project", name: d.name, email: d.email, data: d }); setSent(true); }} className="grid gap-4 rounded-2xl border border-slate-200 p-8 shadow-card sm:grid-cols-2 lg:col-span-3">
          {sent ? <div className="sm:col-span-2"><Done title="Thank you — inquiry received." /></div> : (<>
            <label><Label>Full name</Label><input name="name" required className={field} /></label>
            <label><Label>Email</Label><input name="email" required type="email" className={field} /></label>
            <label><Label>I am a…</Label><select name="customerType" required className={field} defaultValue={q.get("type") ?? ""}><option value="" disabled>Select</option>{audiences.map((a) => <option key={a.slug}>{a.title}</option>)}</select></label>
            <label><Label>Service needed</Label><select name="service" required className={field} defaultValue={q.get("service") ?? ""}><option value="" disabled>Select</option>{services.map((s) => <option key={s.slug}>{s.title}</option>)}<option>Not sure yet</option></select></label>
            <label><Label>Way to work</Label><select name="plan" className={field} defaultValue=""><option value="">Not sure</option>{plans.map((p) => <option key={p.title}>{p.title}</option>)}</select></label>
            <label><Label>Budget range</Label><select name="budget" className={field} defaultValue=""><option value="">Prefer not to say</option><option>Under $500</option><option>$500 – $2,000</option><option>$2,000 – $5,000</option><option>$5,000+</option></select></label>
            <label className="sm:col-span-2"><Label>Project details</Label><textarea name="details" required rows={5} placeholder="Goals, timeline, links…" className={field} /></label>
            <button className="btn-primary justify-center sm:col-span-2">Submit Inquiry <ArrowRight size={16} /></button>
          </>)}
        </form>
      </div>
    </Section>
  </>);
}

/* ---------- Legal & 404 ---------- */
export function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const title = kind === "privacy" ? "Privacy Policy" : "Terms of Service";
  return (<>
    <PageHero eyebrow="Legal" title={title} text={kind === "privacy" ? "How information is handled in this demonstration." : "Using the Klexford demonstration site."} />
    <Section><div className="mx-auto max-w-2xl space-y-5 text-lg">
      <h2 className="text-4xl">{kind === "privacy" ? "Browser storage" : "Demo workspace"}</h2>
      <p>{kind === "privacy" ? "This demo saves project inquiries, applications, account details and invoices in the browser you use. Clearing site data removes those local records." : "The project examples, accounts and invoice workflows illustrate how the studio works. Use sample information when exploring the portals."}</p>
      <a className="line-link" href="mailto:hello@klexford.com">Contact the studio <ArrowRight size={16}/></a>
    </div></Section>
  </>);
}

export function NotFound() {
  return <Section><div className="py-20 text-center"><p className="text-7xl font-bold text-brand-500">404</p><h1 className="mt-4 text-2xl font-semibold">Page not found</h1><Link to="/" className="btn-primary mt-8">Back Home</Link></div></Section>;
}
