import { useRef, useState } from "react";
import { capabilities, contact, experience, hero, intro, profile, stack, work } from "../content/profile";
import { scrollToChapter, useChapterProgress } from "../lib/hooks";
import { store } from "../lib/store";
import { projectFocus, projectIndex, projectSide } from "../journey/path";
import { ArrowDown, ArrowUpRight, container } from "./ui";

function Label({ n, children, className = "" }: { n: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={`eyebrow ${className}`}>
      <span className="text-accent">{n}</span> / {children}
    </p>
  );
}

const primaryBtn =
  "inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition-colors duration-150 hover:bg-accent hover:text-on-accent";
const secondaryBtn =
  "inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/40 px-6 py-3 text-sm font-medium text-ink backdrop-blur transition-colors duration-150 hover:border-ink";

export function HomeChapter() {
  return (
    <div className="flex h-full flex-col pt-24 sm:pt-28">
      <div className={`${container} flex flex-1 flex-col justify-end pb-10 md:justify-center md:pb-0`}>
        <div className="fade-in mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-accent/30 bg-accent-soft/70 px-3 py-1.5 backdrop-blur" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="relative inline-flex size-1.5">
            <span className="animate-ping-slow absolute inset-0 rounded-full bg-accent" />
            <span className="relative size-1.5 rounded-full bg-accent shadow-[0_0_12px_2px_#5cf2c859]" />
          </span>
          <span className="eyebrow !text-accent">{profile.status}</span>
        </div>
        <p className="fade-in eyebrow mb-5" style={{ "--i": 1 } as React.CSSProperties}>
          {profile.name} — {hero.eyebrow}
        </p>
        <h1 className="max-w-[16ch] text-[clamp(2.6rem,7vw,7.25rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-ink">
          {hero.headline.map((line, i) => (
            <span key={line} className="line-mask">
              <span style={{ "--i": i + 1 } as React.CSSProperties}>
                {i === hero.headline.length - 1 ? <em className="font-light not-italic text-accent">{line}</em> : line}
              </span>
            </span>
          ))}
        </h1>
        <p className="fade-in mt-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-xl" style={{ "--i": 4 } as React.CSSProperties}>
          {hero.lead}
        </p>
        <div className="fade-in mt-8 flex flex-wrap gap-3" style={{ "--i": 5 } as React.CSSProperties}>
          <button onClick={() => scrollToChapter("work")} className={primaryBtn}>
            Jump to work
          </button>
          <button onClick={() => scrollToChapter("contact")} className={secondaryBtn}>
            Start a project
          </button>
        </div>
      </div>

      <div className={`${container} fade-in`} style={{ "--i": 6 } as React.CSSProperties}>
        <div className="flex items-end justify-between gap-6 border-t border-line py-5">
          <dl className="grid flex-1 grid-cols-3 gap-4 sm:max-w-xl">
            {hero.stats.map((s) => (
              <div key={s.label}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">{s.label}</dt>
                <dd className="mt-1 text-sm font-semibold text-ink sm:text-lg">{s.value}</dd>
              </div>
            ))}
          </dl>
          <button onClick={() => scrollToChapter("about")} className="hidden items-center gap-3 text-ink-faint transition-colors hover:text-ink sm:flex">
            <span className="eyebrow">Scroll to begin</span>
            <span className="relative h-10 w-px overflow-hidden bg-line">
              <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-accent" />
            </span>
            <ArrowDown className="size-4" />
          </button>
        </div>
      </div>
      <Marquee items={stack} />
    </div>
  );
}

