import { useState } from "react";
import { services } from "../data";
import { database, useWorkspaceData } from "../lib/operations";

interface Application {
  id: string;
  name: string;
  email: string;
  data: { department: string; portfolio?: string; experience: string; availability: string; timeZone?: string };
}

export function ReviewApplications({ revision, sending, sendLink }: {
  revision: number;
  sending: boolean;
  sendLink: (application: Application) => Promise<boolean>;
}) {
  const [page, setPage] = useState(0);
  const limit = 10;
  const queue = useWorkspaceData("signup-invitations:" + page + ":" + revision, async () => {
    const start = limit * page;
    const { data, error } = await database().from("inquiries").select("id,name,email,data")
      .eq("kind", "expert").eq("status", "new").eq("data->>expertRegistration", "true")
      .order("created_at").order("id").range(start, start + limit);
    if (error) throw error;
    return data as Application[];
  });
  if (queue.error) return <p role="alert" className="mt-5">The invitation queue could not be loaded. <button className="line-link" onClick={queue.reload}>Retry</button></p>;
  if (!queue.data || (!page && !queue.data.length)) return null;
  return <section className="access-panel mt-5">
    <h2>Registrations needing an invitation</h2>
    <p className="mt-1 text-sm text-slate-600">Email confirmation was unavailable for these applicants. Review the details, send a private setup link to the applicant’s email, then approve the account under Review experts.</p>
    {queue.data.slice(0, limit).map(application => <article key={application.id} className="mt-4 border-t pt-4 space-y-2">
      <h3 className="font-semibold">{application.name}</h3>
      <p className="text-sm">{application.email} · {services.find(s => s.slug === application.data.department)?.title || application.data.department}</p>
      <p className="whitespace-pre-wrap break-words">{application.data.experience}</p>
      <p className="text-sm">Availability · {application.data.availability} {application.data.timeZone}</p>
      {application.data.portfolio?.startsWith("https://") && <a className="line-link" href={application.data.portfolio} rel="noopener noreferrer" target="_blank">View portfolio ↗</a>}
      <div><button className="btn-primary" disabled={sending} onClick={async () => { if (await sendLink(application)) queue.reload(); }}>Create private setup link</button></div>
    </article>)}
    {(page > 0 || queue.data.length > limit) && <div className="mt-4 flex gap-4">
      <button className="line-link" disabled={!page} onClick={() => setPage(page - 1)}>Previous</button>
      <button className="line-link" disabled={queue.data.length <= limit} onClick={() => setPage(page + 1)}>Next</button>
    </div>}
  </section>;
}
