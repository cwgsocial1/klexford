import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Coins, CreditCard, Landmark, Printer } from "lucide-react";
import Brand from "../components/Brand";
import { field } from "../components/ui";
import { database, invoiceLink, invoiceStatus, money, paymentLink, totals, useWorkspaceData, type Invoice, type PaymentSettings } from "../lib/operations";

function PaymentMethods({ invoice, settings }: { invoice: Invoice; settings: PaymentSettings }) {
  const bank = settings.bank_name && settings.account_name && settings.account_number;
  const crypto = settings.crypto_coin && settings.crypto_network && settings.crypto_address;
  const checkout = paymentLink(settings.payment_url);
  const card = "min-w-0 break-inside-avoid rounded-xl border border-slate-200 p-5 text-sm";
  const title = "flex items-center gap-2 text-base font-semibold";
  const details = "mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 [&>dt]:text-slate-600 [&>dd]:font-medium [&>dd]:[overflow-wrap:anywhere]";
  const note = "mt-3 whitespace-pre-wrap text-sm text-slate-600 [overflow-wrap:anywhere]";

  return <section className="space-y-3" aria-labelledby="invoice-payment-title">
    <h2 id="invoice-payment-title" className="text-lg font-semibold">Payment methods</h2>
    {bank && <section className={card}>
      <h3 className={title}><Landmark size={18} aria-hidden="true"/>Bank transfer</h3>
      <dl className={details}>
        {settings.bank_currency && <><dt>Bank currency</dt><dd>{settings.bank_currency}</dd></>}
        <dt>Bank</dt><dd>{settings.bank_name}</dd>
        <dt>Account name</dt><dd>{settings.account_name}</dd>
        <dt>Account number</dt><dd className="select-all font-mono">{settings.account_number}</dd>
        <dt>Transfer reference</dt><dd>{invoice.number}</dd>
      </dl>
      {settings.bank_currency && settings.bank_currency !== invoice.currency &&
        <p className={note}>Confirm the transfer amount in {settings.bank_currency} with your project lead before paying.</p>}
      {settings.bank_instructions && <p className={note}>{settings.bank_instructions}</p>}
    </section>}
    {crypto && <section className={card}>
      <h3 className={title}><Coins size={18} aria-hidden="true"/>Crypto payment</h3>
      <dl className={details}>
        <dt>Coin</dt><dd>{settings.crypto_coin}</dd>
        <dt>Network</dt><dd>{settings.crypto_network}</dd>
        <dt>Wallet address</dt><dd dir="ltr" className="select-all font-mono">{settings.crypto_address}</dd>
      </dl>
      <p className={note}>Confirm the amount in {settings.crypto_coin} with your project lead before sending.</p>
      {settings.crypto_instructions && <p className={note}>{settings.crypto_instructions}</p>}
    </section>}
    {checkout && <section className={card}>
      <h3 className={title}><CreditCard size={18} aria-hidden="true"/>Payment link</h3>
      <a href={checkout} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 print:hidden">
        Open payment provider <ArrowUpRight size={16} aria-hidden="true"/>
      </a>
      <p className="mt-2 hidden [overflow-wrap:anywhere] print:block">{checkout}</p>
    </section>}
    <p className="text-sm text-slate-600">{bank || crypto || checkout
      ? "Klexford will update this invoice when payment is confirmed."
      : "Please contact your Klexford project lead for payment instructions."}</p>
  </section>;
}

