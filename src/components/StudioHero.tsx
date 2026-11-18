import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, BookOpen, Code2, Pause, PenTool, Play, Sparkles } from "lucide-react";
import "./studio-motion.css";

const disciplines = [
  { key: "book", label: "Publishing", icon: BookOpen, text: "Take your manuscript from first edit to launch with book design, publishing support and reader campaigns.", to: "/book-author-services" },
  { key: "code", label: "Web design", icon: Code2, text: "Build an author platform, a business website or a storefront around what your visitors need to do next.", to: "/website-development" },
  { key: "pen", label: "Creative", icon: PenTool, text: "Bring your identity to life across book covers, campaign artwork, social content and digital experiences.", to: "/branding-creative" },
];

export default function StudioHero() {
  const shell = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [paused, setPaused] = useState(() => {
    try { return sessionStorage.getItem("klexford:hero-motion") === "paused"; } catch { return false; }
  });
  const choice = active === null ? undefined : disciplines[active];

  useEffect(() => {
    const element = shell.current;
    if (!element || paused) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let x = 0, y = 0;

    const draw = () => {
      frame = 0;
      element.style.setProperty("--scene-x", String(x));
      element.style.setProperty("--scene-y", String(y));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const home = () => { x = y = 0; schedule(); };
    const move = (event: PointerEvent) => {
      if (!motion.matches || !finePointer.matches || event.pointerType === "touch") return;
      const rect = element.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, (event.clientX - rect.left) * 2 / rect.width - 1));
      y = Math.max(-1, Math.min(1, (event.clientY - rect.top) * 2 / rect.height - 1));
      schedule();
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      element.classList.toggle("scene-offscreen", !entry.isIntersecting);
    });
    observer?.observe(element);
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", home);
    motion.addEventListener("change", home);
    return () => {
      observer?.disconnect();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", home);
      motion.removeEventListener("change", home);
      cancelAnimationFrame(frame);
      element.classList.remove("scene-offscreen");
      element.style.removeProperty("--scene-x");
      element.style.removeProperty("--scene-y");
    };
  }, [paused]);

  function toggleMotion() {
    const next = !paused;
    setPaused(next);
    try { sessionStorage.setItem("klexford:hero-motion", next ? "paused" : "playing"); } catch { /* Private browsing can disable storage. */ }
  }

  return <div className="cover-stage">
    <section ref={shell} className={'hero-shell studio-scene' + (paused ? ' scene-paused' : '')} aria-labelledby="hero-title">
      <div className="scene-surface" aria-hidden="true"/>
      <div className="scene-sheen" aria-hidden="true"/>
      <div className="hero-copy">
        <p className="hero-tag"><Sparkles size={17} strokeWidth={2.2}/>Publishing, Digital &amp; Growth</p>
        <div className="scene-lockup">
          <h1 id="hero-title">Build your<br/>next chapter.</h1>
          <div role="group" aria-label="Explore a studio discipline" className="studio-objects">
            {disciplines.map((d, i) => <button key={d.key} type="button" className={'object-tile ' + d.key}
              aria-label={'Preview ' + d.label.toLowerCase()} aria-pressed={active === i} aria-controls="hero-discipline"
              title={'Preview ' + d.label.toLowerCase()} onClick={() => setActive(active === i ? null : i)}><span className="tile-face"><d.icon aria-hidden="true"/></span></button>)}
          </div>
        </div>
        <div className="hero-summary" id="hero-discipline" aria-live="polite" aria-atomic="true">
          <p key={choice?.key || "overview"} className="scene-description">{choice ? <>{choice.text}{" "}<Link to={choice.to}>{choice.label} <ArrowUpRight size={13}/></Link></> : "Book services, websites, automation and creative expertise for authors and businesses ready to move their work forward."}</p>
        </div>
        <div className="hero-actions"><Link className="btn-primary" to="/start-a-project">Start a Project</Link><Link className="btn-ghost" to="/work">Explore Our Work</Link></div>
      </div>
      <a className="scroll-tab" href="#studio-intro">Scroll for more <span><ArrowDown size={13}/></span></a>
      <button type="button" className="scene-playback" onClick={toggleMotion} aria-label={paused ? "Play hero animation" : "Pause hero animation"} title={paused ? "Play hero animation" : "Pause hero animation"}>
        {paused ? <Play size={14}/> : <Pause size={14}/>}
      </button>
    </section>
  </div>;
}
