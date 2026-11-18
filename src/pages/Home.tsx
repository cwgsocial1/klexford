import StudioHero from "../components/StudioHero";
import HomeSections from "./HomeSections";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { audiences, services, team } from "../data";
import { Img } from "../components/ui";

export function ServiceCards() {
  return <div className="service-index">{services.map(s =>
    <Link to={s.route} key={s.slug}><s.icon aria-hidden="true" size={23} strokeWidth={1.4}/>
      <div><h3>{s.title}</h3><p>{s.desc}</p></div><ArrowUpRight size={22}/>
    </Link>)}</div>;
}

export function AudienceCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {audiences.map((a) => (
        <Link key={a.route} to={a.route} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-brand-500 hover:shadow-card">
          <div className="relative">
            <Img src={a.image} alt={a.title} className="h-40 w-full" />
            <span className="absolute -bottom-5 left-5 grid h-11 w-11 place-items-center rounded-lg bg-white text-mint shadow-card"><a.icon size={20} /></span>
          </div>
          <div className="p-6 pt-8">
            <h3 className="font-semibold group-hover:text-brand-600">{a.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{a.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function TeamGrid({ limit }: { limit?: number }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {team.slice(0, limit).map(m => <article key={m.initials} className="role-card">
      <span aria-hidden="true">{m.initials}</span><h3>{m.role}</h3>
    </article>)}</div>;
}

export default function Home() {
  return <><StudioHero/><HomeSections/></>;
}
