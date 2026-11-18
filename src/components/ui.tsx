import { useState, type ReactNode, type ImgHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const Section = ({ className = "", children }: { className?: string; children: ReactNode }) => (
  <section className={`py-20 ${className}`}><div className="container-x">{children}</div></section>
);

export const Heading = ({ eyebrow, pre, accent, post, center, light }: { eyebrow: string; pre?: string; accent: string; post?: string; center?: boolean; light?: boolean }) => (
  <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
    <p className="eyebrow">{eyebrow}</p>
    <h2 className={`mt-2 text-3xl font-bold leading-tight sm:text-4xl ${light ? "text-white" : ""}`}>
      {pre} <span className="text-brand-500">{accent}</span> {post}
    </h2>
  </div>
);

/** Image with graceful gradient fallback if the placeholder URL fails. */
export function Img({ className = "", alt = "", ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [err, setErr] = useState(false);
  if (err) return <div className={`bg-gradient-to-br from-brand-100 to-indigo-200 ${className}`} aria-label={alt} />;
  return <img loading="lazy" alt={alt} onError={() => setErr(true)} className={`object-cover ${className}`} {...rest} />;
}

export function PageHero({ eyebrow, title, accent, text, image, children }: { eyebrow: string; title: string; accent?: string; text: string; image?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50">
      <div className={`container-x grid items-center gap-12 py-16 lg:py-20 ${image ? "lg:grid-cols-2" : ""}`}>
        <div className={image ? "" : "mx-auto max-w-3xl text-center"}>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{title} {accent && <span className="text-brand-500">{accent}</span>}</h1>
          <p className="mt-5 text-lg text-slate-600">{text}</p>
          {children && <div className={`mt-8 flex flex-wrap gap-4 ${image ? "" : "justify-center"}`}>{children}</div>}
        </div>
        {image && <Img src={image} alt={title} className="aspect-[4/3] w-full rounded-3xl shadow-card" />}
      </div>
    </section>
  );
}

export const CTA = ({ title = "Ready to start your next chapter?", text = "Tell us what you need and the right team member will prepare before our first conversation.", to = "/start-a-project" }) => (
  <Section>
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-500 to-indigo-600 p-10 text-white sm:p-14">
      <div className="max-w-2xl">
        <h3 className="text-3xl font-bold">{title}</h3>
        <p className="mt-3 text-white/85">{text}</p>
        <Link to={to} className="btn mt-8 bg-white text-brand-600 hover:bg-brand-50">Start a Project <ArrowRight size={16} /></Link>
      </div>
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
      <div className="absolute -bottom-20 right-20 h-48 w-48 rounded-full bg-white/10" />
    </div>
  </Section>
);

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((f, i) => (
        <div key={f.q}>
          <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold">
            {f.q}<span className="text-xl text-brand-500">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="px-6 pb-5 text-slate-600">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

export const field = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
export const Label = ({ children }: { children: ReactNode }) => <span className="mb-1 block text-xs font-semibold text-slate-600">{children}</span>;
