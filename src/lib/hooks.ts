import { useEffect } from "react";
import Lenis from "lenis";
import { store } from "./store";

let lenis: Lenis | null = null;

/** Smooth scroll, and feed scroll progress and velocity into the shared store. */
export function useSmoothScroll() {
  useEffect(() => {
    const update = (scroll: number, limit: number, velocity: number) => {
      store.scroll = scroll;
      store.progress = limit > 0 ? scroll / limit : 0;
      store.velocity = velocity;
    };

    if (store.reducedMotion) {
      const onScroll = () => {
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        update(window.scrollY, limit, 0);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } });
    lenis.on("scroll", (l: Lenis) => update(l.scroll, l.limit, l.velocity));
    let raf = 0;
    const loop = (t: number) => {
      lenis?.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Honour deep links such as /#work on first load.
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const target = hash ? document.getElementById(hash) : null;
    if (target) lenis.scrollTo(target, { offset: -72, immediate: true, force: true });

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.4 });
  else el.scrollIntoView({ behavior: store.reducedMotion ? "auto" : "smooth" });
}

/** Adds .is-in to every [data-reveal] element once it enters the viewport. */
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
