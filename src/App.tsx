import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { profile } from "./content/profile";
import { chapters } from "./journey/path";
import { scrollToChapter, useJourney, useSmoothScroll } from "./lib/hooks";
import { store } from "./lib/store";
import {
  AboutChapter,
  CapabilitiesChapter,
  ContactChapter,
  ExperienceChapter,
  HomeChapter,
  WorkChapter,
} from "./components/Chapters";
import { container } from "./components/ui";

// three.js is the heaviest part of the bundle; load it after the first paint.
const Scene = lazy(() => import("./three/Scene"));

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const panelsById: Record<string, () => React.ReactElement> = {
  home: HomeChapter,
  about: AboutChapter,
  work: WorkChapter,
  capabilities: CapabilitiesChapter,
  experience: ExperienceChapter,
  contact: ContactChapter,
};

/**
 * The page is a tall, empty scroll track. Scrolling moves the camera along the
 * journey; each chapter's content lives in a fixed panel that fades in while the
 * camera passes that chapter's stretch of road.
 */
export default function App() {
  const [gl] = useState(webglAvailable);
  const [chapter, setChapter] = useState(0);
  const panels = useRef<(HTMLElement | null)[]>([]);

  useSmoothScroll();
  useJourney(panels, useCallback((i: number) => setChapter(i), []));

  useEffect(() => {
    const id = requestAnimationFrame(() => document.documentElement.classList.add("is-loaded"));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      {gl && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />

      {/* Scroll track: one spacer per chapter, sized to its stretch of road. */}
      <div aria-hidden>
        {chapters.map((c) => (
          <div key={c.id} id={c.id} style={{ height: `${c.vh}vh` }} />
        ))}
      </div>

      <Nav chapter={chapter} />
      <main>
        {chapters.map((c, i) => {
          const Panel = panelsById[c.id];
          return (
            <section
              key={c.id}
              ref={(el) => {
                panels.current[i] = el;
              }}
              aria-label={c.label}
              className="fixed inset-0 z-10 [&_a]:pointer-events-auto [&_button]:pointer-events-auto pointer-events-none will-change-[opacity,transform]"
              style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
            >
              <Panel />
            </section>
          );
        })}
      </main>
      <Route chapter={chapter} />
    </>
  );
}

function Nav({ chapter }: { chapter: number }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`${container} flex h-16 items-center justify-between`}>
        <button onClick={() => scrollToChapter("home", 0)} className="flex items-center gap-3" aria-label="Back to the start">
          <span className="text-lg font-bold tracking-tight text-ink">{profile.initials}</span>
          <span className="hidden text-sm text-ink-muted sm:inline">{profile.name}</span>
        </button>
        <p className="eyebrow hidden md:block" aria-live="polite">
          <span className="text-accent">{String(chapter).padStart(2, "0")}</span> — {chapters[chapter].label}
        </p>
        <button
          onClick={() => scrollToChapter("contact")}
          className="rounded-full border border-line-strong bg-surface/40 px-4 py-2 text-sm font-medium text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent"
        >
          Let's talk
        </button>
      </div>
    </header>
  );
}

/** The route: a progress rail with a stop per chapter. Vertical on the right on desktop, a bar on mobile. */
function Route({ chapter }: { chapter: number }) {
  const fill = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, store.scroll / max) : 0;
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <nav aria-label="Journey" className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 lg:block">
        <div className="relative">
          <div className="absolute top-1 right-[3.5px] bottom-1 w-px bg-line">
            <div ref={fill} className="h-full w-full origin-top bg-accent" style={{ transform: "scaleY(0)" }} />
          </div>
          <ol className="relative flex flex-col gap-7">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  onClick={() => scrollToChapter(c.id)}
                  className="group flex items-center justify-end gap-3"
                  aria-current={i === chapter ? "step" : undefined}
                >
                  <span
                    className={`eyebrow transition-all duration-300 ${
                      i === chapter ? "!text-ink opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {c.label}
                  </span>
                  <span
                    className={`block size-2 rounded-full border transition-colors duration-300 ${
                      i === chapter ? "border-accent bg-accent" : i < chapter ? "border-accent bg-surface" : "border-line-strong bg-surface"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-line lg:hidden" aria-hidden>
        <div ref={bar} className="h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
      </div>
    </>
  );
}
