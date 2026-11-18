import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Check, Star, Search, ChevronLeft, ChevronRight, Target, Megaphone, BarChart3, Sparkles } from "lucide-react";
import { services, audiences, work, steps, plans, team, resources, testimonials, IMG } from "../data";
import { Section, Heading, Img, CTA } from "../components/ui";

export function ServiceCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => (
        <Link key={s.route} to={s.route} className={`group overflow-hidden rounded-2xl border transition hover:-translate-y-1 hover:shadow-card ${i === 0 ? "border-brand-500 bg-brand-500 text-white" : "border-slate-200 bg-white"}`}>
          <Img src={s.image} alt={s.title} className="h-44 w-full" />
          <div className="p-7">
            <div className="flex items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${i === 0 ? "bg-white text-brand-500" : "bg-brand-50 text-brand-500"}`}><s.icon size={20} /></span>
              {i === 0 && <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Flagship</span>}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className={`mt-2 text-sm ${i === 0 ? "text-white/85" : "text-slate-600"}`}>{s.desc}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">Learn More <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
          </div>
        </Link>
      ))}
      <Link to="/start-a-project" className="flex flex-col justify-center rounded-2xl border-2 border-dashed border-brand-500/40 p-7 text-center hover:bg-brand-50">
        <p className="text-lg font-semibold">Need several services?</p>
        <p className="mt-2 text-sm text-slate-600">We'll coordinate a connected package with one point of contact.</p>
        <span className="mt-4 font-semibold text-brand-600">Start a Project →</span>
      </Link>
    </div>
  );
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
  return (
    <Link to="/work" className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-card">
      <div className="overflow-hidden"><Img src={w.image} alt={w.title} className="aspect-[4/3] w-full transition duration-500 group-hover:scale-105" /></div>
      <div className="p-5">
        <span className="text-xs font-semibold uppercase text-brand-500">{w.tag}</span>
        <h3 className="mt-1 font-semibold">{w.title}</h3>
        <p className="mt-2 text-sm text-slate-600">{w.summary}</p>
      </div>
    </Link>
  );
}

