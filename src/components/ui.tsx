import { useCallback, useId, useState, type ReactNode, type ImgHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import "./loading-feedback.css";
import { PageTitle } from "./PageTitle";

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

export function Img(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <LoadingImage key={JSON.stringify([props.src, props.srcSet, props.sizes])} {...props} />;
}

function LoadingImage({ className = "", alt = "", onLoad, onError, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const readCachedImage = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) setState(img.naturalWidth > 0 ? "ready" : "failed");
  }, []);
  if (state === "failed") {
    return <div className={`media-fallback ${className}`} role={alt ? "img" : undefined}
      aria-label={alt || undefined} aria-hidden={!alt}
      style={{ width: props.width, height: props.height, ...props.style }} />;
  }
  return <img ref={readCachedImage} loading="lazy" {...props} alt={alt}
    className={`object-cover ${className}`} data-media-state={state}
    onLoad={event => { setState("ready"); onLoad?.(event); }}
    onError={event => { setState("failed"); onError?.(event); }}
  />;
}

export function PageHero({ eyebrow, title, accent, text, image, children }: { eyebrow: string; title: string; accent?: string; text: string; image?: string; children?: ReactNode }) {
  return (
    <section className="page-intro"><div className={`container-x intro-grid ${image ? "with-image" : ""}`}>
      <div><p className="kicker"><i/>{eyebrow}</p><PageTitle title={title} accent={accent}/>
      <p className="intro-description">{text}</p>
      {children && <div className="intro-actions">{children}</div>}</div>
      {image && <Img src={image} alt="" className="intro-photo" />}
    </div></section>
  );
}

export const CTA = ({ title = "What are you working on?", text = "Tell us about your idea, your audience and where you want to take it.", to = "/start-a-project" }) => (
  <section className="invitation"><div className="container-x">
    <div><p className="kicker dark"><i/>Get in touch</p><h2>{title}</h2><p>{text}</p></div>
    <Link className="btn-primary" to={to}>{to === "/become-an-expert" ? "Apply to join" : "Start a project"} <ArrowRight size={17}/></Link>
  </div></section>
);

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  const prefix = useId();
  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((f, i) => (
        <div key={f.q}>
          <button aria-controls={prefix + i} aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)} className="faq-toggle flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold">
            {f.q}<Plus size={17} aria-hidden="true" className="shrink-0 text-brand-500"/>
          </button>
          <div id={prefix + i} className="faq-panel" aria-hidden={open !== i}><div><p className="px-6 pb-5 text-slate-600">{f.a}</p></div></div>
        </div>
      ))}
    </div>
  );
}

export const field = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
export const Label = ({ children }: { children: ReactNode }) => <span className="mb-1 block text-xs font-semibold text-slate-600">{children}</span>;
