import { useEffect, useState, type FormEvent } from "react";
import { field, Label } from "../components/ui";
import { database, useWorkspaceData } from "../lib/operations";
import { ReviewApplications } from "./ReviewApplications";
import { workspaceEndpoint } from "../lib/workspaceApi";
import { supabase } from "../lib/supabase";
import { permissionLabels, profileFields, type Permission, type Profile } from "./PortalContext";

const permissionKeys = Object.keys(permissionLabels) as Permission[];
const publishing: Partial<Record<Permission, Permission>> = {
  "work.publish": "work.manage",
  "testimonials.publish": "testimonials.manage",
};

interface ReviewProfile extends Profile {
  specialty: string;
  bio: string;
  portfolio_url: string;
  availability: string;
  time_zone: string;
  expert_registration: boolean;
  email_verified: boolean;
}
const reviewFields = profileFields + ",specialty,bio,portfolio_url,availability,time_zone,expert_registration,email_verified";
const pageSize = 30;

function ExpertAccess({ expert, onSaved }: { expert: ReviewProfile; onSaved: () => void }) {
  const [name, setName] = useState(expert.display_name);
  const [active, setActive] = useState(expert.active);
  const [grants, setGrants] = useState(expert.permissions);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  function toggle(key: Permission, checked: boolean) {
    const next = new Set(grants);
    if (checked) {
      next.add(key);
      const required = publishing[key];
      if (required) next.add(required);
    } else {
      next.delete(key);
      for (const dependent of permissionKeys) if (publishing[dependent] === key) next.delete(dependent);
    }
    setGrants(permissionKeys.filter((permission) => next.has(permission)));
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!supabase || busy || !name.trim()) return;
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(name.trim())) {
      setMessage("Use a public display name instead of an email address.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ display_name: name.trim(), active, permissions: grants })
        .eq("id", expert.id)
        .eq("role", "expert")
        .eq("display_name", expert.display_name)
        .eq("active", expert.active)
        .eq("permissions", "{" + expert.permissions.join(",") + "}")
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setMessage("This record changed or your access expired. Refresh the directory before saving.");
        return;
      }
      onSaved();
    } catch {
      setMessage("Could not save this expert’s access. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="grid gap-4 mt-5">
      <div className="grid gap-2 rounded-lg border border-slate-200 p-4">
        <strong>{expert.active ? "Approved" : "Pending approval"}</strong>
        <p className="text-sm text-slate-600">{expert.expert_registration ? "Expert registration" : "Team account"} · {expert.email_verified ? "Email verified" : "Awaiting email verification"}</p>
        {expert.specialty && <p className="font-semibold">{expert.specialty}</p>}
        {expert.bio && <p className="whitespace-pre-wrap break-words">{expert.bio}</p>}
        {expert.portfolio_url && /^https:\/\//i.test(expert.portfolio_url) && <a className="line-link w-fit" target="_blank" rel="noopener noreferrer" href={expert.portfolio_url}>View portfolio ↗</a>}
        {expert.availability && <p className="text-sm">Availability · {expert.availability}</p>}
        {expert.time_zone && <p className="text-sm">Time zone · {expert.time_zone}</p>}
      </div>
      <label>
        <Label>Display name</Label>
        <input
          className={field}
          maxLength={160}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Approve expert for dashboard access
      </label>
      <fieldset className="grid gap-2">
        <legend className="mb-2 font-semibold">Expert permissions</legend>
        <p className="mb-2 text-sm text-slate-600">Choose the dashboard features available after approval.</p>
        {permissionKeys.map((key) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={grants.includes(key)}
              onChange={(e) => toggle(key, e.target.checked)}
            />
            {permissionLabels[key]}
          </label>
        ))}
      </fieldset>
      {message && <p role="alert">{message}</p>}
      <button className="btn-primary justify-self-start" disabled={busy || !name.trim()}>
        {busy ? "Saving…" : active && !expert.active ? "Approve expert" : !active && expert.active ? "Revoke approval" : "Save access"}
      </button>
    </form>
  );
}

