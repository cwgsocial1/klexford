import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, Target, Megaphone, Rocket } from "lucide-react";
import { services, audiences, work, steps, IMG } from "../data";
import { Section, Heading, Img, PageHero, CTA, FAQ, field } from "../components/ui";
import { ServiceCards, AudienceCards, TeamGrid } from "./Home";
import { casePath } from "../lib/publicPaths";
import { FormField, InquiryForm, ProjectInquiryForm } from "../components/ProjectInquiryForm";

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

type DepartmentGuide = {
  headline: string;
  brief: string;
  scope: string[][];
  agreement: string;
  examples: string[];
  related: string[];
  question: string;
  answer: string;
};

const departmentGuides: Record<string, DepartmentGuide> = {
  "book-author-services": {
    headline: "Develop your book. Prepare its launch.", brief: "Commission editing, design or marketing separately, or plan the whole route from manuscript to release.",
    scope: bookGroups, agreement: "Agree the editorial level, manuscript version, print specifications, digital formats, revision rounds and release schedule before production.",
    examples: ["Book Marketing", "Book Design"], related: ["website-development", "branding-creative"],
    question: "Can marketing begin before the final manuscript is ready?", answer: "Reader research, positioning and launch planning can begin early. Finalise the cover, description and retailer links before the public campaign starts."
  },
  "website-development": {
    headline: "A website built around your next business goal.", brief: "Give visitors a clear path to buy a book, request a quote, make a booking or place an order.",
    scope: [
      ["Author and business sites", "Map the pages around readers or customers, then integrate the approved copy, imagery and contact forms."],
      ["E-commerce", "Plan the catalogue, product details, checkout and order confirmations. Agree on the payment provider, shipping needs and test orders."],
      ["Landing pages and sales funnels", "Pair one offer with a focused page and follow-up journey. Test mobile layouts, form delivery and the handoff to your team."]
    ], agreement: "The proposal defines page count, copy and image ownership, revisions, integrations and handover. Hosting, maintenance and ongoing changes are scoped separately.",
    examples: ["Website"], related: ["book-author-services", "crm-automation"],
    question: "Can my website connect to the CRM I already use?", answer: "List the platform and the destination for each form in the inquiry. We check available integrations and agree how to test a complete submission before launch."
  },
  "crm-automation": {
    headline: "Keep leads organised and follow-up consistent.", brief: "Map the customer journey first, then connect forms, bookings and staff handoffs in GoHighLevel or an agreed platform.",
    scope: [
      ["Intake and pipeline setup", "Define contact fields, stages and owners. Trace a sample estimate request from the website form to a named inbox."],
      ["Booking and follow-up", "Set the reminder timing, reply rules and staff notifications. Stop a sequence when someone replies, books, purchases or opts out."],
      ["Integrations and handover", "Map fields between systems, check duplicates and error cases, then train the team to handle exceptions."]
    ], agreement: "Specify the platforms, migration volume, workflows, training and support period. Recurring subscriptions, messaging usage and ongoing administration are quoted separately.",
    examples: ["Automation"], related: ["website-development", "growth-studio"],
    question: "What happens when a customer replies to a reminder?", answer: "We agree a stop condition for that sequence and the person responsible for the reply. Test records check the handoff before customer contacts enter the workflow."
  },
  "growth-studio": {
    headline: "Digital marketing with a clear plan.", brief: "Choose channels around your audience and budget, then review traffic, inquiries and engagement against the campaign goal.",
    scope: [
      ["Search and visibility", "Review priority pages, search intent and local information. Agree on content changes and a way to measure qualified visits."],
      ["Paid campaigns", "Plan the channel, budget cap, creative variations and conversion event before launching and reviewing spend."],
      ["Social media", "Define the content calendar, production responsibilities, publishing cadence and approval process."],
      ["Email and SMS", "Segment opted-in audiences, write the campaign sequence and test preference changes, replies and reporting."]
    ], agreement: "Agree on the reporting period, channels and approval owner. Campaign fees are distinct from ad spend, software subscriptions and messaging charges.",
    examples: ["Growth Studio", "Book Marketing"], related: ["book-author-services", "branding-creative"],
    question: "How will we judge a campaign’s performance?", answer: "Choose a goal such as qualified inquiries or engaged readers, establish a baseline and specify the data source. Reports distinguish measured results from estimates."
  },
  "branding-creative": {
    headline: "A clear identity people recognise.", brief: "Carry your visual identity across the places your audience encounters it, from the first book cover to the next campaign.",
    scope: [
      ["Brand identity", "Agree on the audience and design direction, then develop the logo, colour palette, typography and practical usage guidance."],
      ["Campaign graphics and social content", "Choose the channels and dimensions, design a small set of approved layouts and prepare reusable assets."],
      ["Promotional video", "Define the message, length, footage source, edit rounds and delivery formats before production."]
    ], agreement: "The scope records creative directions, revision rounds, file formats, source files and usage rights. Third-party assets and licences are agreed before purchase.",
    examples: ["Branding", "Book Design"], related: ["book-author-services", "website-development"],
    question: "Which files will I receive?", answer: "We agree on a delivery list before design begins. Depending on the brief, it can include vector logos, print-ready files, web exports, source files and templates."
  },
};

