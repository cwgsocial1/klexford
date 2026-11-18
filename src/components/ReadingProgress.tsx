import { useEffect, useRef } from "react";

export default function ReadingProgress() {
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    let frame = 0;
    let range = 0;

    function update() {
      frame = 0;
      const fraction = range ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
      element!.style.setProperty("--read", String(fraction));
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function measure() {
      range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      element!.hidden = range < window.innerHeight * .5;
      onScroll();
    }

    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      resize?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div className="reading-progress" ref={rail} aria-hidden="true" hidden><span/></div>;
}
