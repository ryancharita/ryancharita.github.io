import { useEffect, useRef } from "react";
import { intro } from "../content/profile";
import { container } from "./ui";

/** A statement whose words light up one by one as it scrolls through the viewport. */
export function Intro() {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = `${intro.statement} ${intro.accent}`.split(" ");
  const accentFrom = intro.statement.split(" ").length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-word]"));
    let raf = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the block's top hits 85% of the viewport, 1 when its bottom reaches 45%.
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.4)));
      const lit = p * spans.length;
      spans.forEach((s, i) => {
        s.style.opacity = String(0.16 + 0.84 * Math.min(1, Math.max(0, lit - i)));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section id="about" className="py-32 sm:py-48">
      <div className={`${container} grid gap-10 md:grid-cols-[1fr_2fr]`}>
        <p className="eyebrow" data-reveal>
          <span className="text-accent">01</span> / {intro.eyebrow}
        </p>
        <div>
          <p
            ref={ref}
            className="text-[clamp(1.9rem,4.4vw,4rem)] font-medium leading-[1.06] tracking-[-0.035em]"
          >
            {words.map((w, i) => (
              <span
                key={i}
                data-word
                className={i >= accentFrom ? "text-accent" : "text-ink"}
                style={{ opacity: 0.16, transition: "opacity 120ms linear" }}
              >
                {w}{" "}
              </span>
            ))}
          </p>
          <p className="mt-12 max-w-xl text-lg leading-relaxed text-ink-muted" data-reveal>
            {intro.body}
          </p>
        </div>
      </div>
    </section>
  );
}
