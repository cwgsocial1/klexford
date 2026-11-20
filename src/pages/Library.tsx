import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Check, ClipboardList, Globe, Search } from "lucide-react";
import { PageHero, Img } from "../components/ui";
import { audiences, resources, workDisciplines } from "../data";
import { portfolioUrl, usePublishedWork } from "../lib/portfolio";
import { resourcePath, slug, checklistIds } from "../lib/publicPaths";
import "./Library.css";

function EmptyPath({ to, label }: { to: string; label: string }) {
  return <PageHero eyebrow="Page unavailable" title="We couldn’t find that page." text="Choose an item from the directory to continue.">
    <Link className="btn-primary" to={to}>{label}<ArrowRight size={16}/></Link>
  </PageHero>;
}

function DirectoryCard({ image, type, title, text, to }: { image: string; type: string; title: string; text: string; to: string }) {
  return <Link to={to} className="library-card">
    <div className="library-card-frame">{image ? <Img className="library-card-image" src={image} alt=""/> : <div aria-hidden="true" className="library-card-image bg-brand-50"/>}</div>
    <div className="library-card-copy"><span>{type}</span><h2 className="break-words">{title}</h2><p className="line-clamp-3 break-words">{text}</p><ArrowRight aria-hidden="true" size={19}/></div>
  </Link>;
}

function Detail({ back, label, children }: { back: string; label: string; children: ReactNode }) {
  return <section className="library-detail container-x">
    <Link to={back} className="library-back"><ArrowLeft size={15}/>{label}</Link>
    <div className="library-reading">{children}</div>
  </section>;
}

export function WorkDirectory() {
  const [discipline, setDiscipline] = useState("");
  const [audience, setAudience] = useState("");
  const [page, setPage] = useState(0);
  const published = usePublishedWork({ category: discipline, audience, page });
  const total = published.rows.length;
  return <>
    <PageHero eyebrow="Our work" title="Project studies." text="Browse the studio’s portfolio and explore illustrative briefs across publishing, brand and digital."/>
    <section className="library-content container-x" aria-label="Project studies">
      <div className="library-filters">
        <label>Discipline<select value={discipline} onChange={e => { setDiscipline(e.target.value); setPage(0); }}><option value="">All disciplines</option>{workDisciplines.map(name => <option key={name}>{name}</option>)}</select></label>
        <label>Audience<select value={audience} onChange={e => { setAudience(e.target.value); setPage(0); }}><option value="">All audiences</option>{audiences.map(a => <option key={a.slug}>{a.title}</option>)}</select></label>
      </div>
      <p className="sr-only" role="status">{published.loading ? "Loading portfolio" : total + " projects shown."}</p>
      {published.error && <p role="status" className="mb-5">The portfolio could not be loaded. <button className="underline" onClick={published.retry}>Try again</button></p>}
      <div className="library-grid library-results" key={discipline + "/" + audience + "/" + page}>
        {published.rows.map(item => <DirectoryCard key={item.id} image={item.image} type={[item.category, item.legacy_slug ? "Concept" : "Portfolio"].filter(Boolean).join(" · ")} title={item.title} text={item.summary} to={portfolioUrl(item)}/>)}
      </div>
      {!total && !published.loading && !published.error && <div className="library-empty"><p>No studies match these selections.</p><button className="btn-ghost" onClick={() => { setPage(0); setAudience(""); setDiscipline(""); }}>Show all studies</button></div>}
      {(page > 0 || published.more) && <nav aria-label="Portfolio pages" className="mt-8 flex gap-4">
        <button className="btn-ghost" disabled={!page || published.loading} onClick={() => setPage(v => v-1)}>Previous page</button>
        <button className="btn-ghost" disabled={!published.more || published.loading} onClick={() => setPage(v => v+1)}>Next page</button>
      </nav>}
    </section>
  </>;
}

