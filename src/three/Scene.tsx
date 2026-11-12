import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { store } from "../lib/store";
import { coreFragment, coreVertex, particleFragment, particleVertex } from "./shaders";

const ACCENT = new THREE.Color("#5cf2c8");
const BASE = new THREE.Color("#0b1513");

// Where the core sits as the page scrolls. Each key is anchored to a point inside a
// section (`at` = 0 its top, 1 its bottom) reaching the middle of the viewport, so the
// path follows the real layout. x/y are fractions of the viewport's width/height.
type Key = { id: string; at: number; x: number; y: number; s: number; amp: number };
const DESKTOP: Key[] = [
  { id: "home", at: 0.0, x: 0.3, y: 0.0, s: 0.95, amp: 0.17 }, // right of the headline
  { id: "about", at: 0.5, x: -0.27, y: 0.02, s: 0.8, amp: 0.3 }, // left of the statement
  { id: "work", at: 0.12, x: 0.43, y: 0.22, s: 0.36, amp: 0.2 }, // tucked at the edge of the list
  { id: "work", at: 0.88, x: 0.43, y: -0.2, s: 0.36, amp: 0.2 },
  { id: "experience", at: 0.25, x: -0.3, y: 0.05, s: 0.62, amp: 0.26 }, // the empty left column
  { id: "experience", at: 0.8, x: -0.3, y: -0.05, s: 0.62, amp: 0.26 },
  { id: "contact", at: 0.3, x: 0.0, y: 0.04, s: 1.2, amp: 0.34 }, // behind the closing headline
];
const MOBILE: Key[] = [
  { id: "home", at: 0.0, x: 0.3, y: 0.3, s: 0.75, amp: 0.2 }, // top-right, above the headline
  { id: "about", at: 0.5, x: 0.3, y: 0.32, s: 0.55, amp: 0.28 },
  { id: "work", at: 0.5, x: 0.34, y: 0.34, s: 0.45, amp: 0.2 },
  { id: "contact", at: 0.3, x: 0.0, y: 0.36, s: 0.8, amp: 0.32 },
];

/** Scroll offsets (px) at which each key applies. Re-measured on resize. */
function measure(keys: Key[]) {
  const vh = window.innerHeight;
  return keys.map((k) => {
    const el = document.getElementById(k.id);
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return Math.max(0, top + el.offsetHeight * k.at - vh * 0.5);
  });
}

function sample(keys: Key[], stops: number[], y: number) {
  let i = 0;
  while (i < keys.length - 2 && y > stops[i + 1]) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const span = stops[i + 1] - stops[i];
  const t = span > 0 ? THREE.MathUtils.clamp((y - stops[i]) / span, 0, 1) : 1;
  const e = t * t * (3 - 2 * t); // smoothstep
  return {
    x: THREE.MathUtils.lerp(a.x, b.x, e),
    y: THREE.MathUtils.lerp(a.y, b.y, e),
    s: THREE.MathUtils.lerp(a.s, b.s, e),
    amp: THREE.MathUtils.lerp(a.amp, b.amp, e),
  };
}

function Core() {
  const group = useRef<THREE.Group>(null!);
  const shell = useRef<THREE.LineSegments>(null!);
  const { viewport, size } = useThree();
  const mobile = size.width < 768;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.22 },
      uFreq: { value: 1.1 },
      uAccent: { value: ACCENT },
      uBase: { value: BASE },
    }),
    [],
  );

  const keys = mobile ? MOBILE : DESKTOP;
  const stops = useRef<number[]>([]);
  useEffect(() => {
    const update = () => (stops.current = measure(keys));
    update();
    // Fonts and images shift the layout after first paint, so re-measure on any body resize.
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [keys]);

  const shellGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.55, 1)), []);

  useFrame((_, dt) => {
    const motion = store.reducedMotion ? 0 : 1;
    const k = sample(keys, stops.current, store.scroll);
    const vel = THREE.MathUtils.clamp(Math.abs(store.velocity) / 40, 0, 1);

    uniforms.uTime.value += dt * motion;
    const targetAmp = k.amp + vel * 0.18 * motion + store.excite * 0.2 * motion;
    uniforms.uAmp.value = THREE.MathUtils.damp(uniforms.uAmp.value, targetAmp, 4, dt);

    const g = group.current;
    const tx = k.x * viewport.width + store.pointer.x * 0.15 * motion;
    const ty = k.y * viewport.height + store.pointer.y * 0.1 * motion;
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 3, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, ty, 3, dt);
    const s = THREE.MathUtils.damp(g.scale.x, k.s * (mobile ? viewport.width / 3.4 : Math.min(1.2, viewport.width / 9)), 3, dt);
    g.scale.setScalar(s);

    g.rotation.y += dt * 0.12 * motion + store.velocity * 0.0006 * motion;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, store.pointer.y * 0.3 * motion, 2, dt);

    shell.current.rotation.y -= dt * 0.08 * motion;
    shell.current.rotation.z += dt * 0.04 * motion;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1, mobile ? 64 : 128]} />
        <shaderMaterial vertexShader={coreVertex} fragmentShader={coreFragment} uniforms={uniforms} />
      </mesh>
      <lineSegments ref={shell} geometry={shellGeo}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.14} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

function Particles({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null!);
  const { gl } = useThree();

  const [positions, scales, seeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    const sd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // A wide, flattened shell so the field reads as depth behind the content.
      const r = 3 + Math.random() * 9;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th) * 1.6;
      pos[i * 3 + 1] = r * Math.cos(ph) * 1.2;
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) - 4;
      sc[i] = 0.4 + Math.random() * 1.2;
      sd[i] = Math.random();
    }
    return [pos, sc, sd];
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 42 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uColor: { value: new THREE.Color("#9fe9d4") },
    }),
    [gl],
  );

  useFrame((_, dt) => {
    const motion = store.reducedMotion ? 0 : 1;
    uniforms.uTime.value += dt * motion;
    const p = points.current;
    p.rotation.y += dt * 0.015 * motion;
    // Parallax: the field drifts up as the page scrolls, slower than the content.
    p.position.y = THREE.MathUtils.damp(p.position.y, store.progress * 6 * motion, 2, dt);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rig() {
  useFrame((state, dt) => {
    const motion = store.reducedMotion ? 0 : 1;
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, store.pointer.x * 0.35 * motion, 2, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, store.pointer.y * 0.2 * motion, 2, dt);
    cam.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      className="!fixed inset-0 -z-10"
      style={{ position: "fixed", pointerEvents: "none" }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <Rig />
      <Particles count={mobile ? 500 : 1400} />
      <Core />
    </Canvas>
  );
}
