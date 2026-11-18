import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Check, ClipboardList, Globe, Search } from "lucide-react";
import { PageHero, Img } from "../components/ui";
import { resources, work } from "../data";
import "./Library.css";

import { casePath, resourcePath, slug, checklistIds } from "../lib/publicPaths";

type Brief = {
  audience: string;
  goal: string;
  scope: string[];
  check: string;
  service: string;
};

const briefs: Record<string, Brief> = {
  "Book Marketing": {
    audience: "Authors & Publishers", service: "/book-author-services/book-marketing",
    goal: "Give a debut novelist a clear introduction to their book and a practical plan for reaching readers around release.",
    scope: ["Identify the book’s genre, comparable titles and the promise on the first page.", "Draft a launch email, a sample chapter invitation and a schedule for the author’s existing channels.", "Separate the author’s approvals from the studio’s production tasks in a shared calendar."],
    check: "Before release, test the sample download and retailer links. After release, review qualified visits and email engagement where the author has access."
  },
  Website: {
    audience: "Authors & Publishers", service: "/website-development",
    goal: "Give readers one place to find an author’s books, read a sample and choose whether to receive the next newsletter.",
    scope: ["Map the reader journey from the author bio to a book detail page.", "Give each book a synopsis, accessible sample and clearly named purchase destinations.", "Connect the signup form to a welcome email and document the handover."],
    check: "Try the reader journey on a phone. Use a test subscription to check the welcome message and preference controls."
  },
  Automation: {
    audience: "Home-Service Businesses", service: "/crm-automation",
    goal: "Help a cleaning business track estimate requests from the first website visit through booking.",
    scope: ["Collect the service type, preferred date and contact details on one form.", "Assign each request to a coordinator and show its current stage in a booking pipeline.", "Send a reminder only when a reply is due and stop the sequence once the client responds."],
    check: "Walk a sample inquiry through request, estimate, reply and booking. Check for duplicate reminders when the same contact returns."
  },
  "Book Design": {
    audience: "Authors & Publishers", service: "/book-author-services",
    goal: "Carry a business author’s visual identity from a print cover to a readable digital edition.",
    scope: ["Agree on trim size, target reader, cover hierarchy and final manuscript.", "Develop a cover direction and a sample chapter before laying out the full book.", "Prepare a print-ready interior and a reflowable EPUB with chapter navigation."],
    check: "Inspect the print proof at actual size, then check navigation and typography on two screen sizes."
  },
  "Growth Studio": {
    audience: "Appointment-Based Businesses", service: "/growth-studio",
    goal: "Help prospective visitors find the right clinic service and understand how to request an appointment.",
    scope: ["Review service pages for clear location, hours and booking information.", "Agree on a search campaign brief, approved copy, geographic focus and spending limit.", "Separate booking requests from routine page visits in the reporting plan."],
    check: "Test the appointment journey and agree on a reporting period. Review campaign costs alongside confirmed inquiries."
  },
  Branding: {
    audience: "Creators & Personal Brands", service: "/branding-creative",
    goal: "Give a coach a recognisable identity across a service page, presentation and social posts.",
    scope: ["Review the coach’s positioning and choose one visual direction.", "Develop a wordmark, colour palette and practical type hierarchy.", "Apply the identity to a service page mockup and reusable post templates."],
    check: "Check legibility at mobile size, test each logo variation on light and dark backgrounds, and package approved source files."
  }
};

function EmptyPath({ to, label }: { to: string; label: string }) {
  return <PageHero eyebrow="Page unavailable" title="We couldn’t find that page." text="Choose an item from the directory to continue.">
    <Link className="btn-primary" to={to}>{label}<ArrowRight size={16}/></Link>
  </PageHero>;
}

function DirectoryCard({ image, type, title, text, to }: { image: string; type: string; title: string; text: string; to: string }) {
  return <Link to={to} className="library-card">
    <Img className="library-card-image" src={image} alt=""/>
    <div className="library-card-copy"><span>{type}</span><h2>{title}</h2><p>{text}</p><ArrowRight aria-hidden="true" size={19}/></div>
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
  const visible = work.filter(item => (!discipline || item.tag === discipline) && (!audience || briefs[item.tag].audience === audience));
  return <>
    <PageHero eyebrow="Our work" title="Project studies." text="Explore illustrative briefs from publishing, brand and digital. Each study outlines the objective, proposed deliverables and how the work would be reviewed."/>
    <section className="library-content container-x" aria-label="Project studies">
      <div className="library-filters">
        <label>Discipline<select value={discipline} onChange={e => setDiscipline(e.target.value)}><option value="">All disciplines</option>{work.map(item => <option key={item.tag}>{item.tag}</option>)}</select></label>
        <label>Audience<select value={audience} onChange={e => setAudience(e.target.value)}><option value="">All audiences</option>{Array.from(new Set(Object.values(briefs).map(b => b.audience))).map(a => <option key={a}>{a}</option>)}</select></label>
      </div>
      <div className="library-grid">{visible.map(item => <DirectoryCard key={item.title} image={item.image} type={item.tag + " · Concept"} title={item.title} text={item.summary} to={casePath(item.title)}/>)}</div>
      {!visible.length && <div className="library-empty"><p>No studies match these selections.</p><button className="btn-ghost" onClick={() => { setAudience(""); setDiscipline(""); }}>Show all studies</button></div>}
    </section>
  </>;
}

export function ProjectStudy() {
  const { slug: id } = useParams();
  const item = work.find(w => slug(w.title) === id);
  if (!item) return <EmptyPath to="/work" label="Browse work"/>;
  const brief = briefs[item.tag];
  return <>
    <PageHero eyebrow={item.tag + " · Illustrative brief"} title={item.title} text={brief.goal} image={item.image}/>
    <Detail back="/work" label="All project studies">
      <h2>Who it’s for</h2><p>{brief.audience}</p>
      <h2>Proposed scope</h2><ul>{brief.scope.map(task => <li key={task}>{task}</li>)}</ul>
      <h2>Review and handover</h2><p>{brief.check}</p>
      <Link className="btn-primary" to={brief.service}>Explore this service <ArrowRight size={16}/></Link>
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
  return <>
    <PageHero eyebrow="Resources" title="Field guides." text="Practical notes for preparing a book, building a digital presence and improving the way inquiries reach your team."/>
    <section className="library-content container-x" aria-label="Resource library">
      <div className="library-tabs">{["All resources", "Books & Authors", "Business & Digital"].map(label => <button key={label} aria-pressed={label === group} onClick={() => setGroup(label)}>{label}</button>)}</div>
      <div className="library-grid">{resources.filter(r => group === "All resources" || readings[r.title].group === group).map(r => <DirectoryCard key={r.title} title={r.title} image={r.image} text={readings[r.title].intro} type={readings[r.title].group} to={resourcePath(r.title)}/>)}</div>
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
      <progress max={tool.tasks.length} value={completed.length} aria-label="Checklist progress"/>
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
