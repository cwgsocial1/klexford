import { useState } from "react";
import {
  ArrowRight, Play, ChevronDown, Menu, X, Check, Star, Search, Mail, Phone, MapPin,
  ChevronLeft, ChevronRight, Target, Megaphone, BarChart3, Sparkles,
} from "lucide-react";
import { services, audiences, work, steps, plans, team, resources } from "./data";

const Section = ({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) => (
  <section id={id} className={`py-20 ${className}`}><div className="container-x">{children}</div></section>
);

const Heading = ({ eyebrow, pre, accent, post, center }: { eyebrow: string; pre?: string; accent: string; post?: string; center?: boolean }) => (
  <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
    <p className="eyebrow">{eyebrow}</p>
    <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
      {pre} <span className="text-brand-500">{accent}</span> {post}
    </h2>
  </div>
);

/* ---------------- Navbar ---------------- */
function Navbar() {
  const [open, setOpen] = useState(false);
  const Drop = ({ label, items }: { label: string; items: { title: string; route: string }[] }) => (
    <div className="group relative">
      <button className="flex items-center gap-1 py-6 hover:text-brand-500">{label}<ChevronDown size={14} /></button>
      <div className="invisible absolute left-0 top-full w-72 rounded-xl border border-slate-100 bg-white p-2 opacity-0 shadow-card transition group-hover:visible group-hover:opacity-100">
        {items.map((i) => (
          <a key={i.title} href={i.route} className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-600">{i.title}</a>
        ))}
      </div>
    </div>
  );
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="container-x flex items-center justify-between">
        <a href="#top" className="text-xl font-bold text-brand-600">Klexford</a>
        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          <Drop label="Services" items={services} />
          <Drop label="Who We Help" items={audiences} />
          <a href="#work" className="hover:text-brand-500">Our Work</a>
          <a href="#team" className="hover:text-brand-500">Team &amp; Experts</a>
          <a href="#about" className="hover:text-brand-500">About</a>
        </nav>
        <a href="#start" className="btn-primary hidden lg:inline-flex">Start a Project</a>
        <button className="py-5 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="container-x space-y-1 pb-5 lg:hidden">
          {["Services", "Who We Help", "Our Work", "Team & Experts", "About"].map((l) => (
            <a key={l} href={l === "Who We Help" ? "#who" : l === "Team & Experts" ? "#team" : l === "Our Work" ? "#work" : `#${l.toLowerCase()}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-brand-50">{l}</a>
          ))}
          <a href="#start" className="btn-primary mt-2 w-full justify-center">Start a Project</a>
        </div>
      )}
    </header>
  );
}

/* ---------------- 1. Hero ---------------- */
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50">
      <div className="container-x grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p className="eyebrow">Publishing, Digital &amp; Growth Services</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-6xl">
            <span className="text-brand-500">Build</span> your next chapter.
          </h1>
          <p className="mt-6 max-w-lg text-slate-600">
            Klexford brings together book services, websites, automation, marketing and creative expertise to help authors and businesses move their projects forward.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#start" className="btn-primary">Start a Project <ArrowRight size={16} /></a>
            <a href="#work" className="flex items-center gap-3 text-sm font-semibold">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-500 shadow-card"><Play size={16} fill="currentColor" /></span>
              Explore Our Work
            </a>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["bg-brand-500", "bg-mint", "bg-amber-400", "bg-rose-400"].map((c) => (
                <span key={c} className={`h-10 w-10 rounded-full border-2 border-white ${c}`} />
              ))}
            </div>
            <div className="text-sm"><p className="font-semibold">Authors &amp; businesses</p><p className="text-slate-500">served across 5 departments</p></div>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="aspect-[4/5] rounded-[2rem] bg-gradient-to-br from-brand-500 to-indigo-700 p-8 text-white shadow-card">
            <div className="flex h-full flex-col justify-end rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Team imagery</p>
              <p className="mt-1 text-lg font-semibold">Replace with approved team or project photo</p>
            </div>
          </div>
          <div className="absolute -left-6 top-10 rounded-xl bg-white p-4 shadow-card">
            <p className="text-2xl font-bold text-ink">5</p><p className="text-xs text-slate-500">Service departments</p>
          </div>
          <div className="absolute -right-4 bottom-12 rounded-xl bg-white p-4 shadow-card">
            <p className="text-xs font-semibold">Book &amp; Author</p>
            <p className="flex items-center gap-1 text-xs text-mint"><Check size={12} /> Flagship department</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 2. About ---------------- */
function About() {
  return (
    <Section id="about">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="row-span-2 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300" />
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand-100 to-brand-500/40" />
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-300" />
        </div>
        <div>
          <Heading eyebrow="Who Klexford Is" pre="One team." accent="Connected" post="delivery." />
          <p className="mt-5 text-slate-600">
            Klexford helps authors and businesses develop their work, strengthen their presence and connect with the people they want to reach. A team of specialists works under one agency brand, so you can commission a single service or a connected package — each owned by an identified team member from scope to quality review.
          </p>
          <a href="#about" className="btn-primary mt-8">Learn More</a>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- 3. Services ---------------- */
function Services() {
  return (
    <Section id="services" className="bg-slate-50">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Heading eyebrow="Our Services" pre="Five departments," accent="one clear" post="next step." />
        <p className="max-w-md text-slate-600">Start with the service you need, or let us coordinate several. Book &amp; Author Services leads the way.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <a key={s.title} href={s.route}
            className={`group rounded-2xl border p-7 transition hover:-translate-y-1 hover:shadow-card ${i === 0 ? "border-brand-500 bg-brand-500 text-white lg:row-span-2" : "border-slate-200 bg-white"}`}>
            <span className={`grid h-12 w-12 place-items-center rounded-xl ${i === 0 ? "bg-white text-brand-500" : "bg-brand-50 text-brand-500"}`}><s.icon size={22} /></span>
            {i === 0 && <span className="ml-3 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Flagship</span>}
            <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
            <p className={`mt-2 text-sm ${i === 0 ? "text-white/85" : "text-slate-600"}`}>{s.desc}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {s.items.map((it) => (
                <li key={it} className={`rounded-full px-3 py-1 text-xs ${i === 0 ? "bg-white/15" : "bg-slate-100 text-slate-600"}`}>{it}</li>
              ))}
            </ul>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold">Learn More <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
          </a>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- 4. Who We Help ---------------- */
function WhoWeHelp() {
  return (
    <Section id="who">
      <Heading eyebrow="Who We Help" pre="Find the pathway" accent="built for you" center />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {audiences.map((a) => (
          <a key={a.title} href={a.route} className="group flex gap-4 rounded-2xl border border-slate-200 p-6 transition hover:border-brand-500 hover:shadow-card">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-50 text-mint"><a.icon size={20} /></span>
            <div>
              <h3 className="font-semibold group-hover:text-brand-600">{a.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{a.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- 5. Selected Work ---------------- */
function Work() {
  const [i, setI] = useState(0);
  const visible = [0, 1, 2].map((k) => work[(i + k) % work.length]);
  return (
    <Section id="work" className="bg-slate-50">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Heading eyebrow="Selected Work" pre="Project examples," accent="what we can build" />
        <div className="flex gap-2">
          <button aria-label="Previous" onClick={() => setI((i - 1 + work.length) % work.length)} className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 bg-white hover:border-brand-500"><ChevronLeft size={18} /></button>
          <button aria-label="Next" onClick={() => setI((i + 1) % work.length)} className="grid h-11 w-11 place-items-center rounded-full bg-brand-500 text-white hover:bg-brand-600"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {visible.map((w) => (
          <a key={w.title} href="#start" className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-card">
            <div className={`aspect-[4/3] bg-gradient-to-br ${w.tone}`} />
            <div className="p-5">
              <span className="text-xs font-semibold uppercase text-brand-500">{w.tag}</span>
              <h3 className="mt-1 font-semibold">{w.title}</h3>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-slate-500 group-hover:text-brand-600">Discuss a similar project <ArrowRight size={14} /></span>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- 6. Book Marketing ---------------- */
function BookMarketing() {
  const feats = [
    { icon: Target, t: "Define the reader", d: "Audience, genre, book stage, platform, release date and campaign goal." },
    { icon: Megaphone, t: "Present the work", d: "Positioning review, campaign plan, platform improvements and promotional assets." },
    { icon: BarChart3, t: "Launch & review", d: "Agreed responsibilities, dates, deliverables and media costs — then an honest review." },
  ];
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Heading eyebrow="Book Marketing" pre="Develop your book. Prepare its launch." accent="Reach your readers." />
          <p className="mt-5 text-slate-600">Reader-focused planning and launch support from our flagship department. No guaranteed sales or bestseller claims — just a clear plan and accountable delivery.</p>
          <div className="mt-8 space-y-5">
            {feats.map((f) => (
              <div key={f.t} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500"><f.icon size={18} /></span>
                <div><h4 className="font-semibold">{f.t}</h4><p className="text-sm text-slate-600">{f.d}</p></div>
              </div>
            ))}
          </div>
          <a href="#start" className="btn-primary mt-8">Explore Book Marketing <ArrowRight size={16} /></a>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-indigo-100 via-brand-50 to-white p-10">
            <div className="mx-auto flex h-full w-3/5 flex-col justify-between rounded-r-xl rounded-l-sm bg-gradient-to-br from-brand-600 to-indigo-800 p-6 text-white shadow-2xl">
              <p className="text-xs uppercase tracking-widest text-white/60">A Novel</p>
              <p className="text-2xl font-bold leading-tight">Your Book Title</p>
              <p className="text-sm text-white/80">Author Name</p>
            </div>
          </div>
          <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-xl bg-white p-4 shadow-card">
            <Sparkles className="text-amber-500" size={20} /><div><p className="text-sm font-semibold">Launch plan ready</p><p className="text-xs text-slate-500">Assets · Email · Channels</p></div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- 7. Process ---------------- */
function Process() {
  return (
    <Section className="bg-ink text-white">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">How We Work</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">A simple, <span className="text-brand-500">accountable</span> process</h2>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <span className="text-3xl font-bold text-brand-500">{s.n}</span>
            <h3 className="mt-3 font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-white/70">{s.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- 8. Ways to Work ---------------- */
function Plans() {
  return (
    <Section>
      <Heading eyebrow="Ways to Work" pre="Choose how we" accent="work together" center />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.title} className={`rounded-2xl border p-8 ${p.featured ? "border-brand-500 bg-brand-500 text-white shadow-card lg:-translate-y-3" : "border-slate-200"}`}>
            <h3 className="text-xl font-semibold">{p.title}</h3>
            <p className={`mt-2 text-sm ${p.featured ? "text-white/85" : "text-slate-600"}`}>{p.desc}</p>
            <p className="mt-6 text-sm font-semibold">Pricing confirmed on scope</p>
            <ul className="mt-6 space-y-3">
              {p.points.map((pt) => (
                <li key={pt} className="flex items-center gap-2 text-sm"><Check size={16} className={p.featured ? "text-white" : "text-mint"} />{pt}</li>
              ))}
            </ul>
            <a href="#start" className={`mt-8 w-full justify-center ${p.featured ? "btn bg-white text-brand-600 hover:bg-brand-50" : "btn-ghost"}`}>Get Started</a>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- 9. Team ---------------- */
function Team() {
  return (
    <Section id="team" className="bg-slate-50">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Heading eyebrow="Team & Experts" pre="Meet the people" accent="behind the work" />
        <a href="mailto:hello@klexford.com?subject=Become%20an%20Expert" className="btn-ghost">Become an Expert <ArrowRight size={16} /></a>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((m) => (
          <a key={m.role} href="#team" className="rounded-2xl bg-white p-6 text-center shadow-sm transition hover:shadow-card">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-brand-100 to-brand-500/50 text-xl font-bold text-brand-700">{m.initials}</div>
            <h3 className="mt-4 font-semibold">{m.name}</h3>
            <p className="text-sm text-slate-500">{m.role}</p>
          </a>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- 10. Testimonials ---------------- */
function Testimonials() {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Heading eyebrow="Client Feedback" pre="What our" accent="clients" post="say" />
          <div className="mt-6 flex gap-1 text-amber-400">{[...Array(5)].map((_, k) => <Star key={k} size={18} fill="currentColor" />)}</div>
          <blockquote className="mt-4 text-lg text-slate-700">"Approved testimonial goes here — tied to the specific project it describes, with permission from the client."</blockquote>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-200 to-rose-300" />
            <div><p className="font-semibold">Client Name</p><p className="text-sm text-slate-500">Author · Book Marketing project</p></div>
          </div>
        </div>
        <div className="relative aspect-[16/10] rounded-3xl bg-[radial-gradient(circle,#CBD5E1_1px,transparent_1px)] [background-size:14px_14px]">
          {[["top-[20%] left-[25%]", "bg-brand-500"], ["top-[15%] left-[60%]", "bg-rose-400"], ["top-[50%] left-[45%]", "bg-mint"], ["top-[60%] left-[75%]", "bg-amber-400"], ["top-[45%] left-[12%]", "bg-indigo-400"]].map(([pos, c]) => (
            <span key={pos} className={`absolute ${pos} h-12 w-12 rounded-full border-4 border-white shadow-card ${c}`} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------------- 11 & 12. Resources + Visibility Check ---------------- */
function Resources() {
  return (
    <Section id="resources" className="bg-slate-50">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Heading eyebrow="Resources & Tools" pre="Practical guides" accent="you can use" />
        <a href="#resources" className="btn-ghost">All Resources</a>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {resources.map((r) => (
          <a key={r.title} href="#resources" className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-card">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">{r.type}</span>
            <h3 className="mt-4 font-semibold">{r.title}</h3>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-brand-600">Read <ArrowRight size={14} /></span>
          </a>
        ))}
      </div>
      <div className="mt-16 flex flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-500 to-indigo-600 p-10 text-white md:flex-row md:items-center">
        <div className="max-w-xl">
          <h3 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl"><Search /> Free Visibility Check</h3>
          <p className="mt-3 text-white/85">Tell us about your book, website or business and we'll send a scoped initial review of how easily the right people can find you.</p>
        </div>
        <a href="#start" className="btn bg-white text-brand-600 hover:bg-brand-50">Request a Check <ArrowRight size={16} /></a>
      </div>
    </Section>
  );
}

/* ---------------- 13. Inquiry form ---------------- */
function Inquiry() {
  
  const field = "w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
  return (
    <Section id="start">
      <div className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Heading eyebrow="Start a Project" pre="Tell us what you're" accent="building" />
          <p className="mt-5 text-slate-600">Share the service and customer type so the right team member can prepare before our first conversation. Submitting opens an email draft for you to send.</p>
          <div className="mt-8 space-y-4 text-sm">
            <p className="flex items-center gap-3"><Mail size={18} className="text-brand-500" /> hello@klexford.com</p>
            <p className="flex items-center gap-3"><Phone size={18} className="text-brand-500" /> Email us to arrange a call</p>
            <p className="flex items-center gap-3"><MapPin size={18} className="text-brand-500" /> Serving clients worldwide</p>
          </div>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const values = new FormData(e.currentTarget);
          const body = ["Name", "Email", "Customer type", "Service", "Preferred way to work", "Project details"]
            .map((label, i) => `${label}: ${values.get(["name", "email", "audience", "service", "plan", "details"][i]) || "—"}`).join("\n");
          window.location.href = `mailto:hello@klexford.com?subject=${encodeURIComponent("Project inquiry from Klexford website")}&body=${encodeURIComponent(body)}`;
        }} className="grid gap-4 rounded-2xl border border-slate-200 p-8 shadow-card sm:grid-cols-2 lg:col-span-3">
            <input required name="name" autoComplete="name" placeholder="Full name" className={field} />
            <input required name="email" autoComplete="email" type="email" placeholder="Email address" className={field} />
            <select required name="audience" className={field} defaultValue=""><option value="" disabled>I am a…</option>{audiences.map((a) => <option key={a.title}>{a.title}</option>)}</select>
            <select required name="service" className={field} defaultValue=""><option value="" disabled>Service needed</option>{services.map((s) => <option key={s.title}>{s.title}</option>)}<option>Not sure yet</option></select>
            <select name="plan" className={`${field} sm:col-span-2`} defaultValue=""><option value="" disabled>Preferred way to work</option>{plans.map((p) => <option key={p.title}>{p.title}</option>)}</select>
            <textarea required name="details" rows={4} placeholder="Tell us about your project, goals and timeline" className={`${field} sm:col-span-2`} />
            <button className="btn-primary justify-center sm:col-span-2">Open Email Draft <ArrowRight size={16} /></button>

        </form>
      </div>
    </Section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  const cols = [
    { h: "Services", l: services.map((s) => [s.title, s.route]) },
    { h: "Who We Help", l: audiences.map((a) => [a.title, a.route]) },
    { h: "Company", l: [["About", "#about"], ["Our Work", "#work"], ["Team & Experts", "#team"], ["Become an Expert", "mailto:hello@klexford.com?subject=Become%20an%20Expert"]] },
    { h: "Resources", l: [["Resources", "#resources"], ["Free Visibility Check", "#start"], ["Start a Project", "#start"]] },
  ];
  return (
    <footer className="bg-slate-50 pt-16">
      <div className="container-x grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-xl font-bold text-brand-600">Klexford</p>
          <p className="mt-3 text-sm text-slate-600">Publishing, Digital and Growth Services for authors and businesses.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="font-semibold">{c.h}</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {c.l.map(([t, r]) => <li key={r}><a href={r} className="hover:text-brand-600">{t}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="bg-ink py-4 text-xs text-white/70">
        <div className="container-x flex flex-wrap justify-between gap-2">
          <p>© {new Date().getFullYear()} Klexford. All rights reserved.</p>
          <p><a href="mailto:hello@klexford.com" className="hover:text-white">Contact us</a></p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero /><About /><Services /><WhoWeHelp /><Work /><BookMarketing />
        <Process /><Plans /><Team /><Resources /><Inquiry />
      </main>
      <Footer />
    </>
  );
}
