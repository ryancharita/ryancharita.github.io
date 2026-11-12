# ryancharita.github.io

Portfolio of Ryan Joshua Charita, full stack developer. Live at https://ryancharita.github.io/.

Vite + React 19 + TypeScript, Tailwind CSS v4, and a react-three-fiber / three.js scene behind the page.

## Commands

- `pnpm dev`: dev server
- `pnpm build`: type-check and build to `dist/`
- `pnpm preview`: serve the production build

## Where things live

- `src/content/profile.ts`: all copy (projects, experience, skills, contact). Edit text here, not in components.
- `src/three/Scene.tsx`: the WebGL scene. `DESKTOP` / `MOBILE` keyframes say where the core sits relative to each section.
- `src/three/shaders.ts`: GLSL for the noise-displaced core and the particle field.
- `src/lib/store.ts`: scroll, pointer and hover state shared between the DOM and the scene, read every frame without re-rendering.
- `src/lib/hooks.ts`: Lenis smooth scroll, deep-link handling and scroll reveals.
- `public/projects/`: project screenshots (16:10 WebP).

Respects `prefers-reduced-motion` (the scene stays still and the reveals are off) and falls back to a plain page when WebGL is unavailable.

## Deploy

`.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on every push to `master`. In the repo settings, set **Pages → Source** to **GitHub Actions**.
