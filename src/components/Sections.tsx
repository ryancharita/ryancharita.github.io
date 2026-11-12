import { useState } from "react";
import { capabilities, contact, experience, process, profile, type TimelineEntry } from "../content/profile";
import { scrollToId } from "../lib/hooks";
import { ArrowUpRight, SectionHeader, container } from "./ui";

export function Capabilities() {
  return (
    <section id="capabilities" className="py-24 sm:py-32">
      <div className={container}>
        <SectionHeader index="03" eyebrow={capabilities.eyebrow} title={capabilities.title} />
        <ul className="grid gap-4 md:grid-cols-3">
          {capabilities.groups.map((g, i) => (
            <li
              key={g.name}
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
              className="group flex flex-col rounded-2xl border border-line bg-surface-raised/70 p-6 backdrop-blur-md transition-colors duration-150 hover:border-line-strong sm:p-8"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="eyebrow">{g.tagline}</span>
              </div>
              <h3 className="mt-10 text-3xl font-semibold tracking-[-0.03em] text-ink">{g.name}</h3>
              <ul className="mt-6 flex flex-col">
                {g.skills.map((s) => (
                  <li key={s} className="border-t border-line py-2.5 text-sm text-ink-muted">
                    {s}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="mt-24 grid gap-10 md:grid-cols-[1fr_2fr]">
          <p className="eyebrow" data-reveal>
            {process.eyebrow} — {process.title}
          </p>
          <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {process.steps.map((s, i) => (
              <li key={s.title} data-reveal style={{ "--i": i } as React.CSSProperties} className="bg-surface/85 p-6 backdrop-blur-md sm:p-8">
                <span className="font-mono text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Experience() {
  const rows: TimelineEntry[] = [...experience.roles, experience.education];
  return (
    <section id="experience" className="py-24 sm:py-32">
      <div className={container}>
        <SectionHeader index="04" eyebrow={experience.eyebrow} title={experience.title} />
        <ol className="md:ml-[33.333%]">
          {rows.map((r, i) => (
            <li
              key={`${r.org}-${r.title}`}
              data-reveal
              className="grid gap-2 border-t border-line py-7 sm:grid-cols-[11rem_1fr] sm:gap-8"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-ink-faint sm:pt-1.5">{r.dates}</p>
              <div>
                <h3 className="text-lg font-semibold text-ink">
                  {r.title}
                  <span className="font-normal text-ink-muted"> · {r.org}</span>
                  {i === rows.length - 1 && <span className="ml-3 eyebrow">Education</span>}
                </h3>
                {r.summary && <p className="mt-1 max-w-2xl text-ink-muted">{r.summary}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", service: contact.services[0], message: "" });

  // No backend on GitHub Pages: the form composes an email in the visitor's mail app.
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `${form.service} — ${form.name}`;
    const body = `${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ""}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const field = "w-full rounded-lg border border-ink-faint/50 bg-surface/70 px-4 py-3 text-ink placeholder:text-ink-faint backdrop-blur transition-colors focus:border-accent";

  return (
    <section id="contact" className="pt-32 pb-16 sm:pt-48">
      <div className={container}>
        <p className="eyebrow text-center" data-reveal>
          <span className="text-accent">05</span> / {contact.eyebrow}
        </p>
        <h2 className="mx-auto mt-6 max-w-5xl text-center text-[clamp(2.5rem,7.5vw,7rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-ink" data-reveal>
          {contact.headline[0]}
          <br />
          <span className="font-light text-accent">{contact.headline[1]}</span>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-center text-lg text-ink-muted" data-reveal>
          {contact.body}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3" data-reveal>
          <button
            onClick={copy}
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition-colors duration-150 hover:bg-accent hover:text-on-accent"
          >
            {copied ? "Copied to clipboard" : profile.email}
          </button>
          <a
            href={profile.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/40 px-6 py-3 text-sm font-medium text-ink backdrop-blur transition-colors hover:border-ink"
          >
            Résumé <ArrowUpRight className="size-4" />
          </a>
        </div>

        <form
          onSubmit={onSubmit}
          data-reveal
          className="mx-auto mt-20 grid max-w-3xl gap-4 rounded-2xl border border-line bg-surface-raised/60 p-6 backdrop-blur-md sm:grid-cols-2 sm:p-8"
        >
          <label className="grid gap-2">
            <span className="eyebrow">Name</span>
            <input required className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
          </label>
          <label className="grid gap-2">
            <span className="eyebrow">Email</span>
            <input type="email" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          </label>
          <label className="grid gap-2 sm:col-span-2">
            <span className="eyebrow">What do you need</span>
            <select className={field} value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
              {contact.services.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 sm:col-span-2">
            <span className="eyebrow">Message</span>
            <textarea
              required
              rows={5}
              className={`${field} resize-y`}
              placeholder="What you're building, who it's for, and when you need it."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
            <p className="text-sm text-ink-faint">Opens your mail app with this message filled in.</p>
            <button className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90">
              Send message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className={`${container} pb-10`}>
      <div className="flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={() => scrollToId("home")} className="text-left text-sm text-ink-muted hover:text-ink">
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </button>
        <ul className="flex gap-6">
          {profile.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-accent">
                {s.label}
                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${profile.email}`} className="text-sm text-ink-muted transition-colors hover:text-accent">
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
