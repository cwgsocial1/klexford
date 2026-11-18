/**
 * Demo data layer using localStorage.
 * Replace these functions with real API calls (e.g. Supabase, Firebase, or your own backend)
 * before going live. Passwords here are for demo only — never store real passwords in the browser.
 */
import { useEffect, useState } from "react";

export type Role = "admin" | "expert";
export interface User { id: string; name: string; email: string; password: string; role: Role; specialty: string; active: boolean; }
export interface LineItem { description: string; qty: number; rate: number; }
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export interface Invoice {
  id: string; number: string; createdBy: string; createdByName: string;
  clientName: string; clientEmail: string; service: string;
  currency: string; items: LineItem[]; taxRate: number; discount: number;
  notes: string; issueDate: string; dueDate: string; status: InvoiceStatus;
  paidAt?: string; paymentMethod?: string; paymentRef?: string;
}
export interface Inquiry { id: string; kind: "project" | "visibility" | "expert"; name: string; email: string; data: Record<string, string>; createdAt: string; status: "new" | "contacted" | "closed"; }

const K = { users: "kx_users", invoices: "kx_invoices", inquiries: "kx_inquiries", session: "kx_session", settings: "kx_settings" };
const read = <T,>(k: string, fallback: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; } };
const write = (k: string, v: unknown) => { localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new Event("kx-store")); };
export const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

const seedUsers: User[] = [
  { id: "u-admin", name: "Klexford Admin", email: "admin@klexford.com", password: "admin123", role: "admin", specialty: "Operations", active: true },
  { id: "u-exp1", name: "Demo Expert", email: "expert@klexford.com", password: "expert123", role: "expert", specialty: "Book Marketing", active: true },
];
const seedInvoices: Invoice[] = [
  { id: "inv-demo1", number: "KLX-1001", createdBy: "u-exp1", createdByName: "Demo Expert", clientName: "Jane Author", clientEmail: "jane@example.com",
    service: "Book & Author Services", currency: "USD", items: [{ description: "Book launch campaign plan", qty: 1, rate: 450 }, { description: "Promotional graphics set", qty: 6, rate: 25 }],
    taxRate: 0, discount: 0, notes: "Thank you for choosing Klexford.", issueDate: today(), dueDate: plusDays(14), status: "sent" },
  { id: "inv-demo2", number: "KLX-1002", createdBy: "u-admin", createdByName: "Klexford Admin", clientName: "Sparkle Cleaners", clientEmail: "hello@sparkle.example",
    service: "CRM & Business Automation", currency: "USD", items: [{ description: "GoHighLevel pipeline & booking setup", qty: 1, rate: 800 }],
    taxRate: 0, discount: 50, notes: "", issueDate: plusDays(-20), dueDate: plusDays(-6), status: "paid", paidAt: plusDays(-8), paymentMethod: "Card", paymentRef: "DEMO-PAY-1" },
];

export function init() {
  if (!localStorage.getItem(K.users)) write(K.users, seedUsers);
  if (!localStorage.getItem(K.invoices)) write(K.invoices, seedInvoices);
  if (!localStorage.getItem(K.inquiries)) write(K.inquiries, []);
}

/* Users */
export const getUsers = () => read<User[]>(K.users, []);
export const saveUser = (u: User) => { const all = getUsers(); const i = all.findIndex((x) => x.id === u.id); i >= 0 ? (all[i] = u) : all.push(u); write(K.users, all); };
export const deleteUser = (id: string) => write(K.users, getUsers().filter((u) => u.id !== id));

/* Session */
export const login = (email: string, password: string): User | null => {
  const u = getUsers().find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password && x.active);
  if (u) write(K.session, u.id);
  return u ?? null;
};
export const logout = () => { localStorage.removeItem(K.session); window.dispatchEvent(new Event("kx-store")); };
export const currentUser = (): User | null => { const id = read<string | null>(K.session, null); return getUsers().find((u) => u.id === id) ?? null; };

/* Invoices */
export const getInvoices = () => read<Invoice[]>(K.invoices, []).map(withOverdue);
export const getInvoice = (id: string) => getInvoices().find((i) => i.id === id);
export const saveInvoice = (inv: Invoice) => { const all = read<Invoice[]>(K.invoices, []); const i = all.findIndex((x) => x.id === inv.id); i >= 0 ? (all[i] = inv) : all.unshift(inv); write(K.invoices, all); };
export const deleteInvoice = (id: string) => write(K.invoices, read<Invoice[]>(K.invoices, []).filter((i) => i.id !== id));
export const nextInvoiceNumber = () => { const nums = read<Invoice[]>(K.invoices, []).map((i) => parseInt(i.number.split("-")[1] || "1000")); return `KLX-${Math.max(1000, ...nums) + 1}`; };
function withOverdue(i: Invoice): Invoice { return i.status === "sent" && i.dueDate < today() ? { ...i, status: "overdue" } : i; }
export const totals = (i: Pick<Invoice, "items" | "taxRate" | "discount">) => {
  const subtotal = i.items.reduce((s, it) => s + it.qty * it.rate, 0);
  const tax = ((subtotal - i.discount) * i.taxRate) / 100;
  return { subtotal, tax, total: Math.max(0, subtotal - i.discount + tax) };
};
export const money = (n: number, c: string) => new Intl.NumberFormat("en", { style: "currency", currency: c }).format(n);
export const markPaid = (id: string, method: string) => { const inv = read<Invoice[]>(K.invoices, []).find((i) => i.id === id); if (inv) saveInvoice({ ...inv, status: "paid", paidAt: today(), paymentMethod: method, paymentRef: "KLX-" + uid().toUpperCase() }); };

/* Inquiries */
export const getInquiries = () => read<Inquiry[]>(K.inquiries, []);
export const addInquiry = (q: Omit<Inquiry, "id" | "createdAt" | "status">) => write(K.inquiries, [{ ...q, id: uid(), createdAt: new Date().toISOString(), status: "new" }, ...getInquiries()]);
export const updateInquiry = (id: string, status: Inquiry["status"]) => write(K.inquiries, getInquiries().map((q) => (q.id === id ? { ...q, status } : q)));

/* Payment settings (bank details shown on invoices) */
export interface Settings { bankName: string; accountName: string; accountNumber: string; paystackKey: string; stripeLink: string; }
export const getSettings = () => read<Settings>(K.settings, { bankName: "Your Bank", accountName: "Klexford Ltd", accountNumber: "0000000000", paystackKey: "", stripeLink: "" });
export const saveSettings = (s: Settings) => write(K.settings, s);

/** Re-render components whenever the store changes. */
export function useStore<T>(fn: () => T): T {
  const [v, setV] = useState(fn);
  useEffect(() => { const h = () => setV(fn()); window.addEventListener("kx-store", h); window.addEventListener("storage", h); return () => { window.removeEventListener("kx-store", h); window.removeEventListener("storage", h); }; }, []); // eslint-disable-line
  return v;
}
