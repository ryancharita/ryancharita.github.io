import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { store } from "../lib/store";
import { work } from "../content/profile";
import {
  capabilityCluster,
  chapters,
  corePosition,
  curve,
  destination,
  milestones,
  projectPanels,
  projectSide,
} from "../journey/path";
import { coreFragment, coreVertex, particleFragment, particleVertex } from "./shaders";

const ACCENT = new THREE.Color("#5cf2c8");
const BASE = new THREE.Color("#0b1513");
const BG = "#050607";
const idOf = (i: number) => chapters[i]?.id;

function Core({ position, scale = 1, detail = 128 }: { position: THREE.Vector3; scale?: number; detail?: number }) {
  const group = useRef<THREE.Group>(null!);
  const shell = useRef<THREE.LineSegments>(null!);
  const uniforms = useMemo(
    () => ({
      uTime: { value: Math.random() * 10 },
      uAmp: { value: 0.18 },
      uFreq: { value: 1.1 },
      uAccent: { value: ACCENT },
      uBase: { value: BASE },
    }),
    [],
  );
  const shellGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.55, 1)), []);

  useFrame((_, dt) => {
    const motion = store.reducedMotion ? 0 : 1;
    uniforms.uTime.value += dt * motion;
    const vel = THREE.MathUtils.clamp(Math.abs(store.velocity) / 40, 0, 1);
    uniforms.uAmp.value = THREE.MathUtils.damp(uniforms.uAmp.value, 0.18 + vel * 0.2 * motion, 4, dt);
    group.current.rotation.y += dt * 0.12 * motion;
    shell.current.rotation.y -= dt * 0.08 * motion;
    shell.current.rotation.z += dt * 0.04 * motion;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh>
        <icosahedronGeometry args={[1, detail]} />
        <shaderMaterial vertexShader={coreVertex} fragmentShader={coreFragment} uniforms={uniforms} />
      </mesh>
      <lineSegments ref={shell} geometry={shellGeo}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.16} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

/** The road: a faint line along the whole camera path with cross ticks, below eye level. */
function Road() {
  const [line, ticks] = useMemo(() => {
    const drop = new THREE.Vector3(0, -0.9, 0);
    const pts = curve.getSpacedPoints(800).map((p) => p.add(drop));
    const t: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) {
      const u = i / 160;
      const p = curve.getPointAt(u).add(drop);
      const side = new THREE.Vector3()
        .crossVectors(curve.getTangentAt(u), new THREE.Vector3(0, 1, 0))
        .normalize()
        .multiplyScalar(0.18);
      t.push(p.clone().add(side), p.clone().sub(side));
    }
    const lineObj = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.35 }),
    );
    return [lineObj, new THREE.BufferGeometry().setFromPoints(t)];
  }, []);
  return (
    <group>
      <primitive object={line} />
      <lineSegments geometry={ticks}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.25} />
      </lineSegments>
    </group>
  );
}

/** Particles scattered in a loose tunnel around the path. */
function Particles({ count }: { count: number }) {
  const { gl } = useThree();
  const [positions, scales, seeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    const sd = new Float32Array(count);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 1.08 - 0.04;
      curve.getPointAt(THREE.MathUtils.clamp(u, 0, 1), v);
      if (u < 0) v.z += -u * 140;
      if (u > 1) v.z -= (u - 1) * 140;
      const r = 2.5 + Math.random() * 12;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = v.x + Math.cos(a) * r * 1.4;
      pos[i * 3 + 1] = v.y + Math.sin(a) * r * 0.8;
      pos[i * 3 + 2] = v.z + (Math.random() - 0.5) * 4;
      sc[i] = 0.4 + Math.random() * 1.2;
      sd[i] = Math.random();
    }
    return [pos, sc, sd];
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 46 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uColor: { value: new THREE.Color("#9fe9d4") },
    }),
    [gl],
  );
  useFrame((_, dt) => {
    uniforms.uTime.value += dt * (store.reducedMotion ? 0 : 1);
  });

  return (
    <points>
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

/** Project screenshots hanging along the road. The one in view is brighter and larger. */
function ProjectPanels() {
  const textures = useLoader(THREE.TextureLoader, work.projects.map((p) => p.image));
  useMemo(
    () =>
      textures.forEach((t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
      }),
    [textures],
  );
  const groups = useRef<THREE.Group[]>([]);
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);
  const frame = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(3.36, 2.16)), []);

  useFrame((state, dt) => {
    const inWork = idOf(store.chapter) === "work";
    groups.current.forEach((g, i) => {
      if (!g) return;
      const active = inWork && store.project === i;
      g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, active ? 1 : 0.86, 4, dt));
      const m = mats.current[i];
      if (m) m.color.setScalar(THREE.MathUtils.damp(m.color.r, active ? 1 : 0.35, 4, dt));
      if (!store.reducedMotion) {
        g.position.y = projectPanels[i].position.y + Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.06;
      }
    });
  });

  return (
    <>
      {projectPanels.map((p, i) => (
        <group
          key={i}
          ref={(g) => {
            if (!g || groups.current[i] === g) return;
            groups.current[i] = g;
            g.position.copy(p.position);
            g.lookAt(p.lookAt);
            g.rotateY(-projectSide(i) * 0.12);
          }}
        >
          <mesh>
            <planeGeometry args={[3.2, 2]} />
            <meshBasicMaterial
              ref={(m: THREE.MeshBasicMaterial | null) => {
                if (m) mats.current[i] = m;
              }}
              map={textures[i]}
              toneMapped={false}
            />
          </mesh>
          <lineSegments geometry={frame}>
            <lineBasicMaterial color={ACCENT} transparent opacity={0.35} />
          </lineSegments>
        </group>
      ))}
    </>
  );
}

