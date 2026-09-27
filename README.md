# Pocket Island

Tatsat Upadhyay's portfolio, shaped like a cozy island life-sim. You walk a chibi version of Tatsat around a small, blocky island; every building is one part of the portfolio. Walk up, press **E** (or tap the bubble), and a glass card opens with a link to the full story.

Recruiters in a hurry can hit **Just show me the work →** (always visible) for a fast, WebGL-free portfolio at `/work`.

Everything in the world is original and built from code primitives: no external models, textures, fonts in the world, or sound files.

## Run it

```bash
npm install
npm run dev        # http://localhost:4317
```

```bash
npm run build && npm start   # production, also on :4317
npm run lint
npm run typecheck
```

Add `?hq` to the URL to force full quality (shadows, higher resolution) on machines that auto-detect as low power.

## Controls

| | Desktop | Mobile |
|---|---|---|
| Walk | WASD / arrow keys (hold Shift to jog) | Tap the ground |
| Interact | E or Space | Tap the prompt bubble |
| Emotes | Q, then 1–4 | Smiley button |
| Pockets | I (or Tab) | Bag button |
| Map | M | Map button |
| Close | Esc | Close button / tap outside |

## The island

A floating oval about 40×36 tiles across. You arrive on the southern beach — sandcastles, shells, a bucket and shovel, a striped ball, an umbrella on a towel — then pass the House on its pond islet and come into a central Plaza with a two-tier cream stone fountain. Arcade, Town Hall and Market sit in cozy districts around the plaza; the main path runs north up the stairs to the Museum plateau. Pines ring the outer shore. A lighthouse bluff rises in the northeast and a secret grove of blossoms hides in the northwest.

| Landmark | Section |
|---|---|
| My House | About me |
| Town Hall | Work experience |
| Museum (on the plateau) | Projects: four indoor exhibits; reading one to the end "donates" it (gold star) |
| Market Stall | Econ thesis: Valorant vs. CS2, open vs. closed virtual economies (prices drift while you watch) |
| Arcade Shack | Games that inspired Tatsat, plus games he built |
| Dock | Contact |

Three original residents move in as you explore: **Bramble** (Greeter), **Drizzle** (Guide), and **Pip** (Fan). Inside the Museum, **Moss** curates the collection. Shells, fruit from shaken trees and hidden items go into your 10-slot Pockets, each with a note about Tatsat. Progress is saved in `localStorage`.

## Editing content

All copy lives in [`src/content/landmarks.ts`](src/content/landmarks.ts). Components only read from it.

- Text starting with `PLACEHOLDER` (and `placeholder: true`) is filler to replace: Pip's testimonial, two Town Hall notice-board notes, and two fountain wishes. These show a yellow **Placeholder** chip on the site.
- Sections marked `draft: true` were written from the resume/portfolio but go a step further ("What I'd build", "How I'd measure it", "What I learned"). They show a lilac **Draft** chip until you review them and remove the flag.
- The player's look (skin, hair, outfit, accessory) is `profile.look`.

## How it's built

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind v4 + shadcn/ui primitives
- **React Three Fiber + drei + three.js** for the world, **zustand** for game state, **motion** for UI springs
- `src/game/island.ts`: the island grid (~40×36 tiles of land: beach and dock in the south, House on a pond islet, central Plaza, stairs up to the Museum plateau), seeded prop scatter, collision and height queries
- `src/game/materials.ts`: one material style everywhere (`MeshToonMaterial`, 3-step gradient) plus a vertex patch for the rolling-horizon bend, tree sway and water shimmer
- Terrain, trees, tufts and flowers are `InstancedMesh`es (≈110–160 draw calls, ≈220k triangles)
- Lighting follows the visitor's local clock (morning / afternoon / golden hour)
- `/work` and `/story/[slug]` are static, crawlable, and don't load WebGL. Without WebGL, `/` redirects to `/work`
- Respects `prefers-reduced-motion`, clamps device pixel ratio to 1.75, and drops shadows on weak devices

## Phases

1. World, terrain, player, collision, camera ✅
2. Landmarks, cards, story pages, `/work`, HUD ✅
3. Residents, dialog, pockets, shaking trees, emotes, map ✅
4. Ambient life (butterflies, petals, bees, fish shadows, cloud shadows, bending grass, sand footprints) ✅
5. Night palette + fireflies, occasional rain, "Welcome back" message: not started

## Deploy

Netlify: connect the repo; `netlify.toml` builds with `npm run build` and Netlify's Next.js runtime is picked up automatically. Set `NEXT_PUBLIC_SITE_URL` to the final domain so share images resolve. Any Node host works too (`npm run build && npm start`).
