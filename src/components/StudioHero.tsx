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
    let inView = true;
    let pointer: { x: number; y: number } | null = null;

    function draw() {
      frame = 0;
      if (!element || !motion.matches || !inView) return;
      const rect = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
      const x = pointer ? Math.max(-1, Math.min(1, 2 * (pointer.x - rect.left) / rect.width - 1)) : 0;
      const y = pointer ? Math.max(-1, Math.min(1, 2 * (pointer.y - rect.top) / rect.height - 1)) : 0;
      element.style.setProperty("--scene-x", x.toFixed(4));
      element.style.setProperty("--scene-y", y.toFixed(4));
      element.style.setProperty("--scene-travel", progress.toFixed(4));
      element.classList.toggle("scene-tracking", Boolean(pointer));
    }
    function schedule() {
      if (!frame && motion.matches && inView) frame = requestAnimationFrame(draw);
    }
    function leave() { pointer = null; schedule(); }
    function move(event: PointerEvent) {
      if (!finePointer.matches || !motion.matches || event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    }
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      element.classList.toggle("scene-offscreen", !inView);
      if (!inView) pointer = null;
      schedule();
    });
    observer?.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave);
    motion.addEventListener("change", leave);
    schedule();
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      motion.removeEventListener("change", leave);
      cancelAnimationFrame(frame);
      element.classList.remove("scene-offscreen", "scene-tracking");
      for (const variable of ["--scene-x", "--scene-y", "--scene-travel"]) element.style.removeProperty(variable);
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
      <div className="scene-cursor-light" aria-hidden="true"/>
      <div className="hero-copy">
        <p className="hero-tag"><Sparkles size={17} strokeWidth={2.2}/>Publishing, Digital &amp; Growth</p>
        <div className="scene-lockup">
          <h1 id="hero-title" aria-label="Build your next chapter.">
            <span className="kinetic-word" aria-hidden="true"><span>Build</span></span>{" "}
            <span className="kinetic-word" aria-hidden="true"><span>your</span></span><br/>
            <span className="kinetic-word" aria-hidden="true"><span>next</span></span>{" "}
            <span className="kinetic-word" aria-hidden="true"><span>chapter.</span></span>
          </h1>
          <div role="group" aria-label="Explore a studio discipline" className="studio-objects" data-discipline={choice?.key}>
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
