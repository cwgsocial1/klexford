import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export interface LineItem { description: string; qty: number; rate: number }
export interface InvoiceFields {
  client_name: string; client_email: string; service: string; currency: string;
  items: LineItem[]; tax_rate: number; discount: number; notes: string; issue_date: string; due_date: string;
}
export interface Invoice extends InvoiceFields {
  id: string; number: string; owner_name: string; status: InvoiceStatus; paid_at: string | null;
}
export interface WorkspaceInvoice extends Invoice { share_token: string; updated_at: string }
export interface Inquiry {
  id: string; kind: "project" | "visibility" | "expert"; name: string; email: string;
  data: Record<string, string>; created_at: string; status: "new" | "contacted" | "closed";
}
export interface PaymentSettings { bank_name: string; account_name: string; account_number: string; payment_url: string }
export interface SiteSettings { agency_name: string; contact_email: string }
export const currencies = ["USD", "NGN", "GBP", "EUR", "CAD"];
export function totals(i: InvoiceFields) {
  const subtotal = i.items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const taxable = Math.max(0, subtotal - i.discount);
  const tax = taxable * i.tax_rate / 100;
  return { subtotal, tax, total: taxable + tax };
}
export const money = (value: number, currency: string) => new Intl.NumberFormat("en", { style: "currency", currency }).format(value);
export const invoiceStatus = (invoice: Invoice) => invoice.status === "sent" && invoice.due_date < new Date().toISOString().slice(0, 10) ? "overdue" : invoice.status;
export const invoiceLink = (token: string) => new URL("/invoice/" + token, window.location.origin).href;
export function database() {
  if (!supabase) throw new Error("Supabase is unavailable.");
  return supabase;
}

// Include identifiers and permissions in the key so an old response cannot
// appear after a route change. Reloads use a new revision after mutations.
export function useWorkspaceData<T>(key: string, load: () => Promise<T>) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; revision: number; data?: T; error?: string }>();
  useEffect(() => {
    let current = true;
    load().then(
      data => { if (current) setResult({ key, revision, data }); },
      () => { if (current) setResult({ key, revision, error: "Unable to load this information. Check your connection and workspace access." }); },
    );
    return () => { current = false; };
  }, [key, revision]);
  return { ...(result?.key === key && result.revision === revision ? result : {}), reload: () => setRevision(n => n + 1) };
}
