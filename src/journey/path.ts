import * as THREE from "three";
import { experience, work } from "../content/profile";

/**
 * The journey: one camera path through the scene, split into chapters.
 *
 * Each chapter adds camera waypoints. The curve passes through every waypoint,
 * and waypoint i sits at curve parameter u = i / (count - 1). Scrolling through a
 * chapter moves the camera from the previous chapter's last waypoint to its own
 * last waypoint.
 */

type V = [number, number, number];

const PROJECTS = work.projects.length;
const ROLES = experience.roles.length + 1; // + education

/** Camera stop in front of project i: weaves left and right down the road. */
export const projectSide = (i: number) => (i % 2 === 0 ? 1 : -1);
const projectStop = (i: number): V => [projectSide(i) * 1.2, 0, -6 - i * 10];

export type Chapter = {
  id: string;
  label: string;
  /** Scroll length in viewport heights. */
  vh: number;
  points: V[];
  /** Where a nav jump lands, as a fraction of the chapter. */
  focus: number;
};

const START: V = [0, 0, 7];

export const chapters: Chapter[] = [
  { id: "home", label: "Origin", vh: 110, points: [[0.4, 0.05, 6.3]], focus: 0 },
  { id: "about", label: "About", vh: 170, points: [[3.8, 0.35, 4.6]], focus: 0.55 },
  {
    id: "work",
    label: "Selected work",
    vh: PROJECTS * 80 + 60,
    // One stop per project, then an exit point so the last project isn't cut off by the fade-out.
    points: [...Array.from({ length: PROJECTS }, (_, i) => projectStop(i)), [0, 0.4, -6 - PROJECTS * 10 + 4]],
    focus: 1 / (PROJECTS + 1),
  },
  { id: "capabilities", label: "Capabilities", vh: 170, points: [[0, 1, -80]], focus: 0.5 },
  {
    id: "experience",
    label: "Experience",
    vh: 260,
    points: [[1.4, 0.2, -92], [-1.4, -0.2, -104], [0, 0, -116]],
    focus: 0.3,
  },
  { id: "contact", label: "Contact", vh: 190, points: [[0, 0, -126]], focus: 1 },
];

const waypoints: V[] = [START, ...chapters.flatMap((c) => c.points)];
export const curve = new THREE.CatmullRomCurve3(
  waypoints.map((p) => new THREE.Vector3(...p)),
  false,
  "centripetal",
);
const du = 1 / (waypoints.length - 1);

/** Curve parameter range [from, to] covered by each chapter. */
export const chapterU = (() => {
  let idx = 0;
  return chapters.map((c) => {
    const from = idx * du;
    idx += c.points.length;
    return [from, idx * du] as const;
  });
})();

/** Camera curve parameter for chapter i at local progress p (0..1). */
export function uFor(i: number, p: number) {
  const n = chapters[i].points.length;
  const q = p * n;
  const seg = Math.min(n - 1, Math.floor(q));
  const f = Math.min(1, q - seg);
  // Ease within each segment so the camera lingers near each stop without stopping.
  const s = f * f * (3 - 2 * f);
  const eased = f + (s - f) * 0.75;
  return chapterU[i][0] + (seg + eased) * du;
}

/** Index of the project in view at work-chapter progress p. */
export function projectIndex(p: number) {
  return Math.min(PROJECTS - 1, Math.max(0, Math.round(p * (PROJECTS + 1)) - 1));
}

/** Work-chapter progress at which project i is in view. */
export const projectFocus = (i: number) => (i + 1) / (PROJECTS + 1);

// ---- Scene anchors ----

export const corePosition = new THREE.Vector3(0, 0, 0);

/** Each screenshot hangs ahead of its camera stop, to the stop's side, facing the camera. */
export const projectPanels = Array.from({ length: PROJECTS }, (_, i) => {
  const [x, y, z] = projectStop(i);
  const s = projectSide(i);
  return {
    position: new THREE.Vector3(x + s * 1.2, y + 0.2, z - 7.2),
    lookAt: new THREE.Vector3(x, y, z + 1),
  };
});

export const capabilityCluster = new THREE.Vector3(0, 1.2, -88);

/** Experience milestones along the road. */
export const milestones = Array.from({ length: ROLES }, (_, j) => {
  const i = chapters.findIndex((c) => c.id === "experience");
  const [a, b] = chapterU[i];
  const u = Math.min(1, a + ((j + 0.8) / (ROLES + 0.5)) * (b - a));
  const p = curve.getPoint(u);
  return new THREE.Vector3(p.x - 1.8, p.y - 0.5, p.z - 4);
});

export const destination = new THREE.Vector3(0, 0, -136);
