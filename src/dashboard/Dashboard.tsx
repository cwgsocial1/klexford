import { useMemo, useState, type FormEvent } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard, FileText, Users, Inbox, Settings as Cog, LogOut, Plus, Trash2, Copy, Eye, Pencil,
  DollarSign, Clock, CheckCircle2, AlertTriangle, Menu, X, CreditCard, Landmark, Printer, ArrowLeft, Check,
} from "lucide-react";
import {
  currentUser, login, logout, useStore, getInvoices, getInvoice, saveInvoice, deleteInvoice, nextInvoiceNumber, totals, money, uid, markPaid,
  getUsers, saveUser, deleteUser, getInquiries, updateInquiry, getSettings, saveSettings,
  type Invoice, type InvoiceStatus, type LineItem, type User, type Role,
} from "../lib/store";
import { services } from "../data";
import { field, Label, Img } from "../components/ui";
import Brand from "../components/Brand";

const CURRENCIES = ["USD", "NGN", "GBP", "EUR", "CAD"];
const statusStyle: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-600", sent: "bg-blue-50 text-blue-600", paid: "bg-emerald-50 text-emerald-600",
  overdue: "bg-rose-50 text-rose-600", cancelled: "bg-slate-100 text-slate-400 line-through",
};
export const Badge = ({ s }: { s: InvoiceStatus }) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[s]}`}>{s}</span>;
const base = (r: Role) => (r === "admin" ? "/admin" : "/expert");

/* ---------- Login ---------- */
export function Login() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const user = useStore(currentUser);
  if (user) return <Navigate to={base(user.role)} replace />;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const u = login(String(d.get("email")), String(d.get("password")));
    u ? nav(base(u.role)) : setErr("Invalid email or password, or account disabled.");
  };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Img src="/images/studio.jpg" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md text-white"><h2 className="text-3xl font-bold">Klexford Team Portal</h2><p className="mt-3 text-white/85">Manage projects, create invoices and receive payments.</p></div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <Brand/>
          <div><h1 className="text-2xl font-bold">Welcome back</h1><p className="text-sm text-slate-500">Sign in as Admin or Expert.</p></div>
          {err && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{err}</p>}
          <label className="block"><Label>Email</Label><input name="email" type="email" required className={field} /></label>
          <label className="block"><Label>Password</Label><input name="password" type="password" required className={field} /></label>
          <button className="btn-primary w-full justify-center">Sign In</button>
          <div className="rounded-lg bg-brand-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-brand-700">Demo accounts</p>
            <p className="mt-1">Admin: admin@klexford.com / admin123</p><p>Expert: expert@klexford.com / expert123</p>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Layout ---------- */
export function DashboardLayout({ role }: { role: Role }) {
  const user = useStore(currentUser);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={base(user.role)} replace />;
  const b = base(role);
  const items = [
    [LayoutDashboard, "Overview", b], [FileText, "Invoices", `${b}/invoices`], [Plus, "New Invoice", `${b}/invoices/new`],
    ...(role === "admin" ? [[Users, "Experts", "/admin/experts"], [Inbox, "Inquiries", "/admin/inquiries"], [Cog, "Payment Settings", "/admin/settings"]] : []),
  ] as [typeof Users, string, string][];
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-ink p-5 text-white transition lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Brand/>
        <p className="mt-1 text-xs uppercase tracking-wider text-white/50">{role} portal</p>
        <nav className="mt-8 space-y-1">
          {items.map(([I, l, to]) => (
            <NavLink key={to} to={to} end onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-brand-500" : "text-white/75 hover:bg-white/10"}`}><I size={18} />{l}</NavLink>
          ))}
        </nav>
        <button onClick={() => { logout(); nav("/login"); }} className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/75 hover:bg-white/10"><LogOut size={18} />Log out</button>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <button aria-label="Toggle workspace menu" aria-expanded={open} className="lg:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          <p className="hidden font-semibold lg:block">{role === "admin" ? "Agency workspace" : "Expert workspace"}</p>
          <div className="flex items-center gap-3"><div className="text-right text-sm"><p className="font-semibold">{user.name}</p><p className="text-xs text-slate-500">{user.specialty}</p></div><span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 font-bold text-white">{user.name[0]}</span></div>
        </header>
        <div className="p-6 lg:p-8"><Outlet /></div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function useMyInvoices() {
  const user = currentUser()!;
  const all = useStore(getInvoices);
  return { user, invoices: user.role === "admin" ? all : all.filter((i) => i.createdBy === user.id) };
}
const payLink = (id: string) => `${window.location.origin}/invoice/${id}`;

