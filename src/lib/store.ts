// Mutable, non-React state shared between the DOM and the WebGL scene.
// The scene reads it every frame in useFrame, so it must not trigger re-renders.
export const store = {
  /** Page scroll offset in px. */
  scroll: 0,
  /** Lenis scroll velocity (px per frame, signed). */
  velocity: 0,
  /** Camera position along the journey curve, 0..1. */
  u: 0,
  /** Index of the chapter currently in view. */
  chapter: 0,
  /** Local progress (0..1) of each chapter. */
  chapterP: [] as number[],
  /** Project in view during the work chapter. */
  project: 0,
  /** Experience row in view. */
  role: 0,
  /** Pointer in normalized device coords, -1..1. */
  pointer: { x: 0, y: 0 },
  reducedMotion:
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}