export function TeamAccess() {
  const [chosen, setChosen] = useState("");
  const [filter, setFilter] = useState("all");
  const [reviewEmail, setReviewEmail] = useState("");
  const [applicationRevision, setApplicationRevision] = useState(0);
  const [page, setPage] = useState(0);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [privateInvite, setPrivateInvite] = useState<{ email: string; url: string } | null>(null);
  const directory = useWorkspaceData("expert-review:" + JSON.stringify([filter, page, reviewEmail]), async () => {
    let query = database().from("profiles").select(reviewFields).eq("role", "expert");
    if (reviewEmail) query = query.eq("email", reviewEmail);
    if (filter !== "all") query = query.eq("active", filter === "approved");
    const start = page * pageSize;
    const { data, error } = await query.order("active").order("expert_registration", { ascending: false })
      .order("display_name").order("id").range(start, start + pageSize);
    if (error) throw error;
    return (data || []) as unknown as ReviewProfile[];
  });
  const experts = directory.data?.slice(0, pageSize) || [];
  const selected = experts.find(p => p.id === chosen || p.email === chosen) || experts[0];
  useEffect(() => {
    const clearPrivateInvite = () => setPrivateInvite(null);
    window.addEventListener("pagehide", clearPrivateInvite);
    return () => window.removeEventListener("pagehide", clearPrivateInvite);
  }, []);
  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || sending) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const createLink = submitter instanceof HTMLButtonElement && submitter.value === "link";
    const email = String(values.get("email") || "").trim();
    if (await sendInvitation(String(values.get("name") || ""), email, createLink)) form.reset();
  }
  async function sendInvitation(name: string, email: string, createLink: boolean, applicationId?: string) {
    if (!supabase || sending) return false;
    setSending(true);
    setMessage("");
    setPrivateInvite(null);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage("Sign in again to invite an expert.");
        return false;
      }
      const discovery = await fetch("/api/invite-expert", { cache: "no-store" });
      if (!discovery.ok && discovery.status !== 405) throw new Error("Invitation configuration unavailable.");
      const edge = discovery.ok && (await discovery.json()).edge === true;
      const res = await fetch(workspaceEndpoint("invite-expert", edge), {
        method: "POST",
        redirect: "error",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + data.session.access_token },
        body: JSON.stringify({ name, email, ...(createLink && { delivery: "link" }), applicationId }),
      });
      const result = await res.json();
      setMessage(result.message || "Could not send the invitation.");
      if (res.ok) {
        if (createLink && typeof result.inviteUrl === "string") setPrivateInvite({ email, url: result.inviteUrl });
        setChosen(email.toLowerCase());
        setReviewEmail(email.toLowerCase());
        setPage(0);
        setFilter("all");
        directory.reload();
      }
      return res.ok;
    } catch {
      setMessage("Could not reach the invitation service. Please retry.");
      return false;
    } finally {
      setSending(false);
    }
  }
  return (
    <>
      <h1>Team access</h1>
      <p className="mt-2 text-slate-600">Review expert registrations, approve dashboard access and choose each person’s permissions.</p>
      <div className="grid gap-5 mt-7 lg:grid-cols-2 items-start">
        <section className="access-panel">
          <h2>Invite an expert</h2>
          <form onSubmit={invite} onChange={() => setPrivateInvite(null)} className="grid gap-4 mt-5">
            <label>
              <Label>Name</Label>
              <input className={field} name="name" required maxLength={160} />
            </label>
            <label>
              <Label>Email</Label>
              <input className={field} name="email" type="email" required maxLength={254} />
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="btn-primary" disabled={sending}>
                {sending ? "Please wait…" : "Send invitation"}
              </button>
              <button type="submit" name="delivery" value="link" className="line-link" disabled={sending}>
                Create private link
              </button>
            </div>
          </form>
          {privateInvite && (
            <section className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-4" aria-label="Private invitation">
              <p>Share this one-time link privately with <strong>{privateInvite.email}</strong>. Anyone who has it can accept the invitation.</p>
              <label>
                <Label>Private invitation link</Label>
                <input className={field} value={privateInvite.url} readOnly autoFocus autoComplete="off"
                  onFocus={event => event.currentTarget.select()} />
              </label>
              <div className="flex items-center gap-4">
                <button type="button" className="btn-primary" onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(privateInvite.url);
                    setMessage("Invitation link copied.");
                  } catch {
                    setMessage("Select the invitation link and copy it manually.");
                  }
                }}>Copy link</button>
                <button type="button" className="line-link" onClick={() => { setPrivateInvite(null); setMessage(""); }}>Dismiss</button>
              </div>
            </section>
          )}
        </section>
        <section className="access-panel">
          <div className="flex justify-between items-center gap-4">
            <h2>Review experts</h2>
            <button type="button" className="line-link" disabled={!directory.data && !directory.error} onClick={() => { directory.reload(); setApplicationRevision(n => n + 1); }}>
              Refresh
            </button>
          </div>
          <div className="mt-4"><label htmlFor="expert-approval-filter"><Label>Approval status</Label></label>
            <select id="expert-approval-filter" className={field} value={filter} onChange={e => { setFilter(e.target.value); setReviewEmail(""); setPage(0); setChosen(""); }}>
              <option value="all">All experts</option><option value="pending">Pending approval</option><option value="approved">Approved</option>
            </select>
          </div>
          {reviewEmail && <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span>Reviewing {reviewEmail}</span>
            <button type="button" className="line-link" onClick={() => { setReviewEmail(""); setChosen(""); }}>Show all experts</button>
          </div>}
          {!directory.data && !directory.error ? (
            <p role="status">Loading experts…</p>
          ) : directory.error ? (
            <p role="alert">{directory.error}</p>
          ) : selected ? (
            <>
              <div className="mt-5">
                <label htmlFor="review-expert"><Label>Choose expert</Label></label>
                <select id="review-expert"
                  className={field}
                  value={selected.id}
                  onChange={(e) => {
                    setChosen(e.target.value);
                    setMessage("");
                  }}
                >
                  {experts.map((expert) => (
                    <option key={expert.id} value={expert.id}>
                      {expert.active ? "Approved" : "Pending"} · {expert.display_name} · {expert.email}
                    </option>
                  ))}
                </select>
              </div>
              <ExpertAccess
                key={selected.id}
                expert={selected}
                onSaved={() => {
                  setMessage("Expert access saved.");
                  directory.reload();
                }}
              />
            </>
          ) : (
            <p className="mt-4">No experts match this approval status.</p>
          )}
          {(page > 0 || (directory.data?.length || 0) > pageSize) && <div className="flex gap-4 mt-4">
            <button type="button" className="line-link" disabled={!page} onClick={() => setPage(page - 1)}>Previous</button>
            <button type="button" className="line-link" disabled={(directory.data?.length || 0) <= pageSize} onClick={() => setPage(page + 1)}>Next</button>
          </div>}
        </section>
      </div>
      <ReviewApplications revision={applicationRevision} sending={sending} sendLink={(application) => sendInvitation(application.name, application.email, true, application.id)}/>
      {message && (
        <p role="status" className="mt-4">
          {message}
        </p>
      )}
    </>
  );
}