/* ---------- Overview ---------- */
export function Overview() {
  const { user, invoices } = useMyInvoices();
  const inquiries = useStore(getInquiries);
  const sum = (f: (i: Invoice) => boolean) => invoices.filter(f).reduce((s, i) => s + totals(i).total, 0);
  const cur = invoices[0]?.currency ?? "USD";
  const stats = [
    [DollarSign, "Paid", money(sum((i) => i.status === "paid"), cur), "bg-emerald-50 text-emerald-600"],
    [Clock, "Outstanding", money(sum((i) => i.status === "sent"), cur), "bg-blue-50 text-blue-600"],
    [AlertTriangle, "Overdue", money(sum((i) => i.status === "overdue"), cur), "bg-rose-50 text-rose-600"],
    user.role === "admin" ? [Inbox, "New inquiries", String(inquiries.filter((q) => q.status === "new").length), "bg-amber-50 text-amber-600"] : [CheckCircle2, "Invoices", String(invoices.length), "bg-amber-50 text-amber-600"],
  ] as [typeof Clock, string, string, string][];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-bold">Overview</h1><Link to={`${base(user.role)}/invoices/new`} className="btn-primary"><Plus size={16} />New Invoice</Link></div>
      <p className="text-xs text-slate-500">Totals shown in mixed currencies are approximate; filter by currency in Invoices for exact figures.</p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([I, l, v, c]) => <div key={l} className="rounded-2xl bg-white p-6 shadow-sm"><span className={`grid h-11 w-11 place-items-center rounded-xl ${c}`}><I size={20} /></span><p className="mt-4 text-sm text-slate-500">{l}</p><p className="text-2xl font-bold">{v}</p></div>)}
      </div>
      <InvoiceTable invoices={invoices.slice(0, 5)} title="Recent invoices" />
    </div>
  );
}