function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee-wrap relative overflow-hidden border-t border-line py-3.5 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <ul className="marquee flex w-max gap-10" aria-label="Tech stack">
        {row.map((t, i) => (
          <li key={i} aria-hidden={i >= items.length} className="flex items-center gap-10 font-mono text-xs uppercase tracking-[0.18em] text-ink-muted sm:text-sm">
            {t}
            <span className="size-1 rounded-full bg-accent/60" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AboutChapter() {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = `${intro.statement} ${intro.accent}`.split(" ");
  const accentFrom = intro.statement.split(" ").length;

  // Words light up as the chapter progresses.
  useChapterProgress("about", (p) => {
    const spans = ref.current?.children;
    if (!spans) return;
    const lit = ((p - 0.1) / 0.55) * spans.length;
    for (let i = 0; i < spans.length; i++) {
      (spans[i] as HTMLElement).style.opacity = String(0.16 + 0.84 * Math.min(1, Math.max(0, lit - i)));
    }
  });

  return (
    <div className={`${container} flex h-full flex-col justify-end pb-16 md:items-end md:justify-center md:pb-0`}>
      <div className="max-w-2xl">
        <Label n="01">{intro.eyebrow}</Label>
        <p ref={ref} className="mt-6 text-[clamp(1.75rem,3.8vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.035em]">
          {words.map((w, i) => (
            <span key={i} className={i >= accentFrom ? "text-accent" : "text-ink"} style={{ opacity: 0.16 }}>
              {w}{" "}
            </span>
          ))}
        </p>
        <p className="mt-8 text-base leading-relaxed text-ink-muted sm:text-lg">{intro.body}</p>
      </div>
    </div>
  );
}

export function WorkChapter() {
  const [i, setI] = useState(0);
  useChapterProgress("work", (p) => {
    const idx = projectIndex(p);
    store.project = idx;
    if (idx !== i) setI(idx);
  });
  const p = work.projects[i];
  const n = work.projects.length;
  // The screenshot sits on side projectSide(i); the caption takes the other half.
  const captionRight = projectSide(i) < 0;

  return (
    <div className={`${container} flex h-full flex-col justify-end pb-10 md:justify-center md:pb-0 ${captionRight ? "md:items-end" : "md:items-start"}`}>
      <div key={i} className="caption-in w-full max-w-md rounded-2xl border border-line bg-surface/85 p-6 backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between">
          <Label n="02">{work.eyebrow}</Label>
          <span className="font-mono text-xs text-ink-faint">
            <span className="text-ink">{String(i + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent">{p.category}</p>
        <h2 className="mt-2 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-none tracking-[-0.04em] text-ink">{p.name}</h2>
        <p className="mt-4 text-ink-muted">{p.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {p.tech.map((t) => (
            <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between gap-4">
          {p.href ? (
            <a href={p.href} target="_blank" rel="noopener noreferrer" className={primaryBtn}>
              Visit site <ArrowUpRight className="size-4" />
            </a>
          ) : (
            <span className="eyebrow">Private codebase</span>
          )}
          <ol className="flex gap-1.5" aria-label="Projects">
            {work.projects.map((proj, k) => (
              <li key={proj.name}>
                <button
                  onClick={() => scrollToChapter("work", projectFocus(k))}
                  aria-label={proj.name}
                  aria-current={k === i}
                  className={`block h-1.5 rounded-full transition-all duration-300 ${k === i ? "w-6 bg-accent" : "w-1.5 bg-line-strong hover:bg-ink-faint"}`}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function CapabilitiesChapter() {
  return (
    <div className={`${container} flex h-full flex-col justify-end gap-6 pb-8 sm:pb-12`}>
      <div className="grid gap-3 md:grid-cols-[1fr_2fr] md:items-end">
        <Label n="03">{capabilities.eyebrow}</Label>
        <h2 className="text-[clamp(1.9rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink">{capabilities.title}</h2>
      </div>
      <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
        {capabilities.groups.map((g, i) => (
          <li key={g.name} className="rounded-2xl border border-line bg-surface/70 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{g.name}</h3>
              <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <p className="eyebrow mt-1">{g.tagline}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">{g.skills.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExperienceChapter() {
  const rows = [...experience.roles, { ...experience.education, summary: "Education" }];
  const [active, setActive] = useState(0);
  useChapterProgress("experience", (p) => {
    const idx = Math.min(rows.length - 1, Math.max(0, Math.floor(((p - 0.08) / 0.8) * rows.length)));
    store.role = idx;
    if (idx !== active) setActive(idx);
  });

  return (
    <div className={`${container} flex h-full flex-col justify-end pb-8 md:items-end md:justify-center md:pb-0`}>
      <div className="w-full max-w-xl">
        <Label n="04">{experience.eyebrow}</Label>
        <h2 className="mt-4 text-[clamp(1.9rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink">{experience.title}</h2>
        <ol className="mt-6 border-l border-line">
          {rows.map((r, j) => (
            <li
              key={`${r.org}-${r.title}`}
              className={`relative py-2 pl-5 transition-[opacity] duration-500 ${j <= active ? "opacity-100" : "opacity-30"}`}
            >
              <span
                className={`absolute top-3.5 -left-[4.5px] size-2 rounded-full transition-colors duration-300 ${j === active ? "bg-accent shadow-[0_0_12px_2px_#5cf2c859]" : j < active ? "bg-ink-faint" : "bg-line-strong"}`}
              />
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{r.dates}</p>
              <h3 className="text-sm font-semibold text-ink sm:text-base">
                {r.title}
                <span className="font-normal text-ink-muted"> · {r.org}</span>
              </h3>
              <div className={`grid transition-[grid-template-rows] duration-500 ease-out-soft ${j === active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <p className="overflow-hidden text-sm text-ink-muted">{r.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function ContactChapter() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("Project enquiry")}`;

  return (
    <div className={`${container} flex h-full flex-col`}>
      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        {/* A soft dark pool behind the text so it reads over the bright core. */}
        <div aria-hidden className="absolute inset-x-[-10%] top-1/2 -z-10 h-[80%] -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(5_6_7/0.78),transparent)]" />
        <Label n="05">{contact.eyebrow} — you've arrived</Label>
        <h2 className="mt-6 max-w-5xl text-[clamp(2.5rem,7.5vw,7rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-ink">
          {contact.headline[0]}
          <br />
          <span className="font-light text-accent">{contact.headline[1]}</span>
        </h2>
        <p className="mt-6 max-w-xl text-base text-ink-muted sm:text-lg">{contact.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={mailto} className={primaryBtn}>
            Send me a note <ArrowUpRight className="size-4" />
          </a>
          <button onClick={copy} className={secondaryBtn}>
            {copied ? "Copied" : "Copy email"}
          </button>
          <a href={profile.resume} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
            Résumé <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
      <footer className="flex flex-col gap-4 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={() => scrollToChapter("home", 0)} className="text-left text-sm text-ink-muted hover:text-ink">
          © {new Date().getFullYear()} {profile.name} · Back to the start ↑
        </button>
        <ul className="flex gap-6">
          {profile.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-accent">
                {s.label} <ArrowUpRight className="size-3.5" />
              </a>
            </li>
          ))}
          <li>
            <span className="text-sm text-ink-faint">{profile.email}</span>
          </li>
        </ul>
      </footer>
    </div>
  );
}
