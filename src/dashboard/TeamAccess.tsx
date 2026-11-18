import { useCallback, useEffect, useState, type FormEvent } from "react";
import { field, Label } from "../components/ui";
import { supabase } from "../lib/supabase";
import { permissionLabels, profileFields, type Permission, type Profile } from "./PortalContext";

const permissionKeys = Object.keys(permissionLabels) as Permission[];
const publishing: Partial<Record<Permission, Permission>> = {
  "work.publish": "work.manage",
  "testimonials.publish": "testimonials.manage",
};

function ExpertAccess({ expert, onSaved }: { expert: Profile; onSaved: () => void }) {
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
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Enable
        workspace access
      </label>
      <fieldset className="grid gap-2">
        <legend className="mb-2 font-semibold">Expert permissions</legend>
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
        {busy ? "Saving…" : "Save access"}
      </button>
    </form>
  );
}

export function TeamAccess() {
  const [experts, setExperts] = useState<Profile[]>([]);
  const [chosen, setChosen] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(profileFields)
      .eq("role", "expert")
      .order("display_name")
      .order("id");
    if (error) setLoadError("The team directory could not be loaded.");
    else {
      const rows = (data || []) as Profile[];
      setExperts(rows);
      setChosen((id) => (rows.some((p) => p.id === id) ? id : rows[0]?.id || ""));
      setLoadError("");
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || sending) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setSending(true);
    setMessage("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage("Sign in again to invite an expert.");
        return;
      }
      const res = await fetch("/api/invite-expert", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + data.session.access_token },
        body: JSON.stringify({ name: values.get("name"), email: values.get("email") }),
      });
      const result = await res.json();
      setMessage(result.message || "Could not send the invitation.");
      if (res.ok) {
        form.reset();
        await load();
      }
    } catch {
      setMessage("Could not reach the invitation service. Please retry.");
    } finally {
      setSending(false);
    }
  }
  const selected = experts.find((p) => p.id === chosen);
  return (
    <>
      <h1>Team access</h1>
      <p className="mt-2 text-slate-600">Invite experts and choose what each person can do.</p>
      <div className="grid gap-5 mt-7 lg:grid-cols-2 items-start">
        <section className="access-panel">
          <h2>Invite an expert</h2>
          <form onSubmit={invite} className="grid gap-4 mt-5">
            <label>
              <Label>Name</Label>
              <input className={field} name="name" required maxLength={160} />
            </label>
            <label>
              <Label>Email</Label>
              <input className={field} name="email" type="email" required maxLength={254} />
            </label>
            <button className="btn-primary justify-self-start" disabled={sending}>
              {sending ? "Sending…" : "Send invitation"}
            </button>
          </form>
        </section>
        <section className="access-panel">
          <div className="flex justify-between items-center gap-4">
            <h2>Expert directory</h2>
            <button type="button" className="line-link" disabled={loading} onClick={() => void load()}>
              Refresh
            </button>
          </div>
          {loading ? (
            <p role="status">Loading experts…</p>
          ) : loadError ? (
            <p role="alert">{loadError}</p>
          ) : selected ? (
            <>
              <label className="block mt-5">
                <Label>Choose expert</Label>
                <select
                  className={field}
                  value={chosen}
                  onChange={(e) => {
                    setChosen(e.target.value);
                    setMessage("");
                  }}
                >
                  {experts.map((expert) => (
                    <option key={expert.id} value={expert.id}>
                      {expert.display_name} · {expert.email}
                    </option>
                  ))}
                </select>
              </label>
              <ExpertAccess
                key={selected.id}
                expert={selected}
                onSaved={() => {
                  setMessage("Expert access saved.");
                  void load();
                }}
              />
            </>
          ) : (
            <p className="mt-4">Invited experts will appear here.</p>
          )}
        </section>
      </div>
      {message && (
        <p role="status" className="mt-4">
          {message}
        </p>
      )}
    </>
  );
}
