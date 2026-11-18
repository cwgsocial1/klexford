import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BriefcaseBusiness, Check, CheckCircle2, Copy, Eye, FileText, Inbox, MessageSquareQuote, Pencil, Plus, Trash2 } from "lucide-react";
import { field, Label } from "../components/ui";
import { usePortal, type Permission } from "./PortalContext";
import { database, invoiceLink, invoiceStatus, money, totals, useWorkspaceData, type Inquiry, type InvoiceStatus, type PaymentSettings, type SiteSettings, type WorkspaceInvoice } from "../lib/operations";
export { InvoiceEditor } from "./InvoiceEditor";
export { InvoiceView } from "./ClientInvoice";

const statusStyle: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-600", sent: "bg-blue-50 text-blue-700", paid: "bg-emerald-50 text-emerald-700",
  overdue: "bg-rose-50 text-rose-700", cancelled: "bg-slate-100 text-slate-500",
};
const pageSize = 25;
function FetchState({ error, retry }: { error?: string; retry: () => void }) {
  return error
    ? <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error} <button onClick={retry} className="font-semibold underline">Retry</button></p>
    : <p role="status" className="text-sm text-slate-600">Loading…</p>;
}
function Pagination({ page, total, move }: { page: number; total: number; move: (n: number) => void }) {
  if (total <= pageSize) return null;
  return <nav aria-label="Results pages" className="flex items-center justify-end gap-4 text-sm">
    <button className="btn-ghost" disabled={page === 0} onClick={() => move(page - 1)}>Previous</button>
    <span>Page {page + 1} of {Math.ceil(total / pageSize)}</span>
    <button className="btn-ghost" disabled={(page + 1) * pageSize >= total} onClick={() => move(page + 1)}>Next</button>
  </nav>;
}
const destinations: { path: string; table: string; label: string; permission: Permission; icon: typeof Inbox }[] = [
  { path: "portfolio", table: "portfolio_work", label: "Portfolio projects", permission: "work.manage", icon: BriefcaseBusiness },
  { path: "testimonials", table: "testimonials", label: "Testimonials", permission: "testimonials.manage", icon: MessageSquareQuote },
  { path: "inquiries", table: "inquiries", label: "New inquiries", permission: "inquiries.manage", icon: Inbox },
  { path: "invoices", table: "invoices", label: "Invoices", permission: "invoices.manage", icon: FileText },
];
export function Overview() {
  const { profile, can } = usePortal();
  const [revision, setRevision] = useState(0);
  const sections = destinations.filter(s => can(s.permission));
  const base = "/" + profile.role;
  const read = useWorkspaceData("overview:" + profile.id + ":" + sections.map(s => s.path).join(",") + ":" + revision, async () => {
    return Promise.all(sections.map(async section => {
      let query = database().from(section.table).select("id", { count: "exact", head: true });
      if (section.table === "inquiries") query = query.eq("status", "new");
      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    }));
  });
  return <div className="space-y-6">
    <h1>Workspace overview</h1>
    {sections.length === 0 ? <p className="access-panel">Your account is active. Your administrator can assign workspace permissions.</p> :
    !read.data ? <FetchState error={read.error} retry={read.reload}/> :
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{sections.map((s, index) => <Link to={base + "/" + s.path} key={s.path} className="access-panel group">
      <div className="flex justify-between text-slate-500"><s.icon size={21}/><ArrowUpRight size={17}/></div>
      <p className="mt-6 text-4xl font-semibold">{read.data![index]}</p><p className="mt-1 text-sm text-slate-600">{s.label}</p>
    </Link>)}</div>}
    {can("invoices.manage") && <><InvoiceBalances revision={revision}/><RecentInvoices revision={revision} onChange={() => setRevision(n => n + 1)}/></>}
  </div>;
}
function InvoiceBalances({ revision }: { revision: number }) {
  const { profile } = usePortal();
  const read = useWorkspaceData("balances:" + profile.id + ":" + revision, async () => {
    const { data, error } = await database().rpc("get_invoice_balances");
    if (error) throw error;
    return data as { currency: string; paid: number; outstanding: number; overdue: number }[];
  });
  if (!read.data) return <FetchState error={read.error} retry={read.reload}/>;
  if (!read.data.length) return null;
  return <section className="access-panel"><h2>Invoice balances</h2>
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[400px] text-left text-sm">
      <thead className="text-slate-600"><tr>{["Currency","Paid","Outstanding","Overdue"].map(label => <th key={label} className="pb-2">{label}</th>)}</tr></thead>
      <tbody>{read.data.map(row => <tr key={row.currency} className="border-t border-slate-100"><th className="py-2">{row.currency}</th>
        <td>{money(row.paid, row.currency)}</td><td>{money(row.outstanding, row.currency)}</td><td>{money(row.overdue, row.currency)}</td></tr>)}</tbody>
    </table></div>
  </section>;
}
function RecentInvoices({ revision, onChange }: { revision: number; onChange: () => void }) {
  const { profile } = usePortal();
  const read = useWorkspaceData("recent:" + profile.id + ":" + revision, async () => {
    const { data, error } = await database().from("invoices").select("*").order("created_at", { ascending: false }).limit(5);
    if (error) throw error;
    return data as WorkspaceInvoice[];
  });
  return read.data ? <InvoiceTable invoices={read.data} title="Recent invoices" onChange={onChange}/> : <FetchState error={read.error} retry={read.reload}/>;
}
function InvoiceTable({ invoices, title, onChange }: { invoices: WorkspaceInvoice[]; title: string; onChange: () => void }) {
  const { profile } = usePortal();
  const admin = profile.role === "admin";
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState("");
  async function act(i: WorkspaceInvoice, action: "delete" | "paid") {
    if (busy || !window.confirm(action === "paid" ? `Confirm receipt of payment for ${i.number}?` : `Delete invoice ${i.number}?`)) return;
    setBusy(i.id);
    setFeedback("");
    try {
      const table = database().from("invoices");
      const mutation = action === "paid" ? table.update({ status: "paid" }) : table.delete();
      const { error } = await mutation.eq("id", i.id).eq("updated_at", i.updated_at).select("id").single();
      if (error) throw error;
      onChange();
    } catch { setFeedback("The invoice could not be updated. Refresh the list and check your permissions."); }
    finally { setBusy(""); }
  }
  async function copy(i: WorkspaceInvoice) {
    try { await navigator.clipboard.writeText(invoiceLink(i.share_token)); setCopied(i.id); setFeedback("Invoice link copied."); }
    catch { setFeedback("Open the invoice and copy the address from your browser."); }
  }
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <h2 className="border-b border-slate-100 px-5 py-4 font-semibold">{title}</h2>
    {feedback && <p role="status" className="px-5 pt-3 text-sm">{feedback}</p>}
    <div className="overflow-x-auto"><table className="w-full min-w-[730px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Invoice</th><th>Client</th>{admin && <th>Created by</th>}<th>Due</th><th>Amount</th><th>Status</th><th className="pr-5 text-right">Actions</th></tr></thead>
      <tbody>{invoices.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-600">No matching invoices.</td></tr>}
      {invoices.map(i => {
        const status = invoiceStatus(i);
        return <tr key={i.id} className="border-t border-slate-100">
          <td className="px-5 py-4 font-semibold">{i.number}</td><td>{i.client_name}</td>{admin && <td>{i.owner_name}</td>}<td>{i.due_date}</td>
          <td>{money(totals(i).total, i.currency)}</td><td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[status]}`}>{status}</span></td>
          <td><div className="flex justify-end gap-1 pr-3">
            {["paid", "sent", "overdue"].includes(status) && <><Link title="Open invoice" to={"/invoice/" + i.share_token} target="_blank" rel="noopener noreferrer" className="rounded p-2 hover:bg-slate-100"><Eye size={16}/></Link>
            <button title="Copy invoice link" onClick={() => copy(i)} className="rounded p-2 hover:bg-slate-100">{copied === i.id ? <Check size={16}/> : <Copy size={16}/>}</button></>}
            {status !== "paid" && <Link title="Edit invoice" className="rounded p-2 hover:bg-slate-100" to={`/${profile.role}/invoices/${i.id}`}><Pencil size={16}/></Link>}
            {admin && ["sent", "overdue"].includes(status) && <button title="Confirm payment" disabled={!!busy} className="rounded p-2 text-emerald-700 hover:bg-emerald-50" onClick={() => act(i,"paid")}><CheckCircle2 size={16}/></button>}
            {status !== "paid" && (admin || status === "draft") && <button title="Delete invoice" disabled={!!busy} className="rounded p-2 text-rose-600 hover:bg-rose-50" onClick={() => act(i,"delete")}><Trash2 size={16}/></button>}
          </div></td>
        </tr>;
      })}</tbody>
    </table></div>
  </section>;
}
export function Invoices() {
  const { profile } = usePortal();
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const read = useWorkspaceData("invoices:" + JSON.stringify([profile.id, filter, query, page]), async () => {
    let request = database().from("invoices").select("*", { count: "exact" });
    const today = new Date().toISOString().slice(0, 10);
    if (filter === "overdue") request = request.or(`status.eq.overdue,and(status.eq.sent,due_date.lt.${today})`);
    else if (filter === "sent") request = request.eq("status", "sent").gte("due_date", today);
    else if (filter !== "all") request = request.eq("status", filter);
    if (query.trim()) {
      const term = query.trim().replace(/[\\%_]/g, "\\$&").replace(/"/g, '\\"');
      const pattern = '"%' + term + '%"';
      request = request.or(["number", "client_name", "client_email"].map(key => key + ".ilike." + pattern).join(","));
    }
    const { data, count, error } = await request.order("created_at", { ascending: false }).order("id").range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;
    return { invoices: data as WorkspaceInvoice[], total: count ?? 0 };
  });
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><h1>Invoices</h1><Link to={`/${profile.role}/invoices/new`} className="btn-primary"><Plus size={16}/>New invoice</Link></div>
    <div className="flex flex-wrap gap-3"><input aria-label="Search invoices" value={query} onChange={e => {setQuery(e.target.value); setPage(0);}} placeholder="Search number or client…" className={field + " max-w-xs"}/>
      <select aria-label="Filter invoices by status" value={filter} onChange={e => {setFilter(e.target.value as typeof filter); setPage(0);}} className={field + " max-w-[170px] capitalize"}>{["all","draft","sent","overdue","paid","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}</select>
    </div>
    {read.data ? <><InvoiceTable invoices={read.data.invoices} title={`${read.data.total} invoice${read.data.total === 1 ? "" : "s"}`} onChange={() => {setPage(0); read.reload();}}/>
      <Pagination page={page} total={read.data.total} move={setPage}/></> : <FetchState error={read.error} retry={read.reload}/>}
  </div>;
}

export function InquiriesAdmin() {
  const { profile } = usePortal();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const read = useWorkspaceData("inquiries:" + JSON.stringify([profile.id, filter, page]), async () => {
    let request = database().from("inquiries").select("*", { count: "exact" });
    if (filter !== "all") request = request.eq("kind", filter);
    const { data, count, error } = await request.order("created_at", { ascending: false }).order("id").range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;
    return { rows: data as Inquiry[], total: count ?? 0 };
  });
  async function triage(inquiry: Inquiry, status: string) {
    setBusy(inquiry.id); setMessage("");
    try {
      const { error } = await database().from("inquiries").update({ status }).eq("id", inquiry.id).eq("status", inquiry.status).select("id").single();
      if (error) throw error;
      read.reload();
    } catch { setMessage("The status could not be saved. Refresh the inbox and try again."); }
    finally { setBusy(""); }
  }
  return <div className="space-y-6"><h1>Inquiries</h1>
    <div className="flex flex-wrap gap-2">{["all","project","visibility","expert"].map(k => <button key={k} aria-pressed={filter === k} onClick={() => {setFilter(k); setPage(0);}}
      className={`rounded-full px-4 py-2 text-sm capitalize ${filter === k ? "bg-ink text-white" : "bg-white shadow-sm"}`}>{k === "expert" ? "Expert applications" : k}</button>)}</div>
    {message && <p role="alert">{message}</p>}
    {!read.data ? <FetchState error={read.error} retry={read.reload}/> : <>
      {read.data.rows.length === 0 && <p className="access-panel">No inquiries in this view.</p>}
      <div className="grid gap-4 lg:grid-cols-2">{read.data.rows.map(q => <article key={q.id} className="access-panel min-w-0">
        <div className="flex justify-between gap-4"><div><h2>{q.name}</h2><a className="break-all text-sm text-brand-700" href={"mailto:" + encodeURIComponent(q.email)}>{q.email}</a></div>
          <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs capitalize">{q.kind}</span></div>
        <dl className="mt-4 space-y-2 text-sm">{Object.entries(q.data).filter(([key, value]) => value && !["name", "email"].includes(key)).map(([key, value]) => <div key={key} className="break-words">
          <dt className="text-xs capitalize text-slate-500">{key.replace(/([A-Z])/g, " $1")}</dt><dd className="whitespace-pre-wrap">{value}</dd></div>)}</dl>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-slate-600"><time dateTime={q.created_at}>{new Date(q.created_at).toLocaleString()}</time>
          <select aria-label={"Status for " + q.name} value={q.status} disabled={!!busy} className="rounded-lg border px-2 py-1" onChange={e => triage(q, e.target.value)}>
            <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></div>
      </article>)}</div>
      <Pagination page={page} total={read.data.total} move={setPage}/>
    </>}
  </div>;
}

type Versioned<T> = T & { updated_at: string };
export function SettingsAdmin() {
  const { profile } = usePortal();
  const read = useWorkspaceData("settings:" + profile.id, async () => {
    const [site, payment] = await Promise.all([
      database().from("site_settings").select("*").eq("id", true).single(),
      database().from("payment_settings").select("*").eq("id", 1).single(),
    ]);
    if (site.error || payment.error) throw site.error || payment.error;
    return { site: site.data as Versioned<SiteSettings>, payment: payment.data as Versioned<PaymentSettings> };
  });
  return <div className="max-w-2xl space-y-6"><h1>Settings</h1>
    {read.data ? <>
      <SettingsForm title="Website details" table="site_settings" initial={read.data.site} fields={[
        { key: "agency_name", title: "Agency name", required: true, maxLength: 100 },
        { key: "contact_email", title: "Public contact email", type: "email", required: true, maxLength: 254 },
      ]}/>
      <SettingsForm title="Invoice payment instructions" table="payment_settings" initial={read.data.payment} fields={[
        { key: "bank_name", title: "Bank name" }, { key: "account_name", title: "Account name" },
        { key: "account_number", title: "Account number" }, { key: "payment_url", title: "Hosted payment link", type: "url" },
      ]}/>
    </> : <FetchState error={read.error} retry={read.reload}/>}
  </div>;
}
type FieldSpec = { key: keyof (PaymentSettings & SiteSettings); title: string; type?: string; required?: boolean; maxLength?: number };
function SettingsForm({ title, table, initial, fields }: { title: string; table: "site_settings" | "payment_settings"; initial: Versioned<SiteSettings | PaymentSettings>; fields: FieldSpec[] }) {
  const [version, setVersion] = useState(initial.updated_at);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setMessage("");
    const form = new FormData(e.currentTarget);
    const values = Object.fromEntries(fields.map(f => [f.key, String(form.get(f.key) || "").trim()]));
    if (table === "payment_settings") {
      const bank = [values.bank_name, values.account_name, values.account_number];
      if (bank.some(Boolean) && !bank.every(Boolean)) { setMessage("Complete all three bank details, or clear all three to remove bank transfers."); return; }
      if (values.payment_url && !/^https:\/\//i.test(values.payment_url)) { setMessage("Use an HTTPS payment link."); return; }
    }
    setBusy(true);
    try {
      const { data, error } = await database().from(table).update(values).eq("id", table === "site_settings" ? true : 1).eq("updated_at", version).select("updated_at").single();
      if (error || !data) throw error;
      setVersion(data.updated_at); setMessage("Changes saved.");
    } catch { setMessage("The changes could not be saved. Reload the settings to check for newer changes."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="access-panel grid gap-4"><h2>{title}</h2>
    {fields.map(f => <label key={f.key}><Label>{f.title}</Label><input name={f.key} type={f.type || "text"} required={f.required} maxLength={f.maxLength}
      defaultValue={String(initial[f.key as keyof typeof initial] || "")} className={field} onChange={() => setMessage("")}/></label>)}
    <button disabled={busy} className="btn-primary w-fit">{busy ? "Saving…" : "Save changes"}</button>
    {message && <p role="status" className="text-sm">{message}</p>}
  </form>;
}
