import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { store } from "./store";
import { chapters, uFor } from "../journey/path";

let lenis: Lenis | null = null;

/** Smooth scroll that feeds the scroll offset and velocity into the shared store. */
export function useSmoothScroll() {
  useEffect(() => {
    if (store.reducedMotion) {
      const onScroll = () => {
        store.scroll = window.scrollY;
        store.velocity = 0;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      jumpToHash();
      return () => window.removeEventListener("scroll", onScroll);
    }

    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on("scroll", (l: Lenis) => {
      store.scroll = l.scroll;
      store.velocity = l.velocity;
    });
    let raf = 0;
    const loop = (t: number) => {
      lenis?.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    jumpToHash();
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

function jumpToHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (id) requestAnimationFrame(() => scrollToChapter(id, undefined, true));
}

/** Scroll offset (px) where a chapter starts, and its scrollable length. */
export function chapterRange(i: number) {
  const vh = window.innerHeight;
  let start = 0;
  for (let k = 0; k < i; k++) start += (chapters[k].vh / 100) * vh;
  const len = (chapters[i].vh / 100) * vh;
  // The last chapter ends when the page bottom is reached, one viewport early.
  return { start, len: i === chapters.length - 1 ? len - vh : len };
}

/** Travel to a chapter (by id), optionally to a specific local progress. */
export function scrollToChapter(id: string, p?: number, immediate = false) {
  const i = chapters.findIndex((c) => c.id === id);
  if (i < 0) return;
  const { start, len } = chapterRange(i);
  const y = start + len * (p ?? chapters[i].focus);
  if (lenis) lenis.scrollTo(y, { immediate, duration: 2.2, force: true });
  else window.scrollTo({ top: y, behavior: immediate || store.reducedMotion ? "auto" : "smooth" });
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

type Listener = (p: number) => void;
const listeners = new Map<string, Set<Listener>>();

/** Subscribe to a chapter's local progress, called every frame. */
export function useChapterProgress(id: string, cb: Listener) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    const fn: Listener = (p) => ref.current(p);
    if (!listeners.has(id)) listeners.set(id, new Set());
    listeners.get(id)!.add(fn);
    return () => void listeners.get(id)!.delete(fn);
  }, [id]);
}

/**
 * The frame loop that drives the journey: from the scroll offset it works out each
 * chapter's progress, fades the chapter panels in and out, and sets the camera
 * position on the curve for the scene.
 */
export function useJourney(panels: React.RefObject<(HTMLElement | null)[]>, onChapter: (i: number) => void) {
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const y = store.scroll;
      let active = 0;
      chapters.forEach((c, i) => {
        const { start, len } = chapterRange(i);
        const p = clamp01((y - start) / len);
        store.chapterP[i] = p;
        if (y >= start) active = i;

        const fadeIn = i === 0 ? 1 : smooth(0, 0.14, p);
        const fadeOut = i === chapters.length - 1 ? 1 : 1 - smooth(0.86, 1, p);
        const o = Math.min(fadeIn, fadeOut);
        const el = panels.current?.[i];
        if (el) {
          const shift = (1 - fadeIn) * 48 - (1 - fadeOut) * 48;
          el.style.opacity = String(o);
          el.style.transform = `translate3d(0, ${shift}px, 0) scale(${0.97 + 0.03 * o})`;
          el.style.filter = o < 0.999 ? `blur(${(1 - o) * 8}px)` : "";
          const hidden = o < 0.02;
          el.style.visibility = hidden ? "hidden" : "visible";
          el.toggleAttribute("inert", o < 0.5);
        }
        listeners.get(c.id)?.forEach((fn) => fn(p));
      });

      store.chapter = active;
      store.u = uFor(active, store.chapterP[active]);
      if (active !== last) {
        last = active;
        onChapter(active);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [panels, onChapter]);
}