function ProjectExamples({ tags }: { tags: string[] }) {
  return <Section className="bg-slate-50">
    <Heading eyebrow="Illustrative briefs" pre="Explore the" accent="project scope."/>
    <div className="mt-8 grid gap-5 md:grid-cols-2">{work.filter(w => tags.includes(w.tag)).map(w =>
      <Link className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-brand-500" key={w.title} to={casePath(w.title)}>
        <Img src={w.image} alt="" className="h-20 w-20 shrink-0 rounded-xl"/><div><small>{w.tag}</small><h3 className="text-lg font-semibold">{w.title}</h3></div><ArrowRight size={17} className="ml-auto shrink-0"/>
      </Link>
    )}</div>
  </Section>;
}

export function ServiceDetail({ slug }: { slug: string }) {
  const service = services.find(s => s.slug === slug);
  const guide = departmentGuides[slug];
  if (!service || !guide) return <NotFound/>;
  const inquiry = "/start-a-project?" + new URLSearchParams({ service: service.title, source: service.route });
  const book = slug === "book-author-services";
  return <>
    <PageHero eyebrow={service.title} title={guide.headline} accent={book ? "Reach your readers." : undefined} text={guide.brief} image={service.image}>
      <Link className="btn-primary" to={inquiry}>Start a Project <ArrowRight size={16}/></Link>
      {book && <Link className="btn-ghost" to="/book-author-services/book-marketing">Explore book marketing</Link>}
    </PageHero>
    <Section><Heading eyebrow="Department services" pre="Choose the work" accent="your project needs."/>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{guide.scope.map(([name, text]) =>
        <article key={name} className="rounded-2xl border border-slate-200 bg-white p-7"><h3 className="text-xl font-semibold">{name}</h3><p className="mt-3 text-slate-600">{text}</p></article>
      )}</div>
    </Section>
    <Section className="bg-ink text-white"><div className="grid items-start gap-8 lg:grid-cols-2">
      <h2 className="text-4xl">Scope &amp; handover</h2><div><p className="text-lg">{guide.agreement}</p>
      <p className="mt-5">If the brief spans departments, agree on a coordinator and the delivery owner for each part of the work.</p>
      <div className="mt-6 flex flex-wrap gap-4">{services.filter(s => guide.related.includes(s.slug)).map(s => <Link className="underline underline-offset-4" to={s.route} key={s.slug}>{s.title}</Link>)}</div></div>
    </div></Section>
    <ProjectExamples tags={guide.examples}/>
    <Section><Heading eyebrow="Before you start" pre="Questions about" accent={service.title}/><div className="mt-8"><FAQ items={[
      { q: guide.question, a: guide.answer }, { q: "How do we agree a price?", a: "Share your goals, timeline and what already exists. The written proposal sets out the deliverables, fees, dependencies and review rounds for your brief." }
    ]}/></div></Section><CTA to={inquiry}/>
  </>;
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
      <Link to="/start-a-project?service=Book%20%26%20Author%20Services&type=Authors%20%26%20Publishers&source=%2Fbook-author-services%2Fbook-marketing" className="btn-primary">Plan My Launch</Link>
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
    <ProjectExamples tags={["Book Marketing", "Website"]}/>
    <Section><Heading eyebrow="Campaign review" pre="Know what" accent="to measure."/><p className="mt-6 max-w-2xl text-lg text-slate-600">Agree on the reporting period, media budget and approval owner ahead of launch. Review completed assets, qualified visits and email engagement. Include sales only when the author provides reliable figures and an agreed measurement basis.</p></Section>
    <CTA title="Let's plan your book launch." to="/start-a-project?service=Book%20%26%20Author%20Services&source=%2Fbook-author-services%2Fbook-marketing" />
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

const audienceBriefs: Record<string, { plan: string; question: string; answer: string; tags: string[] }> = {
  "authors-publishers": {
    plan: "Choose the intended reader and release window first. Check what the manuscript needs, agree on cover and interior formats, then prepare the author page, sample and launch materials.",
    question: "Can an author commission only a launch plan?", answer: "Yes. Tell us the genre, release stage and existing reader channels. We can scope positioning, assets and activity around those without adding editing or design.", tags: ["Book Marketing", "Website"]
  },
  creators: {
    plan: "Select the work you want to be hired for. Turn those examples into a portfolio, align the identity and connect service pages to an inquiry form you can manage.",
    question: "Can I keep my existing identity?", answer: "Bring your logo, colours, type choices and portfolio. We can start from those materials and agree which gaps, if any, need design work.", tags: ["Branding"]
  },
  agencies: {
    plan: "Share the client brief and delivery standard. Agree on the assets your team supplies, who speaks to the client, how reviews run and who owns each handover.",
    question: "Who handles feedback from the end client?", answer: "Agree one contact before delivery. Your account lead can collect consolidated feedback and send it to the assigned Klexford specialist at each review round.", tags: ["Website", "Branding"]
  },
  "home-services": {
    plan: "Capture the service area, job type and preferred date at inquiry. Send the request to the estimate owner, record the reply and stop estimate reminders once a booking is confirmed.",
    question: "Can different service areas have different owners?", answer: "Yes, if the selected platform supports the routing. Map each area to an owner, choose a fallback for unmatched requests and test with sample addresses.", tags: ["Automation"]
  },
  appointments: {
    plan: "Map availability and booking rules before choosing a calendar. Confirm each request, handle cancellations, and make sure staff can see replies that need personal attention.",
    question: "What happens when a customer reschedules?", answer: "We check how the booking system records changes, cancel reminders associated with the old appointment and test that the replacement reminder uses the new time.", tags: ["Growth Studio", "Automation"]
  },
  "local-businesses": {
    plan: "Start with the services, opening hours and locations people search for. Build a clear route from those pages to a call or inquiry and identify who handles each new request.",
    question: "Can we start with one branch or location?", answer: "Yes. Scope one location first and agree how to track its inquiries. Reuse the working approach for additional locations once the team has reviewed it.", tags: ["Growth Studio", "Branding"]
  },
};

export function AudienceDetail() {
  const { slug } = useParams();
  const a = audiences.find((x) => x.slug === slug);
  if (!a) return <NotFound />;
  const ex = audienceExtra[a.slug];
  const brief = audienceBriefs[a.slug];
  return (<>
    <PageHero eyebrow="Who We Help" title={a.title} text={a.desc} image={a.image}>
      <Link to={`/start-a-project?type=${encodeURIComponent(a.title)}&source=${encodeURIComponent(a.route)}`} className="btn-primary">Start a Project</Link>
      {a.slug === "authors-publishers" && <Link className="btn-ghost" to="/book-author-services/book-marketing">Plan a book launch</Link>}
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
    <Section className="bg-ink text-white"><div className="grid gap-8 lg:grid-cols-2"><h2 className="text-4xl">From brief to delivery</h2><p className="max-w-2xl text-lg">{brief.plan}</p></div></Section>
    <ProjectExamples tags={brief.tags}/>
    <Section><Heading eyebrow="FAQ" pre="Questions from" accent={a.title} center /><div className="mt-10"><FAQ items={[{ q: brief.question, a: brief.answer }, { q: "What should I bring to the first conversation?", a: "Share your main goal, timeline, existing materials and a budget range. We use these details to agree on the work, the project owner and the review points." }]} /></div></Section>
    <CTA to={`/start-a-project?type=${encodeURIComponent(a.title)}&source=${encodeURIComponent(a.route)}`} />
  </>);
}

/* ---------- Experts ---------- */
export function Experts() {
  return (<>
    <PageHero eyebrow="Team & Experts" title="Specialists for" accent="each stage." text="Find the discipline your project needs. At scoping, we confirm the people responsible for delivery, review and handover.">
      <Link to="/become-an-expert" className="btn-primary">Become an Expert</Link><Link to="/login" className="btn-ghost">Expert Login</Link>
    </PageHero>
    <Section><Heading eyebrow="Directory" pre="Explore by" accent="specialty."/><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map(s =>
      <article key={s.slug} className="rounded-2xl border border-slate-200 bg-white p-7">
        <s.icon size={24} className="text-brand-500"/><h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
        <p className="mt-3 text-slate-600">{s.items.join(" · ")}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link className="underline underline-offset-4" to={s.route}>Explore department</Link>
          <Link className="underline underline-offset-4" to={"/start-a-project?" + new URLSearchParams({ service:s.title, source:"/experts" })}>Discuss a brief</Link>
        </div>
      </article>)}</div></Section>
    <CTA title="Want to collaborate with Klexford?" text="We welcome skilled specialists in publishing, web, automation, growth and creative work." to="/become-an-expert" />
  </>);
}