export function InvoiceView() {
  const { id = "" } = useParams();
  const [search] = useSearchParams();
  const [copied, setCopied] = useState("");
  const result = useWorkspaceData("shared:" + id, async () => {
    if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)) return null;
    const { data, error } = await database().rpc("get_shared_invoice", { token: id });
    if (error) throw error;
    return data as { invoice: Invoice; settings: PaymentSettings } | null;
  });
  if (!result.data) return <main className="grid min-h-screen place-content-center gap-3 p-6 text-center">
    {result.error ? <><p role="alert">Unable to load this invoice.</p><button className="btn-ghost" onClick={result.reload}>Retry</button></> :
      result.data === null ? <p>This invoice link is unavailable.</p> : <p role="status">Loading invoice…</p>}
    <Link to="/" className="text-brand-600">Go home</Link>
  </main>;
  const { invoice: inv, settings } = result.data;
  const t = totals(inv);
  const status = invoiceStatus(inv);
  const link = invoiceLink(id);
  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied("Copied"); }
    catch { setCopied("Select the link to copy it."); }
  }
  return (
    <main className="min-h-screen bg-slate-50 py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4">
        {search.has("created") && <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 print:hidden">
          <h2 className="font-semibold text-emerald-700">Invoice link ready to share</h2>
          <div className="mt-3 flex gap-2"><input aria-label="Private invoice link" readOnly onFocus={e => e.target.select()} value={link} className={field} /><button onClick={copy} className="btn-primary">Copy</button></div>
          {copied && <p role="status" className="text-sm">{copied}</p>}
          <a className="mt-3 inline-block text-sm font-semibold text-emerald-700" href={`mailto:${encodeURIComponent(inv.client_email)}?subject=${encodeURIComponent("Invoice " + inv.number + " from Klexford")}&body=${encodeURIComponent("Hello " + inv.client_name + ",\n\nYour invoice is available here: " + link)}`}>Email to {inv.client_email}</a>
        </section>}
        <div className="mb-4 flex justify-between print:hidden">
          <Link to={search.has("created") ? "/login" : "/"} className="text-sm text-slate-600">{search.has("created") ? "Return to workspace" : "Klexford home"}</Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1 text-sm text-slate-600"><Printer size={16} />Print / Save PDF</button>
        </div>
        <div className="overflow-hidden rounded-3xl bg-white shadow-card print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-6 bg-ink p-8 text-white">
            <div><Brand/><p className="mt-2 text-sm text-white/80">Publishing, Digital & Growth Services</p></div>
            <div className="text-right"><p className="text-sm uppercase tracking-wider text-white/70">Invoice</p><h1 className="text-4xl">{inv.number}</h1><span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-brand-600">{status}</span></div>
          </div>
          <div className="grid gap-6 p-8 sm:grid-cols-3">
            <div><p className="text-xs uppercase text-slate-400">Billed to</p><p className="mt-1 font-semibold">{inv.client_name}</p><p className="text-sm text-slate-500">{inv.client_email}</p></div>
            <div><p className="text-xs uppercase text-slate-400">From</p><p className="mt-1 font-semibold">{inv.owner_name}</p><p className="text-sm text-slate-500">{inv.service}</p></div>
            <div><p className="text-xs uppercase text-slate-400">Dates</p><p className="mt-1 text-sm">Issued: {inv.issue_date}</p><p className="text-sm">Due: <span className="font-semibold">{inv.due_date}</span></p></div>
          </div>
          <div className="px-8">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-400"><tr><th className="py-3">Description</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th></tr></thead>
              <tbody>{inv.items.map((it, k) => <tr key={k} className="border-b border-slate-100"><td className="py-3">{it.description}</td><td className="text-right">{it.qty}</td><td className="text-right">{money(it.rate, inv.currency)}</td><td className="text-right font-medium">{money(it.qty * it.rate, inv.currency)}</td></tr>)}</tbody>
            </table>
            <dl className="ml-auto mt-6 max-w-xs space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(t.subtotal, inv.currency)}</dd></div>
              {inv.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>-{money(inv.discount, inv.currency)}</dd></div>}
              {inv.tax_rate > 0 && <div className="flex justify-between"><dt>Tax ({inv.tax_rate}%)</dt><dd>{money(t.tax, inv.currency)}</dd></div>}
              <div className="flex justify-between gap-2 border-t border-slate-200 pt-3 text-xl font-bold"><dt>Invoice total</dt><dd className="text-right text-brand-600">{money(t.total, inv.currency, "code")}</dd></div>
            </dl>
          </div>
          {inv.notes && <p className="mx-8 mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{inv.notes}</p>}
          <div className="p-5 sm:p-8">
            {inv.status === "paid" ? (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={40} /><p className="mt-2 text-lg font-semibold text-emerald-700">Paid — thank you!</p><p className="text-sm text-slate-600">{inv.paid_at && `Payment recorded on ${new Date(inv.paid_at).toLocaleDateString()}.`}</p></div>
            ) : inv.status === "cancelled" || inv.status === "draft" ? (
              <p className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-500">This invoice is not open for payment.</p>
            ) : (
              <PaymentMethods invoice={inv} settings={settings}/>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