export function TeamGrid({ limit }: { limit?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {team.slice(0, limit).map((m) => (
        <div key={m.role} className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-card">
          <Img src={m.image} alt={m.role} className="aspect-square w-full" />
          <div className="p-5 text-center"><h3 className="font-semibold">{m.name}</h3><p className="text-sm text-brand-600">{m.role}</p></div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [i, setI] = useState(0);
  const visible = [0, 1, 2].map((k) => work[(i + k) % work.length]);
  const [t, setT] = useState(0);
  return (
    <>
      {/* 1 Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50">
        <div className="container-x grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow">Publishing, Digital &amp; Growth Services</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-6xl"><span className="text-brand-500">Build</span> your next chapter.</h1>
            <p className="mt-6 max-w-lg text-slate-600">Klexford brings together book services, websites, automation, marketing and creative expertise to help authors and businesses move their projects forward.</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link to="/start-a-project" className="btn-primary">Start a Project <ArrowRight size={16} /></Link>
              <Link to="/work" className="flex items-center gap-3 text-sm font-semibold">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-500 shadow-card"><Play size={16} fill="currentColor" /></span>Explore Our Work
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">{[IMG.p1, IMG.p2, IMG.p3, IMG.p4].map((p) => <Img key={p} src={p} className="h-10 w-10 rounded-full border-2 border-white" />)}</div>
              <div className="text-sm"><p className="font-semibold">Our happy clients</p><p className="flex items-center gap-1 text-slate-500"><Star size={13} className="text-amber-400" fill="currentColor" /> Authors &amp; businesses worldwide</p></div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <Img src={IMG.hero} alt="Klexford team" className="aspect-[4/5] w-full rounded-[2rem] shadow-card" />
            <div className="absolute -left-6 top-10 rounded-xl bg-white p-4 shadow-card"><p className="text-2xl font-bold">5</p><p className="text-xs text-slate-500">Service departments</p></div>
            <div className="absolute -right-4 bottom-12 rounded-xl bg-white p-4 shadow-card">
              <p className="text-xs font-semibold">Team Members</p>
              <div className="mt-2 flex -space-x-2">{[IMG.p5, IMG.p6, IMG.p1].map((p) => <Img key={p} src={p} className="h-8 w-8 rounded-full border-2 border-white" />)}<span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-brand-500 text-[10px] font-bold text-white">5+</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 About */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <Img src={IMG.about1} className="row-span-2 h-full w-full rounded-2xl" />
            <Img src={IMG.about2} className="aspect-square w-full rounded-2xl" />
            <Img src={IMG.about3} className="aspect-square w-full rounded-2xl" />
          </div>
          <div>
            <Heading eyebrow="Who Klexford Is" pre="One team." accent="Connected" post="delivery." />
            <p className="mt-5 text-slate-600">Klexford helps authors and businesses develop their work, strengthen their presence and connect with the people they want to reach. Commission a single service or a connected package — each owned by an identified team member from scope to quality review.</p>
            <Link to="/about" className="btn-primary mt-8">Learn More</Link>
          </div>
        </div>
      </Section>

      {/* 3 Services */}
      <Section className="bg-slate-50">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Heading eyebrow="Our Services" pre="Five departments," accent="one clear" post="next step." />
          <p className="max-w-md text-slate-600">Start with the service you need, or let us coordinate several. Book &amp; Author Services leads the way.</p>
        </div>
        <ServiceCards />
      </Section>

      {/* 4 Who we help */}
      <Section><Heading eyebrow="Who We Help" pre="Find the pathway" accent="built for you" center /><div className="mt-12"><AudienceCards /></div></Section>

      {/* 5 Work */}
      <Section className="bg-slate-50">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading eyebrow="Selected Work" pre="Real projects," accent="real results" />
          <div className="flex gap-2">
            <button aria-label="Previous" onClick={() => setI((i - 1 + work.length) % work.length)} className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 bg-white hover:border-brand-500"><ChevronLeft size={18} /></button>
            <button aria-label="Next" onClick={() => setI((i + 1) % work.length)} className="grid h-11 w-11 place-items-center rounded-full bg-brand-500 text-white hover:bg-brand-600"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">{visible.map((w) => <WorkCard key={w.title} w={w} />)}</div>
        <div className="mt-10 text-center"><Link to="/work" className="btn-ghost">View All Work</Link></div>
      </Section>

      {/* 6 Book marketing */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <Img src={IMG.bookLaunch} alt="Book marketing" className="aspect-square w-full rounded-3xl shadow-card" />
            <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-xl bg-white p-4 shadow-card">
              <Sparkles className="text-amber-500" size={20} /><div><p className="text-sm font-semibold">Launch plan ready</p><p className="text-xs text-slate-500">Assets · Email · Channels</p></div>
            </div>
          </div>
          <div>
            <Heading eyebrow="Book Marketing" pre="Develop your book. Prepare its launch." accent="Reach your readers." />
            <p className="mt-5 text-slate-600">Reader-focused planning and launch support from our flagship department — a clear plan and accountable delivery, never guaranteed-sales promises.</p>
            <div className="mt-8 space-y-5">
              {[[Target, "Define the reader", "Audience, genre, book stage, platform, release date and goal."], [Megaphone, "Present the work", "Positioning, campaign plan, platform improvements and assets."], [BarChart3, "Launch & review", "Agreed responsibilities, dates and costs — then an honest review."]].map(([I, h, d]) => {
                const Icon = I as typeof Target;
                return <div key={h as string} className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500"><Icon size={18} /></span><div><h4 className="font-semibold">{h as string}</h4><p className="text-sm text-slate-600">{d as string}</p></div></div>;
              })}
            </div>
            <Link to="/book-author-services/book-marketing" className="btn-primary mt-8">Explore Book Marketing <ArrowRight size={16} /></Link>
          </div>
        </div>
      </Section>

      {/* 7 Process */}
      <Section className="bg-ink text-white">
        <Heading eyebrow="How We Work" pre="A simple," accent="accountable" post="process" center light />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6"><span className="text-3xl font-bold text-brand-500">{s.n}</span><h3 className="mt-3 font-semibold">{s.title}</h3><p className="mt-2 text-sm text-white/70">{s.desc}</p></div>)}
        </div>
      </Section>

      {/* 8 Ways to work */}
      <Section>
        <Heading eyebrow="Ways to Work" pre="Choose how we" accent="work together" center />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.title} className={`rounded-2xl border p-8 ${p.featured ? "border-brand-500 bg-brand-500 text-white shadow-card lg:-translate-y-3" : "border-slate-200"}`}>
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className={`mt-2 text-sm ${p.featured ? "text-white/85" : "text-slate-600"}`}>{p.desc}</p>
              <p className="mt-6 text-sm font-semibold">Pricing confirmed on scope</p>
              <ul className="mt-6 space-y-3">{p.points.map((pt) => <li key={pt} className="flex items-center gap-2 text-sm"><Check size={16} className={p.featured ? "text-white" : "text-mint"} />{pt}</li>)}</ul>
              <Link to="/start-a-project" className={`mt-8 w-full justify-center ${p.featured ? "btn bg-white text-brand-600 hover:bg-brand-50" : "btn-ghost"}`}>Get Started</Link>
            </div>
          ))}
        </div>
      </Section>

      {/* 9 Team */}
      <Section className="bg-slate-50">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Heading eyebrow="Team & Experts" pre="Meet the people" accent="behind the work" />
          <div className="flex gap-3"><Link to="/experts" className="btn-ghost">All Experts</Link><Link to="/become-an-expert" className="btn-primary">Become an Expert</Link></div>
        </div>
        <TeamGrid limit={3} />
      </Section>

      {/* 10 Testimonials */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Heading eyebrow="Client Feedback" pre="What our" accent="clients" post="say" />
            <div className="mt-6 flex gap-1 text-amber-400">{[...Array(5)].map((_, k) => <Star key={k} size={18} fill="currentColor" />)}</div>
            <blockquote className="mt-4 min-h-[84px] text-lg text-slate-700">"{testimonials[t].quote}"</blockquote>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-3"><Img src={testimonials[t].image} className="h-12 w-12 rounded-full" /><div><p className="font-semibold">{testimonials[t].name}</p><p className="text-sm text-slate-500">{testimonials[t].project}</p></div></div>
              <div className="flex gap-2">
                <button aria-label="Previous" onClick={() => setT((t + 2) % 3)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-300"><ChevronLeft size={16} /></button>
                <button aria-label="Next" onClick={() => setT((t + 1) % 3)} className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
          <div className="relative aspect-[16/10] rounded-3xl bg-[radial-gradient(circle,#CBD5E1_1px,transparent_1px)] [background-size:14px_14px]">
            {[["top-[20%] left-[25%]", IMG.p1], ["top-[12%] left-[62%]", IMG.p2], ["top-[48%] left-[44%]", IMG.p3], ["top-[62%] left-[75%]", IMG.p4], ["top-[55%] left-[10%]", IMG.p5]].map(([pos, src]) => (
              <Img key={pos} src={src} className={`absolute ${pos} h-14 w-14 rounded-full border-4 border-white shadow-card`} />
            ))}
          </div>
        </div>
      </Section>

      {/* 11 Resources + 12 Visibility */}
      <Section className="bg-slate-50">
        <div className="flex flex-wrap items-end justify-between gap-6"><Heading eyebrow="Resources & Tools" pre="Practical guides" accent="you can use" /><Link to="/resources" className="btn-ghost">All Resources</Link></div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {resources.slice(0, 3).map((r) => (
            <Link key={r.title} to="/resources" className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-card">
              <Img src={r.image} className="h-40 w-full" />
              <div className="p-6"><span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">{r.type}</span><h3 className="mt-3 font-semibold">{r.title}</h3></div>
            </Link>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-8 rounded-3xl bg-gradient-to-r from-brand-500 to-indigo-600 p-10 text-white md:flex-row md:items-center">
          <div className="max-w-xl"><h3 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl"><Search /> Free Visibility Check</h3><p className="mt-3 text-white/85">Tell us about your book, website or business and we'll send a scoped initial review of how easily the right people can find you.</p></div>
          <Link to="/tools/visibility-check" className="btn bg-white text-brand-600 hover:bg-brand-50">Request a Check <ArrowRight size={16} /></Link>
        </div>
      </Section>

      {/* 13 CTA */}
      <CTA />
    </>
  );
}
