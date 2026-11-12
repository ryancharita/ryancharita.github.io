import { useEffect, useRef, useState } from "react";
import { work, type Project } from "../content/profile";
import { store } from "../lib/store";
import { ArrowUpRight, SectionHeader, container } from "./ui";

/**
 * Project index. On pointer devices, hovering a row shows its screenshot in a
 * preview that trails the cursor; on touch screens each row shows its image inline.
 */
export function Work() {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = preview.current;
    if (!el) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      const tilt = Math.max(-8, Math.min(8, (tx - x) * 0.08));
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    store.excite = active === null ? 0 : 1;
  }, [active]);

  return (
    <section id="work" className="py-24 sm:py-32">
      <div className={container}>
        <SectionHeader index="02" eyebrow={work.eyebrow} title={work.title} />
        <ol onPointerLeave={() => setActive(null)} className="border-b border-line">
          {work.projects.map((p, i) => (
            <Row key={p.name} project={p} index={i} onEnter={() => setActive(i)} dimmed={active !== null && active !== i} />
          ))}
        </ol>
      </div>

      {/* Cursor-trailing preview, pointer devices only. */}
      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 hidden w-[min(28vw,420px)] [@media(hover:hover)]:block"
      >
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line-strong bg-surface-raised shadow-2xl shadow-black/60 transition-[opacity,scale] duration-500 ease-out-expo"
          style={{ opacity: active === null ? 0 : 1, scale: active === null ? "0.85" : "1" }}
        >
          {work.projects.map((p, i) => (
            <img
              key={p.name}
              src={p.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
              style={{ opacity: active === i ? 1 : 0 }}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ project: p, index, onEnter, dimmed }: { project: Project; index: number; onEnter: () => void; dimmed: boolean }) {
  const Inner = p.href ? "a" : "div";
  return (
    <li data-reveal style={{ "--i": index } as React.CSSProperties} onPointerEnter={onEnter}>
      <Inner
        {...(p.href ? { href: p.href, target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-3 border-t border-line py-6 transition-opacity duration-300 sm:grid-cols-[3.5rem_1.4fr_1fr_1fr_auto] sm:py-8 ${dimmed ? "opacity-35" : "opacity-100"}`}
      >
        <span className="font-mono text-sm text-ink-faint">{String(index + 1).padStart(2, "0")}</span>
        <div className="min-w-0">
          <h3 className="text-[clamp(1.5rem,3.2vw,2.75rem)] font-semibold leading-none tracking-[-0.035em] text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-2 group-hover:text-accent">
            {p.name}
          </h3>
          <p className="mt-2 text-sm text-ink-muted sm:hidden">{p.description}</p>
        </div>
        <p className="hidden text-sm leading-snug text-ink-muted sm:block">{p.description}</p>
        <ul className="col-span-3 col-start-2 row-start-2 flex flex-wrap gap-2 sm:col-span-1 sm:col-start-auto sm:row-start-auto sm:justify-end">
          {p.tech.map((t) => (
            <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              {t}
            </li>
          ))}
        </ul>
        <span
          className={`col-start-3 row-start-1 inline-flex size-10 items-center justify-center rounded-full border transition-colors duration-150 sm:col-start-auto sm:row-start-auto ${
            p.href ? "border-line-strong text-ink-muted group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent" : "border-transparent text-ink-faint"
          }`}
          aria-hidden
        >
          {p.href ? <ArrowUpRight className="size-4" /> : <span className="font-mono text-[9px] uppercase tracking-wider">Private</span>}
        </span>
        <img
          src={p.image}
          alt={`${p.name} screenshot`}
          loading="lazy"
          className="col-span-3 mt-2 aspect-[16/10] w-full rounded-lg border border-line object-cover [@media(hover:hover)]:hidden"
        />
      </Inner>
    </li>
  );
}