export function BecomeExpert() {
  return <>
    <PageHero eyebrow="Become an Expert" title="Bring your" accent="specialism." text="Apply to collaborate on publishing, websites, automation, campaigns or brand projects." image={IMG.agencies}/>
    <Section><div className="grid gap-10 lg:grid-cols-5">
      <div className="lg:col-span-2"><h2 className="text-4xl">Working together</h2>
        <p className="mt-4 text-slate-600">Our coordination team reviews your experience, portfolio and availability against current project needs. Your application stays separate from the public team directory.</p>
      </div>
      <div className="lg:col-span-3"><InquiryForm kind="expert" action="Submit application" owner="Collaboration coordinator">
        <FormField label="Full name"><input name="name" autoComplete="name" required className={field}/></FormField>
        <FormField label="Email"><input type="email" name="email" autoComplete="email" required className={field}/></FormField>
        <FormField label="Specialty"><select name="department" required defaultValue="" className={field}><option value="" disabled>Select a specialty</option>{services.map(s => <option key={s.slug} value={s.slug}>{s.title}</option>)}</select></FormField>
        <FormField label="Portfolio or professional profile"><input type="url" name="portfolio" required placeholder="https://" className={field}/></FormField>
        <FormField label="Availability"><input name="availability" required placeholder="Start date or hours per week" className={field}/></FormField>
        <FormField label="Time zone (optional)"><input name="timeZone" className={field}/></FormField>
        <FormField label="Relevant experience" wide><textarea name="experience" required rows={4} placeholder="Describe a project and your contribution." className={field}/></FormField>
      </InquiryForm></div>
    </div></Section>
  </>;
}

