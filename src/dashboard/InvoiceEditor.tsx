import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { field, Label } from "../components/ui";
import { services } from "../data";
import { currencies, database, money, totals, useWorkspaceData, type InvoiceFields, type LineItem, type WorkspaceInvoice } from "../lib/operations";
import { usePortal } from "./PortalContext";

export function InvoiceEditor() {
  const { id } = useParams();
  const { profile, can } = usePortal();
  const allowed = can("invoices.manage");
  const read = useWorkspaceData(`edit:${profile.id}:${id}:${allowed}`, async () => {
    if (!id || !allowed) return null;
    const { data, error } = await database().from("invoices").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as WorkspaceInvoice | null;
  });
  if (!allowed) return <p>Invoice access is required.</p>;
  if (read.error) return <p role="alert">{read.error} <button onClick={read.reload}>Retry</button></p>;
  if (read.data === undefined) return <p role="status">Loading invoice…</p>;
  if (id && (!read.data || read.data.status === "paid")) return <p>This invoice is unavailable for editing.</p>;
  return <Editor key={id ?? "new"} existing={read.data} workspace={"/" + profile.role} />;
}

function Editor({ existing, workspace }: { existing: WorkspaceInvoice | null; workspace: string }) {
  const nav = useNavigate();
  const [inv, setInv] = useState<InvoiceFields>(existing ?? {
    client_name: "", client_email: "", service: services[0].title, currency: "USD",
    items: [{ description: "", qty: 1, rate: 0 }], tax_rate: 0, discount: 0,
    notes: "Thank you for working with Klexford.", issue_date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
  });
  const t = totals(inv);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const [insertId] = useState(() => crypto.randomUUID());
  const set = <K extends keyof InvoiceFields>(key: K, value: InvoiceFields[K]) => setInv({ ...inv, [key]: value });
  const setItem = (i: number, key: keyof LineItem, value: string) => set("items", inv.items.map((it, j) => j === i ? { ...it, [key]: key === "description" ? value : Number(value) } : it));
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending.current) return;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = submitter?.value === "sent" ? "sent" : "draft";
    pending.current = true;
    setBusy(true);
    setError("");
    const values = {
      client_name: inv.client_name.trim(), client_email: inv.client_email.trim(), service: inv.service, currency: inv.currency,
      items: inv.items.map(item => ({ ...item, description: item.description.trim() })), tax_rate: inv.tax_rate,
      discount: inv.discount, notes: inv.notes.trim(), issue_date: inv.issue_date, due_date: inv.due_date, status,
    };
    try {
      const table = database().from("invoices");
      const query = existing
        ? table.update(values).eq("id", existing.id).eq("updated_at", existing.updated_at)
        : table.insert({ ...values, id: insertId });
      const { data, error } = await query.select("id,share_token").single();
      if (error || !data) throw error;
      nav(status === "sent" ? `/invoice/${data.share_token}?created=1` : `${workspace}/invoices`);
    } catch {
      setError("Unable to save the invoice. Check the fields and your workspace access. If another session saved the invoice, reopen it from the list.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <form className="space-y-6" onSubmit={submit}>
      <Link to={`${workspace}/invoices`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft size={16} />Back to invoices</Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{existing ? `Edit ${existing.number}` : "New Invoice"}</h1>
        <div className="flex flex-wrap gap-3"><button name="status" value="draft" disabled={busy} className="btn-ghost">Save draft</button><button name="status" value="sent" disabled={busy} className="btn-primary">{busy ? "Saving…" : "Save and get invoice link"}</button></div>
      </div>
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
            <h2 className="font-semibold sm:col-span-2">Client</h2>
            <label><Label>Client name</Label><input required maxLength={200} value={inv.client_name} onChange={(e) => set("client_name", e.target.value)} className={field} /></label>
            <label><Label>Client email</Label><input required maxLength={254} type="email" value={inv.client_email} onChange={(e) => set("client_email", e.target.value)} className={field} /></label>
            <label><Label>Service</Label><select value={inv.service} onChange={(e) => set("service", e.target.value)} className={field}>{services.map((s) => <option key={s.slug}>{s.title}</option>)}</select></label>
            <label><Label>Currency</Label><select value={inv.currency} onChange={(e) => set("currency", e.target.value)} className={field}>{currencies.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label><Label>Issue date</Label><input required type="date" value={inv.issue_date} onChange={(e) => set("issue_date", e.target.value)} className={field} /></label>
            <label><Label>Due date</Label><input required type="date" min={inv.issue_date} value={inv.due_date} onChange={(e) => set("due_date", e.target.value)} className={field} /></label>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Line items</h2>
            <div className="space-y-3">
              {inv.items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 items-end gap-3">
                  <label className="col-span-12 sm:col-span-6"><Label>Description</Label><input required maxLength={1000} value={it.description} onChange={(e) => setItem(i, "description", e.target.value)} className={field} /></label>
                  <label className="col-span-4 sm:col-span-2"><Label>Qty</Label><input required type="number" min={1} value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} className={field} /></label>
                  <label className="col-span-5 sm:col-span-3"><Label>Rate</Label><input required type="number" min={0} step="0.01" value={it.rate} onChange={(e) => setItem(i, "rate", e.target.value)} className={field} /></label>
                  <button type="button" aria-label="Remove line item" disabled={inv.items.length === 1} onClick={() => set("items", inv.items.filter((_, j) => j !== i))} className="col-span-3 grid h-[46px] place-items-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30 sm:col-span-1"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <button type="button" disabled={inv.items.length >= 250} onClick={() => set("items", [...inv.items, { description: "", qty: 1, rate: 0 }])} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600"><Plus size={16} />Add item</button>
          </div>
          <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
            <label><Label>Discount ({inv.currency})</Label><input required type="number" min={0} max={t.subtotal} step="0.01" value={inv.discount} onChange={(e) => set("discount", Number(e.target.value))} className={field} /></label>
            <label><Label>Tax / VAT (%)</Label><input required type="number" min={0} max={100} step="0.01" value={inv.tax_rate} onChange={(e) => set("tax_rate", Number(e.target.value))} className={field} /></label>
            <label className="sm:col-span-2"><Label>Notes to client</Label><textarea rows={3} maxLength={12000} value={inv.notes} onChange={(e) => set("notes", e.target.value)} className={field} /></label>
          </div>
        </div>
        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm xl:sticky xl:top-6">
          <h2 className="font-semibold">Summary</h2>
          <p className="mt-1 text-sm text-slate-500">{existing?.number}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(t.subtotal, inv.currency)}</dd></div>
            <div className="flex justify-between"><dt>Discount</dt><dd>-{money(inv.discount, inv.currency)}</dd></div>
            <div className="flex justify-between"><dt>Tax ({inv.tax_rate}%)</dt><dd>{money(t.tax, inv.currency)}</dd></div>
            <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold"><dt>Total</dt><dd className="text-brand-600">{money(t.total, inv.currency)}</dd></div>
          </dl>
          <p className="mt-6 rounded-lg bg-brand-50 p-3 text-xs text-slate-600">Save a draft while preparing the invoice, or generate a private link to share with the client.</p>
        </div>
      </div>
    </form>
  );
}
