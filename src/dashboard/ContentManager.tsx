import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { audiences, services, workDisciplines } from "../data";
import { field, Label } from "../components/ui";
import { mediaBucket, portfolioUrl, contentClient, quoteColumns, workColumns, type ClientQuote, type Publication, type WorkPost } from "../lib/portfolio";
import { usePortal } from "./PortalContext";

type Kind = "work" | "testimonials";
type Entry = Partial<WorkPost & ClientQuote> & {
  id: string;
  author_id: string | null;
  status: Publication;
  updated_at: string;
};
type Editor = { original?: Entry };
const catalog = {
  work: { table: "portfolio_work", columns: workColumns, heading: "Portfolio", noun: "project", manage: "work.manage", publish: "work.publish" },
  testimonials: { table: "testimonials", columns: quoteColumns, heading: "Testimonials", noun: "testimonial", manage: "testimonials.manage", publish: "testimonials.publish" },
} as const;
const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif",
};
const relatedServices = [
  ...services,
  { title: "Book Marketing", route: "/book-author-services/book-marketing" },
];
const pageSize = 20;

function describeError(error: unknown) {
  return error && typeof error === "object" && "message" in error ? String(error.message) : "Please check your connection and try again.";
}

function EntryEditor({ kind, original, owner, publishAllowed, onClose, onSaved }: {
  kind: Kind; original?: Entry; owner: string; publishAllowed: boolean; onClose: () => void; onSaved: (message: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [storedCover, setStoredCover] = useState("");
  const [preview, setPreview] = useState("");
  const [removeCover, setRemoveCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [entryId] = useState(() => original?.id || crypto.randomUUID());
  const { table, noun } = catalog[kind];
  const isWork = kind === "work";
  const wasPublished = original?.status === "published";

  useEffect(() => {
    if (!original?.image_path) return;
    let active = true;
    void contentClient().storage.from(mediaBucket).createSignedUrl(original.image_path, 3600)
      .then(({ data }) => { if (active && data?.signedUrl) setStoredCover(data.signedUrl); })
      .catch(() => {});
    return () => { active = false; };
  }, [original?.image_path]);
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status: Publication = submitter?.value === "published" || (!submitter && wasPublished) ? "published" : "draft";
    const values = new FormData(event.currentTarget);
    const value = (name: string) => String(values.get(name) || "").trim();
    if (isWork ? !value("title") || !value("summary") : !value("client_name") || !value("quote")) {
      setError(isWork ? "Enter a project title and description." : "Enter the client’s name and testimonial."); return;
    }
    if ((status === "published" || wasPublished) && !publishAllowed) {
      setError("Publishing permission is required for this change."); return;
    }
    submitting.current = true;
    setSaving(true);
    setError("");
    let uploaded = "";
    try {
      const client = contentClient();
      const storage = client.storage.from(mediaBucket);
      if (file) {
        const ext = imageExtensions[file.type];
        if (!ext || !file.size || file.size > 8 * 1024 * 1024) throw new Error("Choose a JPEG, PNG, WebP or AVIF image up to 8 MB.");
        const path = (original?.author_id || owner) + "/" + crypto.randomUUID() + "." + ext;
        const upload = await storage.upload(path, file, { contentType: file.type, upsert: false });
        if (upload.error) throw upload.error;
        uploaded = path;
      }
      const imagePath = uploaded || (!removeCover && original?.image_path) || null;
      const changes = isWork
        ? {
          title: value("title"), summary: value("summary"), category: value("category"), audience: value("audience"),
          goal: value("goal"), scope: value("scope").split(/\r?\n/).map(line => line.trim()).filter(Boolean),
          handover: value("handover"), service_path: value("service_path"), status,
          image_path: imagePath, cover_asset: !imagePath && !removeCover ? original?.cover_asset || null : null,
        }
        : { client_name:value("client_name"), client_title:value("client_title"), quote:value("quote"), status };
      const mutation = original
        ? client.from(table).update(changes).eq("id", original.id).eq("updated_at", original.updated_at)
        : client.from(table).insert({ id:entryId, ...changes });
      const result = await mutation.select("id").maybeSingle();
      // A lost response can leave the first insert committed before the editor retries.
      if (!original && result.error?.code === "23505") {
        const existing = await client.from(table).select("id").eq("id", entryId).eq("author_id", owner).maybeSingle();
        if (existing.data) {
          if (uploaded) await storage.remove([uploaded]).catch(() => {});
          onSaved("An earlier save succeeded. Reopen the entry to make further changes.");
          return;
        }
      }
      if (result.error) throw result.error;
      if (!result.data) throw new Error("This entry changed or your access expired. Reopen the entry to load the latest version.");
      uploaded = "";
      if (original?.image_path && original.image_path !== imagePath) {
        await storage.remove([original.image_path]).catch(() => {});
      }
      const message = status === "published" ? "Published on the website." : wasPublished ? "Unpublished and saved as a draft." : "Draft saved.";
      onSaved(message);
    } catch (err) {
      if (uploaded) await contentClient().storage.from(mediaBucket).remove([uploaded]).catch(() => {});
      setError(describeError(err));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  const image = preview || (!removeCover && (original?.image_path ? storedCover : original?.cover_asset));
  return <section className="max-w-3xl">
    <button type="button" disabled={saving} onClick={onClose} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16}/> Back to {catalog[kind].heading.toLowerCase()}</button>
    <h1 className="mb-5 text-3xl font-bold">{original ? "Edit" : "Add"} {noun}</h1>
    <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <fieldset disabled={saving} className="space-y-5">
        {isWork ? <>
          <label className="block"><Label>Project title</Label><input name="title" required maxLength={180} defaultValue={original?.title} className={field}/></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><Label>Discipline</Label><select name="category" defaultValue={original?.category ?? workDisciplines[0]} className={field}>
              <option value="">No discipline</option>{[...new Set([...workDisciplines, ...(original?.category ? [original.category] : [])])].map(name => <option key={name}>{name}</option>)}
            </select></label>
            <label className="block"><Label>Audience</Label><select name="audience" defaultValue={original?.audience || ""} className={field}>
              <option value="">General audience</option>{[...new Set([...audiences.map(a => a.title), ...(original?.audience ? [original.audience] : [])])].map(name => <option key={name}>{name}</option>)}
            </select></label>
          </div>
          <label className="block"><Label>Project description</Label><textarea name="summary" required maxLength={6000} rows={6} defaultValue={original?.summary} className={field}/></label>
          <div className="space-y-3">
            <label className="block"><Label>Cover image</Label>
              <input ref={fileInput} type="file" accept={Object.keys(imageExtensions).join(",")} aria-describedby="cover-hint" className={field} onChange={e => {
                const chosen = e.target.files?.[0];
                if (!chosen) return;
                if (!imageExtensions[chosen.type] || !chosen.size || chosen.size > 8 * 1024 * 1024) {
                  e.target.value = ""; setFile(null); setError("Choose a JPEG, PNG, WebP or AVIF image up to 8 MB."); return;
                }
                setError(""); setRemoveCover(false); setFile(chosen);
              }}/>
            </label>
            <p id="cover-hint" className="text-xs text-slate-500">JPEG, PNG, WebP or AVIF · Up to 8 MB</p>
            {image && <img src={image} alt="Project cover preview" className="max-h-52 max-w-full rounded-lg object-contain"/>}
            {(file || ((original?.image_path || original?.cover_asset) && !removeCover)) && <button type="button" className="text-sm font-semibold underline" onClick={() => {
              setFile(null); setRemoveCover(true); if (fileInput.current) fileInput.current.value = "";
            }}>Remove cover</button>}
          </div>
          <details open={Boolean(original?.legacy_slug || original?.goal || original?.scope?.length || original?.handover || original?.service_path)}
            className="rounded-lg border border-slate-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold">Case study details</summary>
            <div className="mt-4 space-y-4">
              <label className="block"><Label>Project goal</Label><textarea name="goal" rows={2} maxLength={6000} defaultValue={original?.goal} className={field}/></label>
              <label className="block"><Label>Proposed scope</Label><textarea name="scope" rows={5} maxLength={12000}
                defaultValue={original?.scope?.join("\n")} aria-describedby="scope-hint" className={field}/></label>
              <p id="scope-hint" className="text-xs text-slate-500">Enter one scope item per line.</p>
              <label className="block"><Label>Review and handover</Label><textarea name="handover" rows={3} maxLength={6000} defaultValue={original?.handover} className={field}/></label>
              <label className="block"><Label>Related service</Label><select name="service_path" defaultValue={original?.service_path || ""} className={field}>
                <option value="">None</option>
                {relatedServices.map(service => <option key={service.route} value={service.route}>{service.title}</option>)}
                {original?.service_path && !relatedServices.some(service => service.route === original.service_path) &&
                  <option value={original.service_path}>{original.service_path}</option>}
              </select></label>
            </div>
          </details>
        </> : <>
          <label className="block"><Label>Client name</Label><input name="client_name" required maxLength={160} defaultValue={original?.client_name} className={field}/></label>
          <label className="block"><Label>Role or company (optional)</Label><input name="client_title" maxLength={250} defaultValue={original?.client_title} className={field}/></label>
          <label className="block"><Label>Testimonial</Label><textarea name="quote" required maxLength={3000} rows={5} defaultValue={original?.quote} className={field}/></label>
        </>}
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          {wasPublished ? <>
            <button type="submit" value="published" className="btn-primary">Save published changes</button>
            <button type="submit" value="draft" className="btn-ghost">Move to draft</button>
          </> : <>
            <button type="submit" value="draft" className={publishAllowed ? "btn-ghost" : "btn-primary"}>Save draft</button>
            {publishAllowed && <button type="submit" value="published" className="btn-primary">Publish to website</button>}
          </>}
          {saving && <span role="status" className="text-sm text-slate-500">Saving…</span>}
        </div>
      </fieldset>
    </form>
  </section>;
}

function ContentManager({ kind }: {kind: Kind}) {
  const { profile, can } = usePortal();
  const { table, columns, heading, noun, manage, publish } = catalog[kind];
  const allowed = can(manage);
  const publishAllowed = can(publish);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [more, setMore] = useState(false);
  const [page, setPage] = useState(0);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState("");
  const [deleting, setDeleting] = useState(false);
  const owner = profile?.id;
  const role = profile?.role;
  useEffect(() => {
    if (!allowed || !owner) return;
    let current = true;
    setLoading(true);
    setError("");
    setPendingDelete("");
    async function load() {
      let query = contentClient().from(table).select(columns + ",author_id");
      if (role !== "admin") query = query.eq("author_id",owner);
      const offset = page * pageSize;
      const { data, error: failure } = await query.order("updated_at",{ascending:false}).order("id").range(offset, offset + pageSize);
      if (failure) throw failure;
      if (current) {
        setEntries((data || []).slice(0,pageSize) as unknown as Entry[]);
        setMore((data?.length || 0) > pageSize);
        setLoading(false);
      }
    }
    void load().catch(err => { if (current) { setEntries([]); setMore(false); setError(describeError(err)); setLoading(false); } });
    return () => { current = false; };
  }, [allowed, owner, role, table, columns, page, reload]);

  function reset(message: string) {
    setEditor(null);
    setPage(0);
    setNotice(message);
    setReload(n => n+1);
  }
  async function deleteEntry(entry: Entry) {
    if (deleting) return;
    setDeleting(true); setError(""); setNotice("");
    try {
      const client = contentClient();
      const result = await client.from(table).delete().eq("id",entry.id).eq("updated_at",entry.updated_at).select("id").maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) throw new Error("This entry changed or your access expired. Refresh the list and try again.");
      if (entry.image_path) await client.storage.from(mediaBucket).remove([entry.image_path]).catch(() => {});
      reset(kind === "work" ? "Project deleted." : "Testimonial deleted.");
    } catch (err) { setError(describeError(err)); }
    finally { setDeleting(false); setPendingDelete(""); }
  }

  if (!allowed || !owner) return <p role="status">Your account needs permission to manage {heading.toLowerCase()}.</p>;
  if (editor && (editor.original?.status !== "published" || publishAllowed)) return <EntryEditor key={editor.original?.id || "new"} kind={kind} original={editor.original} owner={owner}
    publishAllowed={publishAllowed} onClose={() => { setEditor(null); setReload(n => n+1); }} onSaved={reset}/>;
  return <section>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-bold">{heading}</h1><p className="mt-2 text-sm text-slate-600">{kind === "work" ? "Published projects appear in the work directory and the latest six appear on the homepage." : "Published testimonials appear on the homepage."}</p></div>
      <button type="button" className="btn-primary" onClick={() => { setNotice(""); setEditor({}); }}><Plus size={16}/> Add {noun}</button>
    </div>
    {notice && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {error && <div role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error} <button className="font-semibold underline" onClick={() => setReload(n => n+1)}>Refresh list</button></div>}
    {loading ? <p role="status" className="p-5 text-sm">Loading {heading.toLowerCase()}…</p> :
    !entries.length && !error ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No {kind === "work" ? "projects" : "testimonials"} yet.</div> :
    <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {entries.map(entry => {
        const editable = entry.status === "draft" || publishAllowed;
        const name = (kind === "work" ? entry.title : entry.client_name) || noun;
        return <li key={entry.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="break-words">{name}</strong>
            <span className={'rounded-full px-2.5 py-1 text-xs font-semibold capitalize ' + (entry.status === "published" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600")}>{entry.status}</span></div>
            <p className="mt-1 line-clamp-2 break-words text-sm text-slate-600">{kind === "work" ? entry.summary : entry.quote}</p></div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {kind === "work" && entry.status === "published" && <Link to={portfolioUrl(entry)} aria-label={"View " + name + " on website"} className="inline-flex items-center gap-1"><ExternalLink size={15}/> View</Link>}
            {editable && <><button type="button" aria-label={"Edit " + name} className="inline-flex items-center gap-1" onClick={() => { setNotice(""); setEditor({original:entry}); }}><Pencil size={15}/> Edit</button>
            <button type="button" aria-label={"Delete " + name} className="inline-flex items-center gap-1 text-rose-700" onClick={() => setPendingDelete(entry.id)}><Trash2 size={15}/> Delete</button></>}
          </div>
          {pendingDelete === entry.id && <div className="flex w-full flex-wrap items-center gap-3 rounded-lg bg-rose-50 p-3 text-sm">
            <span>Delete this {noun} permanently?</span>
            <button type="button" disabled={deleting} className="font-semibold text-rose-700 underline" onClick={() => void deleteEntry(entry)}>{deleting ? "Deleting…" : "Confirm deletion"}</button>
            <button type="button" disabled={deleting} onClick={() => setPendingDelete("")}>Cancel</button>
          </div>}
        </li>;
      })}
    </ul>}
    {(page > 0 || more) && <nav aria-label={heading + " pages"} className="mt-5 flex gap-3">
      <button className="btn-ghost" disabled={loading || !page} onClick={() => setPage(n => n-1)}>Previous page</button>
      <button className="btn-ghost" disabled={loading || !more} onClick={() => setPage(n => n+1)}>Next page</button>
    </nav>}
  </section>;
}

export function PortfolioManager() { return <ContentManager kind="work"/>; }
export function TestimonialManager() { return <ContentManager kind="testimonials"/>; }
