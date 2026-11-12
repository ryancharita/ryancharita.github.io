import type { ReactNode, SVGProps } from "react";

export function ArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ArrowDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

export function SectionHeader({ index, eyebrow, title }: { index: string; eyebrow: string; title: ReactNode }) {
  return (
    <div className="mb-12 grid gap-4 border-t border-line pt-6 md:mb-16 md:grid-cols-[1fr_2fr]" data-reveal>
      <p className="eyebrow">
        <span className="text-accent">{index}</span> / {eyebrow}
      </p>
      <h2 className="text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink">
        {title}
      </h2>
    </div>
  );
}

export const container = "mx-auto w-full max-w-[1280px] px-4 sm:px-8";