export function ProjectStudy() {
  const { slug: path = "" } = useParams<{ slug: string }>();
  const byId = /^p-[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(path);
  const published = usePublishedWork(byId ? { id: path.slice(2), limit: 1 } : { legacySlug: path, limit: 1 });
  if (published.loading) return <div className="container-x py-20" role="status">Loading project…</div>;
  if (published.error) return <section className="container-x py-20"><h1 className="text-3xl">Unable to load the project.</h1><button className="btn-ghost mt-4" onClick={published.retry}>Try again</button></section>;
  const item = published.rows[0];
  if (!item) return <EmptyPath to="/work" label="Browse work"/>;
  return <>
    <PageHero eyebrow={[item.category, item.legacy_slug ? "Illustrative brief" : "Portfolio"].filter(Boolean).join(" · ")}
      title={item.title} text={item.goal || item.audience} image={item.image}/>
    <Detail back="/work" label="All project studies">
      <h2>About the project</h2><p className="whitespace-pre-line break-words">{item.summary}</p>
      {item.goal && item.audience && <><h2>Who it’s for</h2><p>{item.audience}</p></>}
      {item.scope.length > 0 && <><h2>Proposed scope</h2><ul>{item.scope.map((task, index) => <li key={index}>{task}</li>)}</ul></>}
      {item.handover && <><h2>Review and handover</h2><p className="whitespace-pre-line break-words">{item.handover}</p></>}
      <Link className="btn-primary" to={item.service_path || "/start-a-project"}>{item.service_path ? "Explore this service" : "Discuss a similar project"} <ArrowRight size={16}/></Link>
    </Detail>
  </>;
}

const readings: Record<string, { group: string; intro: string; details: string[]; to: string; action: string }> = {
  "Planning a book launch: the first 90 days": {
    group: "Books & Authors", intro: "Work back from release day with a plan for the reader, the materials and the announcement.",
    details: ["Read the pitch aloud. A reader should be able to tell who the book follows, what is at stake, or what question it answers. Keep the release date provisional until the production files are ready.", "Build a single folder for approved copy, cover artwork, retailer links and the author biography. Give each item an owner so a late edit reaches every channel.", "Check the live book page before sending the first message. At the end of the launch, write down which messages drew engaged readers and what you would repeat."],
    to: "/tools/book-launch-checklist", action: "Open the launch checklist"
  },
  "Manuscript-to-upload publishing checklist": {
    group: "Books & Authors", intro: "A clean handover helps an editor, designer and publisher work from the same version.",
    details: ["Name one file as the master. Include any acknowledgements, image credits and permissions in the handover folder so they are checked with the text.", "For print, inspect running heads and chapter starts. For an ebook, change the reading size and test the contents links in a reader app.", "Copy the confirmed metadata into one sheet. Compare the author name, subtitle, description and edition to the title page before approving an upload."],
    to: "/book-author-services", action: "Explore author services"
  },
  "Is your website ready to take inquiries?": {
    group: "Business & Digital", intro: "Test your contact journey from the perspective of someone who has never worked with you.",
    details: ["Ask a colleague to read the page once. Have them describe what you do and point to the next step without giving them directions.", "Use sample data and a new browser session. Try the required fields, validation messages and confirmation on both a narrow and a wide screen.", "Trace the test inquiry into the system where staff work. Check the assigned owner and confirm that a reply can reach the same visitor."],
    to: "/tools/website-inquiry-checklist", action: "Run the inquiry checklist"
  },
  "Setting up follow-up workflows that feel personal": {
    group: "Business & Digital", intro: "Build a follow-up sequence around the decisions your customer is making.",
    details: ["Write down what the visitor has already told you. Each new message should answer a likely question or help the person take one clear step.", "Use a named handoff for pricing changes, availability or complex questions. Keep a short note explaining the last contact and the planned next action.", "Run a returning contact through the sequence. Confirm a reply, booking or opt-out stops scheduled messages and gives the owner enough context to respond."],
    to: "/crm-automation", action: "Explore automation services"
  },
  "Brand identity essentials for small businesses": {
    group: "Business & Digital", intro: "Start with the few design choices your business repeats most often.",
    details: ["Collect a storefront image, social profile and web page. Compare how the name reads at the smallest size and where backgrounds hide part of the mark.", "Make a one-page reference with your primary logo files, type sizes and colour values. Include examples of a headline, paragraph and action button.", "Build one useful item such as a proposal page. Use what you learn about spacing, contrast and typography to refine the rest of the system."],
    to: "/branding-creative", action: "Explore brand identity"
  },
  "Email vs SMS: choosing your customer channel": {
    group: "Business & Digital", intro: "Choose a channel around the message, the recipient’s preference and the response you need.",
    details: ["Separate permission for service updates from promotional signups. Make preference changes easy for staff to see before they send again.", "A detailed project update can stay in email. A requested appointment reminder can be short and time-specific. Avoid sending the same notice twice by default.", "Send samples to real devices with test contact details. Review delivery failures and replies so someone can take over when automation stops."],
    to: "/growth-studio", action: "Explore growth services"
  }
};

export function ResourceDirectory() {
  const [group, setGroup] = useState("All resources");
  const visible = resources.filter(item => group === "All resources" || readings[item.title].group === group);
  return <>
    <PageHero eyebrow="Resources" title="Field guides." text="Practical notes for preparing a book, building a digital presence and improving the way inquiries reach your team."/>
    <section className="library-content container-x" aria-label="Resource library">
      <div className="library-tabs">{["All resources", "Books & Authors", "Business & Digital"].map(label => <button key={label} aria-pressed={label === group} onClick={() => setGroup(label)}>{label}</button>)}</div>
      <p className="sr-only" role="status">{visible.length} resources shown.</p>
      <div className="library-grid library-results" key={group}>{visible.map(r => <DirectoryCard key={r.title} title={r.title} image={r.image} text={readings[r.title].intro} type={readings[r.title].group} to={resourcePath(r.title)}/>)}</div>
    </section>
  </>;
}

export function Article() {
  const { slug: id } = useParams();
  const article = resources.find(r => slug(r.title) === id);
  if (!article) return <EmptyPath to="/resources" label="Browse resources"/>;
  const guide = readings[article.title];
  return <>
    <PageHero eyebrow={guide.group + " · " + article.type} title={article.title} text={guide.intro} image={article.image}/>
    <Detail back="/resources" label="All resources">
      {article.notes.map((note, i) => <div key={note}><h2>{note}</h2><p>{guide.details[i]}</p></div>)}
      <Link to={guide.to} className="btn-primary">{guide.action}<ArrowRight size={16}/></Link>
    </Detail>
  </>;
}

const checklists = {
  "book-launch-checklist": {
    title: "Book Launch Checklist", description: "Use your release plan and book files to check what is ready and identify the next task.",
    tasks: ["Write a reader description and one-paragraph pitch.", "Confirm the title, subtitle and author name across files and listings.", "Proofread the final book and review cover art at thumbnail size.", "Prepare a sample chapter and an accessible book landing page.", "Open every retailer and newsletter link on a phone.", "Assign owners and dates for launch emails and promotional posts."],
    action: "Explore book marketing", to: "/book-author-services/book-marketing", icon: BookOpen
  },
  "website-inquiry-checklist": {
    title: "Website Inquiry Checklist", description: "Walk through your website with a test contact and follow an inquiry from first visit to handoff.",
    tasks: ["Read the homepage on a phone and identify the main offer.", "Find the contact action on a relevant service page.", "Check that required fields and error messages are easy to understand.", "Send an inquiry using test details and check the confirmation.", "Find the request in your inbox or CRM and confirm its owner.", "Verify that a reply or booking stops unnecessary reminders."],
    action: "Explore website services", to: "/website-development", icon: Globe
  }
};

export function ToolDirectory() {
  return <>
    <PageHero eyebrow="Tools" title="Plan your next step." text="Check your preparation for a book launch or a website inquiry, or request a focused review of a public page."/>
    <section className="library-content container-x"><div className="library-grid">{Object.entries(checklists).map(([id, tool]) =>
      <Link to={"/tools/" + id} key={id} className="library-tool"><tool.icon/><h2>{tool.title}</h2><p>{tool.description}</p><strong>Open checklist <ArrowRight size={16}/></strong></Link>)}
      <Link to="/tools/visibility-check" className="library-tool"><Search/><h2>Free Visibility Check</h2><p>Share one public book, author or business URL and your main goal for a scoped visibility review.</p><strong>Request a review <ArrowRight size={16}/></strong></Link>
    </div></section>
  </>;
}

type ChecklistId = (typeof checklistIds)[number];

function ChecklistBody({ id }: { id: ChecklistId }) {
  const tool = checklists[id];
  const storageKey = "kx-checklist-" + id;
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      return Array.isArray(stored) ? tool.tasks.filter(task => stored.includes(task)) : [];
    } catch { return []; }
  });
  const complete = completed.length === tool.tasks.length;
  function update(next: string[]) {
    setCompleted(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep this session usable without device storage. */ }
  }
  return <>
    <PageHero eyebrow="Interactive checklist" title={tool.title} text={tool.description}/>
    <Detail back="/tools" label="All tools">
      <div className="library-progress"><ClipboardList size={20}/><strong aria-live="polite">{completed.length} of {tool.tasks.length} complete</strong></div>
      <div className="library-meter">
        <progress className="sr-only" max={tool.tasks.length} value={completed.length} aria-label="Checklist progress"/>
        <span aria-hidden="true" style={{ transform: `scaleX(${completed.length / tool.tasks.length})` }}/>
      </div>
      <div className="library-task-list">{tool.tasks.map(task => <label key={task}><input type="checkbox" checked={completed.includes(task)} onChange={e => update(e.target.checked ? [...completed, task] : completed.filter(c => c !== task))}/><span>{task}</span></label>)}</div>
      {complete && <p className="library-success" role="status"><Check size={18}/> All checks complete.</p>}
      <div className="library-task-actions"><Link className="btn-primary" to={tool.to}>{tool.action}<ArrowRight size={16}/></Link><button disabled={!completed.length} className="library-back" onClick={() => update([])}>Reset checklist</button></div>
    </Detail>
  </>;
}

export function Checklist() {
  const { slug: id } = useParams();
  const checklistId = checklistIds.find(value => id === value);
  if (!checklistId) return <EmptyPath to="/tools" label="Browse tools"/>;
  return <ChecklistBody key={checklistId} id={checklistId}/>;
}