/** Three rotating wireframe forms, one per capability group. */
function CapabilityForms() {
  const meshes = useRef<THREE.Mesh[]>([]);
  useFrame((_, dt) => {
    const m = store.reducedMotion ? 0 : 1;
    meshes.current.forEach((r, i) => {
      if (!r) return;
      r.rotation.x += dt * (0.15 + i * 0.05) * m;
      r.rotation.y += dt * (0.2 - i * 0.03) * m;
    });
  });
  const set = (i: number) => (m: THREE.Mesh | null) => {
    if (m) meshes.current[i] = m;
  };
  const mat = <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.45} />;
  return (
    <group position={capabilityCluster}>
      <mesh ref={set(0)} position={[-3.2, 0, 0]}>
        <icosahedronGeometry args={[1.1, 1]} />
        {mat}
      </mesh>
      <mesh ref={set(1)} position={[0, 0.6, -1.5]}>
        <torusKnotGeometry args={[0.8, 0.22, 120, 12]} />
        {mat}
      </mesh>
      <mesh ref={set(2)} position={[3.2, 0, 0]}>
        <octahedronGeometry args={[1.2, 0]} />
        {mat}
      </mesh>
    </group>
  );
}

/** Glowing markers along the road, one per role. */
function Milestones() {
  const groups = useRef<THREE.Group[]>([]);
  useFrame((_, dt) => {
    const inExp = idOf(store.chapter) === "experience";
    groups.current.forEach((g, j) => {
      if (!g) return;
      const target = inExp && j === store.role ? 1.5 : inExp && j < store.role ? 1 : 0.7;
      g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, target, 4, dt));
      g.rotation.y += dt * 0.5 * (store.reducedMotion ? 0 : 1);
    });
  });
  return (
    <>
      {milestones.map((p, j) => (
        <group
          key={j}
          position={p}
          ref={(g) => {
            if (g) groups.current[j] = g;
          }}
        >
          <mesh>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color={ACCENT} toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.38, 0.008, 8, 64]} />
            <meshBasicMaterial color={ACCENT} transparent opacity={0.6} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.55, 0.005, 8, 64]} />
            <meshBasicMaterial color={ACCENT} transparent opacity={0.3} />
          </mesh>
          {/* A thin beam down to the road. */}
          <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[0.006, 1.2, 0.006]} />
            <meshBasicMaterial color={ACCENT} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/**
 * Moves the camera along the curve and aims it at whatever the current chapter is
 * about, offset so the subject sits beside the chapter's text rather than under it.
 */
function Rig() {
  const { camera, size } = useThree();
  const u = useRef(0);
  const look = useRef(new THREE.Vector3(-2, 0, 0));
  const pos = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const mobile = size.width < 768;
    const motion = store.reducedMotion ? 0 : 1;
    u.current = store.reducedMotion ? store.u : THREE.MathUtils.damp(u.current, store.u, 5, dt);
    curve.getPoint(THREE.MathUtils.clamp(u.current, 0, 1), pos);
    camera.position.set(pos.x + store.pointer.x * 0.25 * motion, pos.y + store.pointer.y * 0.15 * motion, pos.z);

    // Subject, and where it should sit on screen (sx > 0 puts it right of centre).
    let sx = 0;
    let sy = 0;
    switch (idOf(store.chapter)) {
      case "home":
        target.copy(corePosition);
        sx = mobile ? 0 : 2.1;
        sy = mobile ? 2.5 : 0;
        break;
      case "about":
        target.copy(corePosition);
        sx = mobile ? 0.4 : -2.0;
        sy = mobile ? 1.9 : 0;
        break;
      case "work": {
        const i = store.project;
        target.copy(projectPanels[i].position);
        sx = mobile ? 0 : projectSide(i) * 1.9;
        sy = mobile ? 1.15 : 0.1;
        break;
      }
      case "capabilities":
        target.copy(capabilityCluster);
        sy = mobile ? 2.8 : 1.1;
        break;
      case "experience":
        curve.getPoint(Math.min(1, u.current + 0.035), target);
        target.y -= 0.4;
        sx = mobile ? 0 : -2.3;
        sy = mobile ? 2.2 : 0;
        break;
      default:
        target.copy(destination);
        sy = mobile ? 0.4 : 0.2;
    }

    // Offset the aim point in the camera's own frame, then ease towards it.
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);
    target.addScaledVector(right, -sx).addScaledVector(up, -sy);
    const k = store.reducedMotion ? 8 : 2.6;
    look.current.x = THREE.MathUtils.damp(look.current.x, target.x, k, dt);
    look.current.y = THREE.MathUtils.damp(look.current.y, target.y, k, dt);
    look.current.z = THREE.MathUtils.damp(look.current.z, target.z, k, dt);
    camera.lookAt(look.current);
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
      camera={{ position: [0, 0, 7], fov: mobile ? 55 : 42, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 10, 46]} />
      <Rig />
      <Road />
      <Particles count={mobile ? 1200 : 3000} />
      <Core position={corePosition} detail={mobile ? 64 : 128} />
      <Suspense fallback={null}>
        <ProjectPanels />
      </Suspense>
      <CapabilityForms />
      <Milestones />
      <Core position={destination} scale={1.9} detail={mobile ? 64 : 128} />
    </Canvas>
  );
}
