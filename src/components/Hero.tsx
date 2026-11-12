import { hero, profile, stack } from "../content/profile";
import { scrollToId } from "../lib/hooks";
import { ArrowDown, container } from "./ui";

export function Hero() {
  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col pt-28 sm:pt-32">
      <div className={`${container} flex flex-1 flex-col justify-center`}>
        <div className="fade-in mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-accent/30 bg-accent-soft/70 px-3 py-1.5 backdrop-blur" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="relative inline-flex size-1.5">
            <span className="animate-ping-slow absolute inset-0 rounded-full bg-accent" />
            <span className="relative size-1.5 rounded-full bg-accent shadow-[0_0_12px_2px_#5cf2c859]" />
          </span>
          <span className="eyebrow !text-accent">{profile.status}</span>
        </div>

        <p className="fade-in eyebrow mb-6" style={{ "--i": 1 } as React.CSSProperties}>
          {profile.name} — {hero.eyebrow}
        </p>

        <h1 className="max-w-[16ch] text-[clamp(2.75rem,7.2vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-ink">
          {hero.headline.map((line, i) => (
            <span key={line} className="line-mask">
              <span style={{ "--i": i + 1 } as React.CSSProperties}>
                {i === hero.headline.length - 1 ? <em className="font-light not-italic text-accent">{line}</em> : line}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,32rem)_auto] md:items-end md:justify-between">
          <p className="fade-in text-lg leading-relaxed text-ink-muted sm:text-xl" style={{ "--i": 4 } as React.CSSProperties}>
            {hero.lead}
          </p>
          <div className="fade-in flex flex-wrap gap-3" style={{ "--i": 5 } as React.CSSProperties}>
            <button
              onClick={() => scrollToId("work")}
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition-colors duration-150 hover:bg-accent hover:text-on-accent"
            >
              View work
            </button>
            <button
              onClick={() => scrollToId("contact")}
              className="rounded-full border border-line-strong bg-surface/40 px-6 py-3 text-sm font-medium text-ink backdrop-blur transition-colors duration-150 hover:border-ink"
            >
              Start a project
            </button>
          </div>
        </div>
      </div>

      <div className={`${container} fade-in mt-16 pb-8`} style={{ "--i": 6 } as React.CSSProperties}>
        <div className="flex items-end justify-between gap-6 border-t border-line pt-6">
          <dl className="grid flex-1 grid-cols-3 gap-4 sm:max-w-xl">
            {hero.stats.map((s) => (
              <div key={s.label}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">{s.label}</dt>
                <dd className="mt-1 text-base font-semibold text-ink sm:text-lg">{s.value}</dd>
              </div>
            ))}
          </dl>
          <button
            onClick={() => scrollToId("about")}
            className="hidden items-center gap-3 text-ink-faint transition-colors hover:text-ink sm:flex"
            aria-label="Scroll to about"
          >
            <span className="eyebrow">Scroll</span>
            <span className="relative h-10 w-px overflow-hidden bg-line">
              <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-accent" />
            </span>
            <ArrowDown className="size-4" />
          </button>
        </div>
      </div>

      <Marquee items={stack} />
    </section>
  );
}

function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee-wrap relative overflow-hidden border-y border-line bg-surface/60 py-4 backdrop-blur-sm [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <ul className="marquee flex w-max gap-10" aria-label="Tech stack">
        {row.map((t, i) => (
          <li key={i} aria-hidden={i >= items.length} className="flex items-center gap-10 font-mono text-sm uppercase tracking-[0.18em] text-ink-muted">
            {t}
            <span className="size-1 rounded-full bg-accent/60" />
          </li>
        ))}
      </ul>
    </div>
  );
}
