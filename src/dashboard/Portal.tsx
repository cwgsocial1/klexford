import { useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Settings,
  Users,
  X,
} from "lucide-react";
import Brand from "../components/Brand";
import { field, Label } from "../components/ui";
import { supabase } from "../lib/supabase";
import { useAuth, usePortal, type Permission, type Role } from "./PortalContext";
import "./portal.css";

function AccessPage({ children }: { children: ReactNode }) {
  return (
    <main className="portal-access">
      <div className="portal-access-inner">
        <Brand />
        {children}
      </div>
    </main>
  );
}
function Unconfigured() {
  return (
    <AccessPage>
      <h1>Team workspace</h1>
      <p>The workspace is awaiting its Supabase connection. Once connected, your team can sign in here.</p>
      <Link className="line-link" to="/">
        Return to the website
      </Link>
    </AccessPage>
  );
}
function Loading() {
  return (
    <AccessPage>
      <p role="status">Opening your workspace…</p>
    </AccessPage>
  );
}
function AccessIssue() {
  const auth = useAuth();
  return (
    <AccessPage>
      <h1>Workspace access</h1>
      <p>{auth.error || "An administrator needs to enable workspace access for this account."}</p>
      <button className="btn-primary" onClick={auth.reload}>
        Check access
      </button>
      <button className="line-link" onClick={() => void supabase?.auth.signOut()}>
        Sign out
      </button>
    </AccessPage>
  );
}

export function Login() {
  const auth = useAuth();
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const location = useLocation();
  if (!supabase) return <Unconfigured />;
  if (auth.loading) return <Loading />;
  if (auth.user && (!auth.profile?.active || auth.error)) return <AccessIssue />;
  if (auth.profile?.active) {
    const base = "/" + auth.profile.role;
    const target = location.state?.from;
    return (
      <Navigate
        replace
        to={typeof target === "string" && (target === base || target.startsWith(base + "/")) ? target : base}
      />
    );
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const email = String(data.get("email")).trim();
      const result = reset
        ? await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "/account/password",
          })
        : await supabase.auth.signInWithPassword({ email, password: String(data.get("password")) });
      if (result.error)
        setMessage(
          reset
            ? "The reset request failed. Please try again."
            : "Sign-in failed. Check your email and password.",
        );
      else if (reset) setMessage("If your account exists, a password reset link is on its way.");
    } catch {
      setMessage("Could not reach the sign-in service. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AccessPage>
      <p className="eyebrow">Team workspace</p>
      <h1>{reset ? "Reset your password" : "Welcome back."}</h1>
      <p>{reset ? "Enter the email you use for Klexford." : "Sign in to your admin or expert workspace."}</p>
      <form onSubmit={submit}>
        <label>
          <Label>Email</Label>
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
        {!reset && (
          <label>
            <Label>Password</Label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={field}
            />
          </label>
        )}
        {message && <p role="status">{message}</p>}
        <button disabled={busy} className="btn-primary">
          {busy ? "Please wait…" : reset ? "Send reset link" : "Sign in"} <ArrowRight size={16} />
        </button>
      </form>
      <button
        className="line-link"
        onClick={() => {
          setReset(!reset);
          setMessage("");
        }}
      >
        {reset ? "Back to sign in" : "Forgot your password?"}
      </button>
    </AccessPage>
  );
}

export function SetPassword() {
  const auth = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (!supabase) return <Unconfigured />;
  if (done) return <Navigate to="/login" replace />;
  if (auth.loading) return <Loading />;
  if (!auth.user)
    return (
      <AccessPage>
        <h1>Open your email link</h1>
        <p>Use the latest invitation or password reset email to set your password.</p>
        <Link to="/login" className="line-link">
          Go to sign in
        </Link>
      </AccessPage>
    );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    const values = new FormData(event.currentTarget);
    if (values.get("password") !== values.get("confirm")) {
      setMessage("The passwords must match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: String(values.get("password")) });
      if (error) setMessage(error.message);
      else setDone(true);
    } catch {
      setMessage("Could not update your password. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AccessPage>
      <h1>Set your password</h1>
      <form onSubmit={submit}>
        {[
          ["password", "New password"],
          ["confirm", "Confirm password"],
        ].map(([key, title]) => (
          <label key={key}>
            <Label>{title}</Label>
            <input
              className={field}
              type="password"
              name={key}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
        ))}
        {message && <p role="alert">{message}</p>}
        <button disabled={busy} className="btn-primary">
          Save password
        </button>
      </form>
    </AccessPage>
  );
}

const sections = [
  { path: "", name: "Overview", icon: LayoutDashboard },
  { path: "portfolio", name: "Portfolio", icon: BriefcaseBusiness, permission: "work.manage" },
  { path: "testimonials", name: "Testimonials", icon: MessageSquareQuote, permission: "testimonials.manage" },
  { path: "invoices", name: "Invoices", icon: FileText, permission: "invoices.manage" },
  { path: "inquiries", name: "Inquiries", icon: Inbox, permission: "inquiries.manage" },
  { path: "experts", name: "Team access", icon: Users, admin: true },
  { path: "settings", name: "Settings", icon: Settings, admin: true },
] as const;

export function Workspace({ role }: { role: Role }) {
  const auth = useAuth(),
    location = useLocation();
  if (!supabase) return <Unconfigured />;
  if (auth.loading) return <Loading />;
  if (!auth.user)
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  if (auth.error || !auth.profile?.active) return <AccessIssue />;
  if (auth.profile.role !== role) return <Navigate to={"/" + auth.profile.role} replace />;
  return <WorkspaceShell />;
}
function WorkspaceShell() {
  const { profile, can } = usePortal();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const base = "/" + profile.role;
  return (
    <div className="workspace">
      <aside className={open ? "workspace-nav is-open" : "workspace-nav"}>
        <Brand />
        <p>{profile.role} workspace</p>
        <nav aria-label="Workspace">
          {sections
            .filter(
              (s) =>
                !("admin" in s && profile.role !== "admin") && (!("permission" in s) || can(s.permission)),
            )
            .map((s) => {
              const path = base + (s.path ? "/" + s.path : "");
              const current = pathname === path || Boolean(s.path && pathname.startsWith(path + "/"));
              return (
                <Link
                  key={path}
                  aria-current={current ? "page" : undefined}
                  to={path}
                  onClick={() => setOpen(false)}
                >
                  <s.icon size={17} />
                  {s.name}
                </Link>
              );
            })}
        </nav>
        <Link to="/" className="workspace-site">
          View website ↗
        </Link>
      </aside>
      <section className="workspace-body">
        <header>
          <button
            className="workspace-toggle"
            aria-label="Toggle workspace navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <span>{profile.display_name || profile.email}</span>
          <button
            onClick={async () => {
              const result = await supabase?.auth.signOut();
              if (result?.error) setError(result.error.message);
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </header>
        {error && <p role="alert">{error}</p>}
        <main className="workspace-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can, profile } = usePortal();
  if (!can(permission))
    return (
      <section>
        <h1>Access restricted</h1>
        <p>Your administrator manages access to this section.</p>
        <Link className="line-link" to={"/" + profile.role}>
          Back to overview
        </Link>
      </section>
    );
  return <>{children}</>;
}
