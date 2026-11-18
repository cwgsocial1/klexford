import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { audiences, plans, services } from "../data";
import type { Inquiry } from "../lib/operations";
import { field, Label } from "./ui";

import { workspaceEndpoint } from "../lib/workspaceApi";
import { useSiteSettings } from "../lib/siteSettings";
const formClass = "grid min-w-0 gap-5 rounded-3xl border border-slate-200 bg-white p-5 text-ink shadow-card sm:grid-cols-2 sm:p-8";
const receipt = {
  project: { subject: "Project inquiry", saved: "Your project brief is ready." },
  expert: { subject: "Collaboration application", saved: "Your application is ready." },
  visibility: { subject: "Visibility review request", saved: "Your review request is ready." },
};

export function FormField({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={wide ? "min-w-0 sm:col-span-2" : "min-w-0"}><Label>{label}</Label>{children}</label>;
}

type InquiryMode = "email" | "live" | "edge";

async function inquiryMode(): Promise<InquiryMode> {
  const response = await fetch("/api/inquiries", { headers: { Accept: "application/json" }, cache: "no-store" });
  if (response.status === 404 || (response.ok && response.headers.get("content-type")?.includes("text/html"))) return "email";
  if (!response.ok) throw new Error("The inquiry service is unavailable.");
  const config = await response.json();
  if (typeof config.live !== "boolean") throw new Error("Invalid inquiry configuration.");
  if (!config.live) return "email";
  return config.edge === true ? "edge" : "live";
}

export function InquiryForm({ kind, action, children, owner, source }: {
  kind: Inquiry["kind"]; action: string; children: ReactNode; owner: string; source?: string;
}) {
  const { pathname } = useLocation();
  const { contact_email: contact } = useSiteSettings();
  const [mode, setMode] = useState<InquiryMode | null>(null);
  const [result, setResult] = useState<"email" | "live" | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const attempt = useRef({ key: "", id: "" });

  useEffect(() => {
    let mounted = true;
    inquiryMode().then(value => { if (mounted) setMode(value); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(false);
    const form = new FormData(event.currentTarget);
    const entries: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      const text = String(value).trim();
      if (text) entries[key] = entries[key] ? entries[key] + ", " + text : text;
    }
    const body = Object.entries(entries).map(([key, value]) => key + ": " + value).join("\n");
    setDraft("mailto:" + contact + "?subject=" + encodeURIComponent(receipt[kind].subject) + "&body=" + encodeURIComponent(body));
    const payload = { kind, name: entries.name, email: entries.email, data: { ...entries, source: source || pathname, owner } };
    try {
      const delivery = mode && mode !== "email" ? mode : await inquiryMode();
      setMode(delivery);
      if (delivery !== "email") {
        const key = JSON.stringify(payload);
        if (attempt.current.key !== key) attempt.current = { key, id: crypto.randomUUID() };
        const response = await fetch(workspaceEndpoint("inquiries", delivery === "edge"), {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, requestId: attempt.current.id }),
        });
        if (!response.ok || (await response.json()).ok !== true) throw new Error("Submission failed.");
      }
      setResult(delivery === "email" ? "email" : "live");
    } catch {
      setError(true);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  if (result) return <div className={formClass} role="status"><div className="inquiry-receipt sm:col-span-2">
    <span className="inquiry-success-icon mb-4"><Check aria-hidden="true" size={20}/></span>
    <h3 className="text-2xl font-semibold">{result === "email" ? receipt[kind].saved : receipt[kind].subject + " received."}</h3>
    {result === "email" ? <><p className="mb-5 mt-2 text-sm text-slate-600">Open your email draft and send it to Klexford for review.</p>
    <a href={draft} className="btn-primary">Open email draft <ArrowRight size={16}/></a></> :
    <p className="mt-2 text-sm text-slate-600">Klexford will review your details and follow up using the email you provided.</p>}
  </div></div>;

  return <form onSubmit={submit} className={formClass}>
    {children}
    <div className="space-y-3 sm:col-span-2">
      {mode === "email" && <p className="text-sm text-slate-600">Prepare your details here, then send them by email.</p>}
      {error && <p role="alert" className="inquiry-error">We could not confirm this submission. Try again or <a className="underline" href={draft}>send your details by email</a>.</p>}
      <button type="submit" disabled={busy} aria-busy={busy} className="inquiry-submit btn-primary">
        {busy ? (mode === "email" ? "Preparing email…" : "Submitting…") : mode === "email" ? "Prepare email" : action}
        {busy ? <LoaderCircle className="inquiry-spinner" size={17} aria-hidden="true"/> : <ArrowRight size={16} aria-hidden="true"/>}
      </button>
      <span className="sr-only" role="status">{busy ? (mode === "email" ? "Preparing your email." : "Submitting your details.") : ""}</span>
    </div>
  </form>;
}

const leads: Record<string, string> = {
  "book-author-services": "Author services lead",
  "website-development": "Website lead",
  "crm-automation": "Automation lead",
  "growth-studio": "Growth lead",
  "branding-creative": "Creative lead",
};
const bookOptions = ["Book marketing", "Editing or proofreading", "Cover design", "Interior formatting or EPUB", "Publishing support"];
const unknown = "Help me choose";

export function ProjectInquiryForm() {
  const [query] = useSearchParams();
  const { pathname } = useLocation();
  const requested = services.find(s => s.title === query.get("service") || s.slug === query.get("service"));
  const audience = audiences.find(a => a.title === query.get("type") || a.slug === query.get("type"));
  const [primary, setPrimary] = useState(requested?.slug || "");
  const [additional, setAdditional] = useState<string[]>([]);
  const [bookWork, setBookWork] = useState<string[]>([]);
  const selected = primary && primary !== unknown ? [primary, ...additional.filter(s => s !== primary)] : [];
  const needsLength = bookWork.includes(bookOptions[1]) || bookWork.includes(bookOptions[3]);
  const route = query.get("source");
  const source = route && route.startsWith("/") && !route.startsWith("//") ? route : pathname;
  const owner = selected.length === 1 ? leads[selected[0]] : "Project coordinator";
  const plan = plans.some(p => p.title === query.get("plan")) ? query.get("plan") || "" : "";

  return <InquiryForm kind="project" action="Submit inquiry" owner={owner} source={source}>
    <FormField label="Full name"><input name="name" autoComplete="name" required className={field}/></FormField>
    <FormField label="Email"><input name="email" type="email" autoComplete="email" required className={field}/></FormField>
    <FormField label="Customer type"><select name="customerType" required defaultValue={audience?.title || ""} className={field}>
      <option value="" disabled>Choose your audience</option>{audiences.map(a => <option key={a.slug}>{a.title}</option>)}<option>Other</option>
    </select></FormField>
    <FormField label="Primary service"><select name="service" required value={primary} className={field} onChange={e => { setPrimary(e.target.value); setAdditional([]); setBookWork([]); }}>
      <option value="" disabled>Choose a service</option>{services.map(s => <option key={s.slug} value={s.slug}>{s.title}</option>)}<option>{unknown}</option>
    </select></FormField>
    {primary && primary !== unknown && <details className="sm:col-span-2"><summary className="cursor-pointer text-sm font-semibold">Add supporting services</summary>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{services.filter(s => s.slug !== primary).map(s => <label key={s.slug} className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="additionalServices" value={s.title} checked={additional.includes(s.slug)} onChange={e => setAdditional(e.target.checked ? [...additional, s.slug] : additional.filter(v => v !== s.slug))}/>{s.title}
      </label>)}</div>
    </details>}
    {selected.includes("book-author-services") && <fieldset className="grid min-w-0 gap-4 rounded-xl border border-slate-200 p-4 sm:col-span-2 sm:grid-cols-2"><legend className="px-2 font-semibold">Your book</legend>
      <FormField label="Working title"><input name="bookTitle" className={field}/></FormField>
      <FormField label="Genre"><input name="genre" className={field}/></FormField>
      <FormField label="Manuscript stage"><select name="bookStage" defaultValue="" className={field}><option value="">Select stage</option>{["Planning","Drafting","Editing","Preparing to publish","Published"].map(x => <option key={x}>{x}</option>)}</select></FormField>
      <FormField label="Release date, if set"><input type="date" name="releaseDate" className={field}/></FormField>
      <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-semibold">Book services</legend><div className="grid gap-2 sm:grid-cols-2">
        {bookOptions.map(item => <label key={item} className="flex items-center gap-2 text-sm"><input type="checkbox" name="bookServices" value={item} checked={bookWork.includes(item)} onChange={e => setBookWork(e.target.checked ? [...bookWork, item] : bookWork.filter(v => v !== item))}/>{item}</label>)}
      </div></fieldset>
      {needsLength && <FormField label="Approximate word count"><input type="number" min="0" name="wordCount" className={field}/></FormField>}
    </fieldset>}
    {(selected.includes("website-development") || selected.includes("crm-automation")) && <FormField label="Current website or CRM platform" wide><input name="platform" placeholder="For example, WordPress or GoHighLevel" className={field}/></FormField>}
    {selected.includes("growth-studio") && <FormField label="Current marketing channels" wide><input name="channels" placeholder="For example, search, email or social" className={field}/></FormField>}
    <FormField label="Project details" wide><textarea name="details" required rows={3} className={field} placeholder="What would you like to make or improve?"/></FormField>
    <FormField label="Timeline"><input name="timeline" required className={field} placeholder="Target date or flexible"/></FormField>
    <FormField label="Budget range (USD)"><select name="budget" className={field} defaultValue="" required><option value="" disabled>Choose a range</option>{["Under $500","$500–$2,000","$2,000–$5,000","$5,000+","To be agreed"].map(x => <option key={x}>{x}</option>)}</select></FormField>
    <FormField label="Preferred engagement"><select name="plan" className={field} defaultValue={plan}><option value="">Open to advice</option>{plans.map(p => <option key={p.title}>{p.title}</option>)}</select></FormField>
    <FormField label="Website or project link (optional)"><input name="projectUrl" type="url" placeholder="https://" className={field}/></FormField>
  </InquiryForm>;
}
