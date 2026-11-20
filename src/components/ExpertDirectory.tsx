import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { database, useWorkspaceData } from "../lib/operations";
import { Section } from "./ui";

type PublicExpert = {
  display_name: string;
  specialty: string;
  bio: string;
  portfolio_url: string;
};

const pageSize = 12;

function portfolioLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export default function ExpertDirectory() {
  const [page, setPage] = useState(0);
  const result = useWorkspaceData("team-directory:" + page, async () => {
    const start = page * pageSize;
    const { data, error } = await database().rpc("list_team_experts").range(start, start + pageSize);
    if (error) throw error;
    return data as PublicExpert[];
  });
  const profiles = result.data?.slice(0, pageSize);
  const hasNext = (result.data?.length || 0) > pageSize;

  return <Section>
    <h2 className="text-3xl font-bold sm:text-4xl">Meet our experts</h2>
    <div className="mt-8">
      {result.error ? <div>
        <p role="alert">The expert directory couldn’t be loaded.</p>
        <button type="button" onClick={result.reload} className="btn-ghost mt-4">Try again</button>
      </div> : !profiles ? <p role="status">Loading expert profiles…</p> :
        profiles.length === 0 ? <p className="text-slate-600">{page === 0 ? "There are no public expert profiles yet." : "There are no more profiles on this page."}</p> :
          <ul aria-label="Expert profiles" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{profiles.map((expert, index) => {
            const portfolio = portfolioLink(expert.portfolio_url);
            return <li key={page * pageSize + index} className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 [overflow-wrap:anywhere]">
              <h3 className="text-2xl font-semibold">{expert.display_name}</h3>
              {expert.specialty && <p className="mt-1 text-sm font-semibold text-brand-700">{expert.specialty}</p>}
              {expert.bio && <p className="mt-4 whitespace-pre-line text-slate-600">{expert.bio}</p>}
              {portfolio && <div className="mt-auto pt-5"><a className="line-link" href={portfolio} target="_blank" rel="noopener noreferrer">
                View portfolio<span className="sr-only"> for {expert.display_name}</span><ArrowUpRight size={16} aria-hidden="true"/>
              </a></div>}
            </li>;
          })}</ul>}
    </div>
    {(page > 0 || hasNext) && <nav aria-label="Expert directory pages" className="mt-8 flex flex-wrap items-center gap-4">
      <button type="button" className="btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
      <span aria-live="polite" className="text-sm">Page {page + 1}</span>
      <button type="button" className="btn-ghost" disabled={!hasNext} onClick={() => setPage(p => p + 1)}>Next</button>
    </nav>}
  </Section>;
}
