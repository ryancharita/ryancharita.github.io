import { lazy, Suspense, useEffect, useState } from "react";
import { nav, profile } from "./content/profile";
import { scrollToId, useReveal, useSmoothScroll } from "./lib/hooks";
import { Hero } from "./components/Hero";
import { Intro } from "./components/Intro";
import { Work } from "./components/Work";
import { Capabilities, Contact, Experience, Footer } from "./components/Sections";
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

export default function App() {
  useSmoothScroll();
  useReveal();
  const [gl] = useState(webglAvailable);

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
      <Nav />
      <main>
        <Hero />
        <Intro />
        <Work />
        <Capabilities />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? "border-b border-line bg-surface/70 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className={`${container} flex h-16 items-center justify-between`}>
        <button onClick={() => scrollToId("home")} className="flex items-center gap-3" aria-label="Back to top">
          <span className="text-lg font-bold tracking-tight text-ink">{profile.initials}</span>
          <span className="hidden text-sm text-ink-muted sm:inline">{profile.name}</span>
        </button>
        <nav className="flex items-center gap-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollToId(n.id)}
              className="hidden rounded-full px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink md:inline-block"
            >
              {n.label}
            </button>
          ))}
          <button
            onClick={() => scrollToId("contact")}
            className="ml-2 rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Let's talk
          </button>
        </nav>
      </div>
    </header>
  );
}