export function VisibilityCheck() {
  const [review, setReview] = useState("");
  return <>
    <PageHero eyebrow="Free tool" title="Visibility" accent="check." text="Request a human review of one public book, author or business page. The review covers up to three observations and two practical next steps." image={IMG.growth_studio}/>
    <Section><div className="mx-auto max-w-3xl">
      <InquiryForm kind="visibility" action="Request review" owner={review === "Book or Author Visibility" ? "Author services lead" : "Website lead"}>
        <FormField label="Full name"><input name="name" autoComplete="name" required className={field}/></FormField>
        <FormField label="Email for your review"><input type="email" name="email" autoComplete="email" required className={field}/></FormField>
        <FormField label="Review type"><select name="reviewType" required value={review} onChange={e => setReview(e.target.value)} className={field}>
          <option value="" disabled>Select review type</option><option>Book or Author Visibility</option><option>Business Website Visibility</option>
        </select></FormField>
        <FormField label="Customer type"><select name="customerType" required defaultValue="" className={field}><option value="" disabled>Select audience</option>{audiences.map(a => <option key={a.slug}>{a.title}</option>)}<option>Other</option></select></FormField>
        <FormField label="Public page to review" wide><input type="url" name="url" required pattern="https?://.+" placeholder="https://" className={field}/></FormField>
        <FormField label="Main goal" wide><textarea name="goal" required rows={3} placeholder="What should a visitor find or do on this page?" className={field}/></FormField>
      </InquiryForm>
    </div></Section>
  </>;
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
  return <>
    <PageHero eyebrow="Start a Project" title="Tell us about" accent="your project." text="Choose one service or bring several departments into the same brief."/>
    <Section><div className="grid gap-10 lg:grid-cols-5">
      <div className="lg:col-span-2"><Img src={IMG.about2} alt="" className="aspect-[4/3] w-full rounded-2xl"/>
        <h2 className="mt-5 text-2xl">Prefer email?</h2><a href="mailto:hello@klexford.com" className="line-link mt-2">hello@klexford.com <ArrowRight size={15}/></a>
      </div>
      <div className="lg:col-span-3"><ProjectInquiryForm/></div>
    </div></Section>
  </>;
}

/* ---------- Legal & 404 ---------- */
export function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const title = kind === "privacy" ? "Privacy Policy" : "Terms of Service";
  return (<>
    <PageHero eyebrow="Legal" title={title} text={kind === "privacy" ? "How information is handled in this demonstration." : "Using the Klexford demonstration site."} />
    <Section><div className="mx-auto max-w-2xl space-y-5 text-lg">
      <h2 className="text-4xl">{kind === "privacy" ? "Browser storage" : "Demo workspace"}</h2>
      <p>{kind === "privacy" ? "When online submission is available, Klexford receives the details you submit for project, application or visibility review. In email mode, forms save a local copy in your browser and you send the prepared email yourself. Demo account and invoice records use browser storage. Clearing site data removes local copies." : "The project examples, accounts and invoice workflows illustrate how the studio works. Use sample information when exploring the portals."}</p>
      <a className="line-link" href="mailto:hello@klexford.com">Contact the studio <ArrowRight size={16}/></a>
    </div></Section>
  </>);
}

export function NotFound() {
  return <Section><div className="py-20 text-center"><p className="text-7xl font-bold text-brand-500">404</p><h1 className="mt-4 text-2xl font-semibold">Page not found</h1><Link to="/" className="btn-primary mt-8">Back Home</Link></div></Section>;
}
