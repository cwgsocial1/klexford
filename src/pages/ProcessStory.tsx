import { useEffect, useRef } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { steps } from "../data";
import "./process-story.css";

const documents = ["Project brief", "Scope of work", "Design proof", "Handover"];

export default function ProcessStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const rows = [...section.querySelectorAll<HTMLElement>(".process-step")];
    const sheets = [...section.querySelectorAll<HTMLElement>(".process-sheet")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let observing = false;

    function draw() {
      frame = 0;
      if (!section) return;
      const readingLine = innerHeight * .56;
      const centers = rows.map(row => {
        const rect = row.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
      const next = centers.findIndex(center => center >= readingLine);
      let position = rows.length - 1;
      if (next === 0) position = 0;
      if (next > 0) position = next - 1 + (readingLine - centers[next - 1]) / (centers[next] - centers[next - 1]);

      const active = Math.round(position);
      section.style.setProperty("--process-progress", String(position / (steps.length - 1)));
      rows.forEach((row, i) => {
        if (i === active) row.setAttribute("aria-current", "step");
        else row.removeAttribute("aria-current");
      });
      sheets.forEach((sheet, i) => {
        const offset = i - position;
        const ahead = Math.max(0, Math.min(3, offset));
        const behind = Math.max(0, Math.min(1, -offset));
        sheet.style.transform = `translate(-50%, -50%) translate3d(${ahead * 3.5 - behind * 88}%, ${ahead * -6 + behind * 11}%, 0) rotate(${ahead * 4 - behind * 20 - 3}deg) scale(${1 - ahead * .045})`;
        sheet.style.opacity = String(1 - behind);
      });
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }
    function watchScroll(enable: boolean) {
      if (enable === observing) return;
      observing = enable;
      if (enable) {
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        schedule();
      } else {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }
    let intersection: IntersectionObserver | undefined;
    function configure() {
      intersection?.disconnect();
      watchScroll(false);
      if (reduced.matches) {
        rows.forEach(row => row.removeAttribute("aria-current"));
        sheets.forEach(sheet => { sheet.style.removeProperty("transform"); sheet.style.removeProperty("opacity"); });
        section?.style.removeProperty("--process-progress");
      } else if (typeof IntersectionObserver !== "undefined") {
        intersection = new IntersectionObserver(([entry]) => watchScroll(entry.isIntersecting), { rootMargin: "100px 0px" });
        intersection.observe(section!);
      } else watchScroll(true);
    }
    configure();
    reduced.addEventListener("change", configure);
    return () => {
      intersection?.disconnect();
      watchScroll(false);
      reduced.removeEventListener("change", configure);
    };
  }, []);

  return <section ref={root} id="process" className="hs-wrap hs-pad process-story" aria-labelledby="process-title">
    <div className="hs-head"><h2 id="process-title">How we work</h2></div>
    <div className="process-layout">
      <div className="process-frame" aria-hidden="true">
        <div className="process-stack">
          {documents.map((title, i) => <div key={title} className={'process-sheet sheet-' + i}>
            <span className="sheet-brand">Klexford</span>
            <div className="sheet-graphic">{i === 3 ? <Check/> : i === 1 ? <span/> : i === 0 ? <><span/><span/><span/></> : <><i/><i/><i/></>}</div>
            <div className="sheet-caption">{title}<ArrowUpRight size={18}/></div>
          </div>)}
        </div>
        <div className="process-meter"><span/></div>
      </div>
      <ol className="process-steps">{steps.map(step => <li className="process-step" key={step.n}>
        <span className="process-number">{step.n}</span>
        <div><h3>{step.title}</h3><p>{step.desc}</p></div>
      </li>)}</ol>
    </div>
  </section>;
}
