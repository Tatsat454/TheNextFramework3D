"use client";

import type { ItemId, LandmarkId, ResidentId } from "@/content/landmarks";
import { copy, getItem, getLandmark, landmarks, museumExhibits, residents, skills } from "@/content/landmarks";
import { sfx } from "./audio";
import { gardenRows, getPlacement, landmarkPlacements, pedestals, pickups, trees } from "./island";
import { checkArrivals, toast, useGame } from "./store";

export type InteractKind = "landmark" | "exhibit" | "row" | "tree" | "pickup" | "resident";

export type Interactable = {
  id: string;
  kind: InteractKind;
  label: string;
  verb: string;
  x: number;
  z: number;
  /** Height the prompt bubble floats at. */
  y: number;
  r: number;
  ref: string;
};

const staticList: Interactable[] = [
  ...landmarkPlacements.map((p) => ({
    id: `landmark:${p.id}`,
    kind: "landmark" as const,
    label: getLandmark(p.id).name,
    verb: "Open",
    x: p.interact.x,
    z: p.interact.z,
    y: p.level + (p.id === "townhall" || p.id === "museum" ? 4.4 : p.id === "dock" ? 1.8 : 3.4),
    r: p.radius,
    ref: p.id,
  })),
  ...pedestals.map((p, k) => ({
    id: `exhibit:${p.slug}`,
    kind: "exhibit" as const,
    label: `Exhibit ${k + 1}`,
    verb: "Look",
    x: p.interact.x,
    z: p.interact.z,
    y: p.level + 2.1,
    r: 0.95,
    ref: p.slug,
  })),
  ...gardenRows.map((row) => ({
    id: `row:${row.skillId}`,
    kind: "row" as const,
    label: skills.find((s) => s.id === row.skillId)!.name,
    verb: "Water",
    x: row.interact.x,
    z: row.interact.z,
    y: row.level + 1.9,
    r: 0.62,
    ref: row.skillId,
  })),
  ...trees
    .map((t, k) => ({ t, k }))
    .filter(({ t }) => t.kind === "fruit")
    .map(({ t, k }) => ({
      id: `tree:${k}`,
      kind: "tree" as const,
      label: "Fruit tree",
      verb: "Shake",
      x: t.x,
      z: t.z + 0.9,
      y: t.y + 3.2,
      r: 1.3,
      ref: String(k),
    })),
];

/** Residents register (and move) themselves here every frame. */
export const residentSpots = new Map<ResidentId, { x: number; z: number; y: number }>();

export function currentInteractables(): Interactable[] {
  const s = useGame.getState();
  const list = [...staticList];
  for (const p of pickups) {
    if (s.collected[p.id]) continue;
    list.push({ id: `pickup:${p.id}`, kind: "pickup", label: getItem(p.item).name, verb: "Pick up", x: p.x, z: p.z, y: p.y + 1.2, r: 0.9, ref: p.id });
  }
  for (const d of s.drops) {
    if (s.collected[d.id]) continue;
    list.push({ id: `pickup:${d.id}`, kind: "pickup", label: getItem(d.item).name, verb: "Pick up", x: d.x, z: d.z, y: d.y + 1.2, r: 0.9, ref: d.id });
  }
  for (const r of residents) {
    const spot = residentSpots.get(r.id);
    if (!spot || !s.arrived[r.id]) continue;
    list.push({ id: `resident:${r.id}`, kind: "resident", label: r.name, verb: "Talk", x: spot.x, z: spot.z, y: spot.y + 1.7, r: 1.35, ref: r.id });
  }
  return list;
}

/** Nearest interactable in range; closer beats bigger radius. */
export function findNearby(x: number, z: number): Interactable | null {
  let best: Interactable | null = null;
  let bestScore = Infinity;
  for (const it of currentInteractables()) {
    const d = Math.hypot(it.x - x, it.z - z);
    if (d > it.r) continue;
    const score = d / it.r;
    if (score < bestScore) {
      best = it;
      bestScore = score;
    }
  }
  return best;
}

export function visit(id: LandmarkId) {
  const s = useGame.getState();
  if (!s.visited[id]) {
    useGame.setState({ visited: { ...s.visited, [id]: true } });
    const arrived = checkArrivals();
    arrived.forEach((rid, k) => {
      const r = residents.find((x) => x.id === rid)!;
      setTimeout(() => {
        toast(`${r.name} moved to the island!`, "celebrate", r.tagColor);
        sfx.jingle();
      }, 400 + k * 900);
    });
    const after = useGame.getState();
    if (!after.completed && Object.keys(after.visited).length >= landmarks.length) {
      setTimeout(() => {
        useGame.setState({ completed: true, celebrateAt: performance.now() });
        toast(copy.islandComplete, "celebrate", "#FFC857");
        sfx.jingle();
      }, 1400);
    }
  }
}