/* ---------- Invoice list ---------- */
function InvoiceTable({ invoices, title }: { invoices: Invoice[]; title: string }) {
  const user = currentUser()!;
  const [copied, setCopied] = useState("");
  const copy = (id: string) => { navigator.clipboard?.writeText(payLink(id)); setCopied(id); setTimeout(() => setCopied(""), 1500); };
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <h2 className="border-b border-slate-100 px-6 py-4 font-semibold">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3">Invoice</th><th>Client</th>{user.role === "admin" && <th>Created by</th>}<th>Due</th><th>Amount</th><th>Status</th><th className="px-6 text-right">Actions</th></tr></thead>
          <tbody>
            {invoices.length === 0 && <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500">No invoices yet.</td></tr>}
            {invoices.map((i) => (
              <tr key={i.id} className="border-t border-slate-100">
                <td className="px-6 py-4 font-semibold">{i.number}</td>
                <td><p>{i.clientName}</p><p className="text-xs text-slate-500">{i.service}</p></td>
                {user.role === "admin" && <td>{i.createdByName}</td>}
                <td>{i.dueDate}</td>
                <td className="font-semibold">{money(totals(i).total, i.currency)}</td>
                <td><Badge s={i.status} /></td>
                <td className="px-6">
                  <div className="flex justify-end gap-1">
                    <Link title="View" to={`/invoice/${i.id}`} target="_blank" className="rounded-lg p-2 hover:bg-slate-100"><Eye size={16} /></Link>
                    <button title="Copy payment link" onClick={() => copy(i.id)} className="rounded-lg p-2 hover:bg-slate-100">{copied === i.id ? <Check size={16} className="text-mint" /> : <Copy size={16} />}</button>
                    {i.status !== "paid" && <Link title="Edit" to={`${base(user.role)}/invoices/${i.id}`} className="rounded-lg p-2 hover:bg-slate-100"><Pencil size={16} /></Link>}
                    {user.role === "admin" && i.status !== "paid" && <button title="Mark paid (manual)" onClick={() => markPaid(i.id, "Manual / Bank transfer")} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"><CheckCircle2 size={16} /></button>}
                    {(user.role === "admin" || i.status === "draft") && <button title="Delete" onClick={() => confirm(`Delete ${i.number}?`) && deleteInvoice(i.id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Invoices() {
  const { user, invoices } = useMyInvoices();
  const [f, setF] = useState<"all" | InvoiceStatus>("all");
  const [q, setQ] = useState("");
  const list = invoices.filter((i) => (f === "all" || i.status === f) && `${i.number} ${i.clientName} ${i.clientEmail}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-bold">Invoices</h1><Link to={`${base(user.role)}/invoices/new`} className="btn-primary"><Plus size={16} />New Invoice</Link></div>
      <div className="flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search number or client…" className={`${field} max-w-xs`} />
        {(["all", "draft", "sent", "overdue", "paid", "cancelled"] as const).map((s) => <button key={s} onClick={() => setF(s)} className={`rounded-full px-4 py-2 text-sm capitalize ${f === s ? "bg-brand-500 text-white" : "bg-white shadow-sm"}`}>{s}</button>)}
      </div>
      <InvoiceTable invoices={list} title={`${list.length} invoice(s)`} />
    </div>
  );
}

/* ---------- Invoice editor ---------- */
export function InvoiceEditor() {
  const { id } = useParams();
  const user = currentUser()!;
  const nav = useNavigate();
  const existing = id ? getInvoice(id) : undefined;
  const today = new Date().toISOString().slice(0, 10);
  const [inv, setInv] = useState<Invoice>(existing ?? {
    id: "inv-" + uid(), number: nextInvoiceNumber(), createdBy: user.id, createdByName: user.name,
    clientName: "", clientEmail: "", service: services[0].title, currency: "USD",
    items: [{ description: "", qty: 1, rate: 0 }], taxRate: 0, discount: 0, notes: "Thank you for working with Klexford.",
    issueDate: today, dueDate: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10), status: "draft",
  });
  const t = useMemo(() => totals(inv), [inv]);
  const set = <K extends keyof Invoice>(k: K, v: Invoice[K]) => setInv({ ...inv, [k]: v });
  const setItem = (i: number, k: keyof LineItem, v: string) => set("items", inv.items.map((it, j) => (j === i ? { ...it, [k]: k === "description" ? v : Number(v) } : it)));
  const save = (status: InvoiceStatus) => {
    if (!inv.clientName || !inv.clientEmail || inv.items.some((i) => !i.description)) return alert("Please fill client details and all item descriptions.");
    saveInvoice({ ...inv, status: inv.status === "overdue" ? "sent" : status });
    status === "sent" ? nav(`/invoice/${inv.id}?created=1`) : nav(`${base(user.role)}/invoices`);
  };
  return (
    <div className="space-y-6">
      <Link to={`${base(user.role)}/invoices`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft size={16} />Back to invoices</Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{existing ? `Edit ${inv.number}` : "New Invoice"}</h1>
        <div className="flex gap-3"><button onClick={() => save("draft")} className="btn-ghost">Save Draft</button><button onClick={() => save("sent")} className="btn-primary">Save &amp; Get Payment Link</button></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
            <h2 className="font-semibold sm:col-span-2">Client</h2>
            <label><Label>Client name</Label><input value={inv.clientName} onChange={(e) => set("clientName", e.target.value)} className={field} /></label>
            <label><Label>Client email</Label><input type="email" value={inv.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} className={field} /></label>
            <label><Label>Service</Label><select value={inv.service} onChange={(e) => set("service", e.target.value)} className={field}>{services.map((s) => <option key={s.slug}>{s.title}</option>)}</select></label>
            <label><Label>Currency</Label><select value={inv.currency} onChange={(e) => set("currency", e.target.value)} className={field}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label><Label>Issue date</Label><input type="date" value={inv.issueDate} onChange={(e) => set("issueDate", e.target.value)} className={field} /></label>
            <label><Label>Due date</Label><input type="date" value={inv.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={field} /></label>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Line items</h2>
            <div className="space-y-3">
              {inv.items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 items-end gap-3">
                  <label className="col-span-12 sm:col-span-6"><Label>Description</Label><input value={it.description} onChange={(e) => setItem(i, "description", e.target.value)} className={field} /></label>
                  <label className="col-span-4 sm:col-span-2"><Label>Qty</Label><input type="number" min={1} value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} className={field} /></label>
                  <label className="col-span-5 sm:col-span-3"><Label>Rate</Label><input type="number" min={0} step="0.01" value={it.rate} onChange={(e) => setItem(i, "rate", e.target.value)} className={field} /></label>
                  <button disabled={inv.items.length === 1} onClick={() => set("items", inv.items.filter((_, j) => j !== i))} className="col-span-3 grid h-[46px] place-items-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30 sm:col-span-1"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => set("items", [...inv.items, { description: "", qty: 1, rate: 0 }])} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600"><Plus size={16} />Add item</button>
          </div>
          <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
            <label><Label>Discount ({inv.currency})</Label><input type="number" min={0} value={inv.discount} onChange={(e) => set("discount", Number(e.target.value))} className={field} /></label>
            <label><Label>Tax / VAT (%)</Label><input type="number" min={0} value={inv.taxRate} onChange={(e) => set("taxRate", Number(e.target.value))} className={field} /></label>
            <label className="sm:col-span-2"><Label>Notes to client</Label><textarea rows={3} value={inv.notes} onChange={(e) => set("notes", e.target.value)} className={field} /></label>
          </div>
        </div>
        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm xl:sticky xl:top-6">
          <h2 className="font-semibold">Summary</h2>
          <p className="mt-1 text-sm text-slate-500">{inv.number}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(t.subtotal, inv.currency)}</dd></div>
            <div className="flex justify-between"><dt>Discount</dt><dd>-{money(inv.discount, inv.currency)}</dd></div>
            <div className="flex justify-between"><dt>Tax ({inv.taxRate}%)</dt><dd>{money(t.tax, inv.currency)}</dd></div>
            <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold"><dt>Total</dt><dd className="text-brand-600">{money(t.total, inv.currency)}</dd></div>
          </dl>
          <p className="mt-6 rounded-lg bg-brand-50 p-3 text-xs text-slate-600">After saving, copy the payment link and send it to your client. They can pay by card or bank transfer.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Public invoice + payment page ---------- */
export function InvoiceView() {
  const { id } = useParams();
  const invoices = useStore(getInvoices);
  const inv = invoices.find((i) => i.id === id);
  const settings = getSettings();
  const [method, setMethod] = useState<"card" | "bank" | null>(null);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const created = new URLSearchParams(location.search).get("created");
  const me = currentUser();
  if (!inv) return <div className="grid min-h-screen place-items-center"><p>Invoice not found. <Link className="text-brand-600" to="/">Go home</Link></p></div>;
  const t = totals(inv);
  const payCard = () => {
    // INTEGRATION POINT: replace with Paystack Inline / Stripe Checkout / Flutterwave.
    // On the provider's success callback, verify on your server, then mark the invoice paid.
    if (settings.stripeLink) { window.open(settings.stripeLink, "_blank"); return; }
    setPaying(true);
    setTimeout(() => { markPaid(inv.id, "Card (demo)"); setPaying(false); setMethod(null); }, 1500);
  };
  return (
    <div className="min-h-screen bg-slate-50 py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4">
        {created && me && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 print:hidden">
            <p className="font-semibold text-emerald-700">Invoice saved. Send this payment link to your client:</p>
            <div className="mt-3 flex gap-2"><input readOnly value={payLink(inv.id)} className={field} /><button onClick={() => { navigator.clipboard?.writeText(payLink(inv.id)); setCopied(true); }} className="btn-primary">{copied ? "Copied" : "Copy"}</button></div>
            <a className="mt-3 inline-block text-sm font-semibold text-emerald-700" href={`mailto:${inv.clientEmail}?subject=Invoice ${inv.number} from Klexford&body=Hello ${inv.clientName},%0D%0A%0D%0APlease find your invoice ${inv.number} for ${money(t.total, inv.currency)} here:%0D%0A${payLink(inv.id)}%0D%0A%0D%0AThank you,%0D%0A${inv.createdByName}`}>Email it to {inv.clientEmail} →</a>
          </div>
        )}
        <div className="mb-4 flex justify-between print:hidden">
          {me ? <Link to={`${base(me.role)}/invoices`} className="inline-flex items-center gap-1 text-sm text-slate-500"><ArrowLeft size={16} />Dashboard</Link> : <span />}
          <button onClick={() => window.print()} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><Printer size={16} />Print / Save PDF</button>
        </div>
        <div className="overflow-hidden rounded-3xl bg-white shadow-card print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-6 bg-ink p-8 text-white">
            <div><Brand/><p className="mt-2 text-sm text-white/80">Publishing, Digital & Growth Services</p></div>
            <div className="text-right"><p className="text-sm uppercase tracking-wider text-white/70">Invoice</p><h1 className="text-4xl">{inv.number}</h1><span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-brand-600">{inv.status}</span></div>
          </div>
          <div className="grid gap-6 p-8 sm:grid-cols-3">
            <div><p className="text-xs uppercase text-slate-400">Billed to</p><p className="mt-1 font-semibold">{inv.clientName}</p><p className="text-sm text-slate-500">{inv.clientEmail}</p></div>
            <div><p className="text-xs uppercase text-slate-400">From</p><p className="mt-1 font-semibold">{inv.createdByName}</p><p className="text-sm text-slate-500">{inv.service}</p></div>
            <div><p className="text-xs uppercase text-slate-400">Dates</p><p className="mt-1 text-sm">Issued: {inv.issueDate}</p><p className="text-sm">Due: <span className="font-semibold">{inv.dueDate}</span></p></div>
          </div>
          <div className="px-8">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-400"><tr><th className="py-3">Description</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th></tr></thead>
              <tbody>{inv.items.map((it, k) => <tr key={k} className="border-b border-slate-100"><td className="py-3">{it.description}</td><td className="text-right">{it.qty}</td><td className="text-right">{money(it.rate, inv.currency)}</td><td className="text-right font-medium">{money(it.qty * it.rate, inv.currency)}</td></tr>)}</tbody>
            </table>
            <dl className="ml-auto mt-6 max-w-xs space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(t.subtotal, inv.currency)}</dd></div>
              {inv.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>-{money(inv.discount, inv.currency)}</dd></div>}
              {inv.taxRate > 0 && <div className="flex justify-between"><dt>Tax ({inv.taxRate}%)</dt><dd>{money(t.tax, inv.currency)}</dd></div>}
              <div className="flex justify-between border-t border-slate-200 pt-3 text-xl font-bold"><dt>Total due</dt><dd className="text-brand-600">{money(t.total, inv.currency)}</dd></div>
            </dl>
          </div>
          {inv.notes && <p className="mx-8 mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{inv.notes}</p>}
          <div className="p-8 print:hidden">
            {inv.status === "paid" ? (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={40} /><p className="mt-2 text-lg font-semibold text-emerald-700">Paid — thank you!</p><p className="text-sm text-slate-600">Paid on {inv.paidAt} via {inv.paymentMethod} · Ref {inv.paymentRef}</p></div>
            ) : inv.status === "cancelled" || inv.status === "draft" ? (
              <p className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-500">This invoice is not open for payment.</p>
            ) : (<>
              <h3 className="font-semibold">Pay this invoice</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <button onClick={() => setMethod("card")} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left ${method === "card" ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}><CreditCard className="text-brand-500" /><div><p className="font-semibold">Pay with card</p><p className="text-xs text-slate-500">Visa, Mastercard, Verve</p></div></button>
                <button onClick={() => setMethod("bank")} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left ${method === "bank" ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}><Landmark className="text-brand-500" /><div><p className="font-semibold">Bank transfer</p><p className="text-xs text-slate-500">Pay directly to our account</p></div></button>
              </div>
              {method === "card" && <button disabled={paying} onClick={payCard} className="btn-primary mt-5 w-full justify-center">{paying ? "Processing…" : `Pay ${money(t.total, inv.currency)}`}</button>}
              {method === "bank" && (
                <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm">
                  <p><span className="text-slate-500">Bank:</span> <b>{settings.bankName}</b></p>
                  <p><span className="text-slate-500">Account name:</span> <b>{settings.accountName}</b></p>
                  <p><span className="text-slate-500">Account number:</span> <b>{settings.accountNumber}</b></p>
                  <p><span className="text-slate-500">Reference:</span> <b>{inv.number}</b></p>
                  <p className="mt-3 text-xs text-slate-500">Your invoice will be marked paid once Klexford confirms the transfer.</p>
                </div>
              )}
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Admin: experts ---------- */
export function ExpertsAdmin() {
  const users = useStore(getUsers);
  const invoices = useStore(getInvoices);
  const [show, setShow] = useState(false);
  const add = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const d = new FormData(e.currentTarget);
    const email = String(d.get("email"));
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return alert("Email already exists.");
    saveUser({ id: "u-" + uid(), name: String(d.get("name")), email, password: String(d.get("password")), role: d.get("role") as Role, specialty: String(d.get("specialty")), active: true });
    setShow(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Experts &amp; Team</h1><button onClick={() => setShow(!show)} className="btn-primary"><Plus size={16} />Add Account</button></div>
      {show && (
        <form onSubmit={add} className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-3">
          <input name="name" required placeholder="Full name" className={field} />
          <input name="email" required type="email" placeholder="Email" className={field} />
          <input name="password" required minLength={6} placeholder="Temporary password" className={field} />
          <select name="specialty" className={field}>{services.map((s) => <option key={s.slug}>{s.title}</option>)}</select>
          <select name="role" className={field}><option value="expert">Expert</option><option value="admin">Admin</option></select>
          <button className="btn-primary justify-center">Create</button>
        </form>
      )}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3">Name</th><th>Role</th><th>Specialty</th><th>Invoices</th><th>Status</th><th className="px-6 text-right">Actions</th></tr></thead>
          <tbody>{users.map((u: User) => (
            <tr key={u.id} className="border-t border-slate-100">
              <td className="px-6 py-4"><p className="font-semibold">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></td>
              <td className="capitalize">{u.role}</td><td>{u.specialty}</td>
              <td>{invoices.filter((i) => i.createdBy === u.id).length}</td>
              <td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{u.active ? "Active" : "Disabled"}</span></td>
              <td className="px-6 text-right">{u.id !== "u-admin" && (<>
                <button onClick={() => saveUser({ ...u, active: !u.active })} className="mr-2 text-xs font-semibold text-brand-600">{u.active ? "Disable" : "Enable"}</button>
                <button onClick={() => confirm(`Delete ${u.name}?`) && deleteUser(u.id)} className="text-xs font-semibold text-rose-500">Delete</button>
              </>)}</td>
            </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Admin: inquiries ---------- */
export function InquiriesAdmin() {
  const list = useStore(getInquiries);
  const [f, setF] = useState("all");
  const shown = list.filter((q) => f === "all" || q.kind === f);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inquiries</h1>
      <div className="flex gap-2">{["all", "project", "visibility", "expert"].map((k) => <button key={k} onClick={() => setF(k)} className={`rounded-full px-4 py-2 text-sm capitalize ${f === k ? "bg-brand-500 text-white" : "bg-white shadow-sm"}`}>{k === "expert" ? "Expert applications" : k}</button>)}</div>
      {shown.length === 0 && <p className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">No inquiries yet. Submissions from Start a Project, Visibility Check and Become an Expert appear here.</p>}
      <div className="grid gap-4 lg:grid-cols-2">{shown.map((q) => (
        <div key={q.id} className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between"><div><p className="font-semibold">{q.name}</p><a href={`mailto:${q.email}`} className="text-sm text-brand-600">{q.email}</a></div><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold capitalize text-brand-600">{q.kind}</span></div>
          <dl className="mt-4 space-y-1 text-sm">{Object.entries(q.data).filter(([k]) => !["name", "email"].includes(k)).map(([k, v]) => v && <div key={k}><dt className="inline capitalize text-slate-500">{k}: </dt><dd className="inline">{v}</dd></div>)}</dl>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span>{new Date(q.createdAt).toLocaleString()}</span>
            <select value={q.status} onChange={(e) => updateInquiry(q.id, e.target.value as typeof q.status)} className="rounded-lg border border-slate-200 px-2 py-1"><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select>
          </div>
        </div>))}</div>
    </div>
  );
}

/* ---------- Admin: payment settings ---------- */
export function SettingsAdmin() {
  const [s, setS] = useState(getSettings());
  const [saved, setSaved] = useState(false);
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Payment Settings</h1>
      <form onSubmit={(e) => { e.preventDefault(); saveSettings(s); setSaved(true); }} className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Bank transfer details (shown on invoices)</h2>
        {(["bankName", "accountName", "accountNumber"] as const).map((k) => <label key={k}><Label>{k.replace(/([A-Z])/g, " $1")}</Label><input value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} className={field} /></label>)}
        <h2 className="mt-4 font-semibold">Card payments</h2>
        <label><Label>Stripe / Paystack payment link (optional)</Label><input value={s.stripeLink} onChange={(e) => setS({ ...s, stripeLink: e.target.value })} placeholder="https://paystack.com/pay/klexford" className={field} /></label>
        <label><Label>Paystack public key (for future inline checkout)</Label><input value={s.paystackKey} onChange={(e) => setS({ ...s, paystackKey: e.target.value })} placeholder="pk_live_…" className={field} /></label>
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">Without a payment link, "Pay with card" runs in demo mode and marks the invoice paid instantly. Connect a real gateway and a backend before accepting live payments.</p>
        <button className="btn-primary w-fit">{saved ? "Saved ✓" : "Save Settings"}</button>
      </form>
    </div>
  );
}