function addToPockets(id: string, item: ItemId) {
  const s = useGame.getState();
  if (s.pockets.length >= 10) {
    toast(copy.pocketsFull, "info");
    return false;
  }
  useGame.setState({ pockets: [...s.pockets, item], collected: { ...s.collected, [id]: true }, hopAt: performance.now() });
  const it = getItem(item);
  toast(`You found a ${it.name.toLowerCase()}!`, "found", it.color);
  sfx.pickup();
  return true;
}

function fillTemplate(line: string, px: number, pz: number): string {
  const s = useGame.getState();
  if (line === "{controls}")
    return s.touch
      ? "Tap the ground to walk there. When a bubble pops up, tap it to interact."
      : "Use the arrow keys or WASD to walk, Shift to jog, and E or Space to interact. Q for emotes, Tab for your pockets, M for the map.";
  if (line === "{guide}") {
    const unvisited = landmarkPlacements.filter((p) => !s.visited[p.id]);
    if (!unvisited.length) return "You've found every landmark! Now go read everything. I'll wait.";
    const target = unvisited.sort(
      (a, b) => Math.hypot(a.interact.x - px, a.interact.z - pz) - Math.hypot(b.interact.x - px, b.interact.z - pz),
    )[0];
    const dx = target.interact.x - px;
    const dz = target.interact.z - pz;
    const ns = dz < -2 ? "north" : dz > 2 ? "south" : "";
    const ew = dx > 2 ? "east" : dx < -2 ? "west" : "";
    const dir = ns && ew ? `${ns}-${ew}` : ns || ew || "right around here";
    const lm = getLandmark(target.id);
    const up = target.level > 1 ? " Take the stairs up." : "";
    return `Have you seen the ${lm.name}? It's ${dir === "right around here" ? dir : `to the ${dir}`}. That's where you'll find his ${lm.section.toLowerCase()}.${up}`;
  }
  if (line === "{museum}") {
    const n = museumExhibits.filter((slug) => s.donated[slug]).length;
    return n === museumExhibits.length
      ? "Every exhibit donated! The museum is complete. Thank you, truly."
      : `So far ${n} of ${museumExhibits.length} exhibits are donated. Shall I show you the collection?`;
  }
  return line;
}

export function interact(it: Interactable, player: { x: number; z: number }) {
  const s = useGame.getState();
  switch (it.kind) {
    case "landmark": {
      const id = it.ref as LandmarkId;
      if (id === "garden" && !s.hasCan) {
        useGame.setState({ hasCan: true });
        toast(copy.wateringCan, "found", "#8FD3E8");
      }
      visit(id);
      sfx.open();
      useGame.setState({ card: { type: "landmark", id } });
      break;
    }
    case "exhibit":
      sfx.open();
      visit("museum");
      useGame.setState({ card: { type: "exhibit", slug: it.ref } });
      break;
    case "row": {
      if (!s.hasCan) {
        useGame.setState({ hasCan: true });
        toast(copy.wateringCan, "found", "#8FD3E8");
      }
      visit("garden");
      useGame.setState({ watered: { ...useGame.getState().watered, [it.ref]: true }, waterAt: { id: it.ref, at: performance.now() } });
      sfx.water();
      setTimeout(() => useGame.setState({ card: { type: "skill", id: it.ref } }), 900);
      break;
    }
    case "tree": {
      const k = Number(it.ref);
      const tree = trees[k];
      useGame.setState({ shakes: { ...s.shakes, [it.ref]: performance.now() } });
      sfx.shake();
      if (tree.item) {
        const id = `fruit-${tree.item}`;
        if (!s.collected[id] && !s.drops.some((d) => d.id === id)) {
          const angle = Math.atan2(player.z - tree.z, player.x - tree.x) + (Math.random() - 0.5) * 0.8;
          const drop = { id, item: tree.item, x: tree.x + Math.cos(angle) * 1.05, z: tree.z + Math.sin(angle) * 1.05, y: tree.y, at: performance.now() };
          setTimeout(() => useGame.setState((st) => ({ drops: [...st.drops, drop] })), 350);
        } else if (s.collected[id]) {
          toast("Nothing left on this one. Try another tree!", "info");
        }
      }
      break;
    }
    case "pickup": {
      const ground = pickups.find((p) => p.id === it.ref);
      const drop = s.drops.find((d) => d.id === it.ref);
      const item = ground?.item ?? drop?.item;
      if (item) addToPockets(it.ref, item);
      break;
    }
    case "resident": {
      const r = residents.find((x) => x.id === it.ref)!;
      const lines = [r.intro, ...r.lines].map((l) => fillTemplate(l, player.x, player.z));
      useGame.setState({ dialog: { speaker: r.id, lines, index: 0, action: r.id === "sol" ? "museum" : undefined } });
      break;
    }
  }
}

export const landmarkCenter = (id: LandmarkId) => getPlacement(id).center;
