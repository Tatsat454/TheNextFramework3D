"use client";

import type { ItemId, LandmarkId, ResidentId } from "@/content/landmarks";
import { arcadePal, copy, galleryExhibits, getItem, getLandmark, landmarks, museumPal, plazaCopy, residents, townHallPal } from "@/content/landmarks";
import { sfx } from "./audio";
import {
  armDoorLatch,
  getInterior,
  interiorByLandmark,
  interiors,
  outsideDoor,
  placePlayerInside,
  placePlayerOutside,
  propCopy,
  type InteriorId,
  WIPE_IN_MS,
  WIPE_IN_MS_REDUCED,
  WIPE_OUT_MS,
  WIPE_OUT_MS_REDUCED,
} from "./interiors";
import { fountain, getPlacement, landmarkPlacements, LEVEL, pickups, plazaBenches, trees } from "./island";
import { player, playerScreen, pose, reducedMotion } from "./player-state";
import { checkArrivals, toast, useGame } from "./store";

export type InteractKind = "landmark" | "exhibit" | "tree" | "pickup" | "resident" | "critter" | "door" | "prop" | "plaza";

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
  ...landmarkPlacements
    .filter((p) => !interiorByLandmark(p.id))
    .map((p) => ({
      id: `landmark:${p.id}`,
      kind: "landmark" as const,
      label: getLandmark(p.id).name,
      verb: "Open",
      x: p.interact.x,
      z: p.interact.z,
      y: p.level * LEVEL + (p.id === "townhall" || p.id === "museum" ? 4.4 : p.id === "dock" ? 1.8 : 3.4),
      r: p.radius,
      ref: p.id,
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

/** How close you need to be to talk — matches the distance they stop and look at you. */
export const RESIDENT_TALK_R = 2.4;

export type CritterKind = "butterfly" | "bee" | "fish";
export const critterSpots = new Map<string, { kind: CritterKind; x: number; z: number; y: number }>();

const critterCopy: Record<CritterKind, { label: string; line: string; r: number }> = {
  butterfly: { label: "Butterfly", line: "A butterfly! It flutters just out of reach.", r: 2.0 },
  bee: { label: "Bee", line: "Bzz! Too busy with the flowers to chat.", r: 1.35 },
  fish: { label: "Fish", line: "A little fish slips under the shade and is gone.", r: 1.6 },
};

export function currentInteractables(): Interactable[] {
  const s = useGame.getState();
  if (s.interior) {
    const room = getInterior(s.interior);
    const list: Interactable[] = room.objects.map((o) => {
      const copyFor = propCopy(s.interior!, o.id);
      return {
        id: `prop:${o.id}`,
        kind: "prop" as const,
        label: copyFor.name,
        verb: copyFor.verb,
        x: o.x,
        z: o.z,
        y: o.y,
        r: o.r,
        ref: o.id,
      };
    });
    list.push({
      id: `door-exit:${room.id}`,
      kind: "door",
      label: room.name,
      verb: "Leave",
      x: room.doormat.x,
      z: room.doormat.z,
      y: 1.4,
      r: 0.85,
      ref: `exit:${room.id}`,
    });
    return list;
  }
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
    list.push({
      id: `resident:${r.id}`,
      kind: "resident",
      label: r.name,
      verb: "Talk",
      x: spot.x,
      z: spot.z,
      y: spot.y + 1.7,
      r: RESIDENT_TALK_R,
      ref: r.id,
    });
  }
  for (const [id, c] of critterSpots) {
    list.push({
      id: `critter:${id}`,
      kind: "critter",
      label: critterCopy[c.kind].label,
      verb: "Greet",
      x: c.x,
      z: c.z,
      y: c.y + 0.5,
      r: critterCopy[c.kind].r,
      ref: c.kind,
    });
  }
  for (const room of Object.values(interiors)) {
    const door = outsideDoor(room.id);
    list.push({
      id: `door:${room.id}`,
      kind: "door",
      label: room.name,
      verb: "Enter",
      x: door.x,
      z: door.z,
      y: door.y + 2.4,
      r: 1.15,
      ref: `enter:${room.id}`,
    });
  }
  list.push({
    id: "plaza:fountain",
    kind: "plaza",
    label: plazaCopy.fountain.name,
    verb: plazaCopy.fountain.verb,
    x: fountain.x,
    z: fountain.z,
    y: LEVEL + 1.55,
    r: 2.2,
    ref: "fountain",
  });
  plazaBenches.forEach((b, i) => {
    if (pose.sitting && pose.bench === i) return;
    list.push({
      id: `plaza:bench-${i}`,
      kind: "plaza",
      label: plazaCopy.bench.name,
      verb: plazaCopy.bench.verb,
      x: b.x,
      z: b.z,
      y: LEVEL + 1.15,
      r: 1.05,
      ref: `bench-${i}`,
    });
  });
  return list;
}

/** Nearest interactable in range; closer beats bigger radius. */
export function findNearby(x: number, z: number): Interactable | null {
  let best: Interactable | null = null;
  let bestScore = Infinity;
  for (const it of currentInteractables()) {
    const d = Math.hypot(it.x - x, it.z - z);
    if (d > it.r) continue;
    // Pickups win over trees. Residents win over buildings so E talks when a creature looks at you.
    const score =
      it.kind === "pickup"
        ? d / it.r - 1
        : it.kind === "resident"
          ? d / it.r - 0.55
          : it.kind === "critter"
            ? d / it.r + 0.45
            : d / it.r;
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
  if (line === "{gallery}") {
    const n = galleryExhibits.filter((slug) => s.donated[slug]).length;
    return n === galleryExhibits.length ? museumPal.thanks : museumPal.progress.replace("{n}", String(n));
  }
  return line;
}

export function galleryDonatedCount(donated: Record<string, true> = useGame.getState().donated) {
  return galleryExhibits.filter((slug) => donated[slug]).length;
}

/** Confetti + thank-you the first time all five indoor exhibits are donated. */
export function celebrateGalleryIfComplete() {
  const s = useGame.getState();
  if (s.galleryCelebrated) return false;
  if (galleryDonatedCount(s.donated) < galleryExhibits.length) return false;
  useGame.setState({ galleryCelebrated: true, celebrateAt: performance.now() });
  toast("You've seen every exhibit!", "celebrate", "#D4A13A");
  sfx.jingle();
  return true;
}

function tossCoin(from: { x: number; z: number }) {
  pose.tossAt = performance.now();
  pose.tossFromX = from.x;
  pose.tossFromY = player.y + 0.85;
  pose.tossFromZ = from.z;
}

function sitOnBench(i: number) {
  const b = plazaBenches[i];
  if (!b) return;
  pose.sitting = true;
  pose.bench = i;
  pose.gazeboFocus = false;
  player.x = b.x + Math.sin(b.facing) * 0.04;
  player.z = b.z + Math.cos(b.facing) * 0.04;
  player.facing = b.facing;
  player.moving = false;
  sfx.sigh();
}

export function interact(it: Interactable, player: { x: number; z: number }) {
  const s = useGame.getState();
  switch (it.kind) {
    case "landmark": {
      const id = it.ref as LandmarkId;
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
      useGame.setState({
        dialog: {
          speaker: r.id,
          name: r.name,
          role: r.role,
          tagColor: r.tagColor,
          voice: r.voice,
          lines,
          index: 0,
        },
      });
      break;
    }
    case "critter": {
      const kind = it.ref as CritterKind;
      toast(critterCopy[kind].line, "info");
      break;
    }
    case "door": {
      if (it.ref.startsWith("enter:")) requestEnter(it.ref.slice(6) as InteriorId);
      else requestExit();
      break;
    }
    case "plaza": {
      if (it.ref === "fountain") tossCoin(player);
      else if (it.ref.startsWith("bench-")) sitOnBench(Number(it.ref.slice(6)));
      break;
    }
    case "prop": {
      inspectProp(it.ref);
      break;
    }
  }
}

function field(o: object, key: string): string | undefined {
  const v = (o as Record<string, unknown>)[key];
  return typeof v === "string" ? v : undefined;
}

function inspectProp(id: string) {
  const interior = useGame.getState().interior;
  if (!interior) return;
  const o = propCopy(interior, id);
  if (!o) return;
  sfx.open();
  const href = field(o, "href");
  const hrefLabel = field(o, "hrefLabel");
  const title = field(o, "title");
  if (interior === "arcade") {
    useGame.setState({
      dialog: {
        speaker: arcadePal.id,
        name: o.name,
        role: title,
        tagColor: arcadePal.tagColor,
        voice: arcadePal.voice,
        lines: o.lines,
        index: 0,
        action: href ? "link" : undefined,
        href,
        hrefLabel,
      },
    });
    return;
  }
  if (interior === "museum") {
    const lines = o.lines.map((l) => fillTemplate(l, player.x, player.z));
    if (id === "curator") celebrateGalleryIfComplete();
    useGame.setState({
      dialog: {
        speaker: museumPal.id,
        name: id === "curator" ? museumPal.name : o.name,
        role: id === "curator" ? museumPal.role : title,
        tagColor: museumPal.tagColor,
        voice: museumPal.voice,
        lines,
        index: 0,
        action: href ? "link" : undefined,
        href,
        hrefLabel,
      },
    });
    return;
  }
  if (interior === "townhall") {
    if (id === "clerk") {
      useGame.setState({
        dialog: {
          speaker: townHallPal.id,
          name: townHallPal.name,
          role: townHallPal.role,
          tagColor: townHallPal.tagColor,
          voice: townHallPal.voice,
          lines: [townHallPal.ask],
          index: 0,
          action: "choices",
          choices: [
            { id: "resume", label: "Show me the full resume" },
            { id: "looking-for", label: "What's Tatsat looking for?" },
          ],
        },
      });
      return;
    }
    if (id === "stamp") {
      const already = !!useGame.getState().collected["stamp-visitor"];
      if (already) {
        useGame.setState({
          dialog: {
            speaker: townHallPal.id,
            name: townHallPal.name,
            role: townHallPal.role,
            tagColor: townHallPal.tagColor,
            voice: townHallPal.voice,
            lines: [field(o, "already") ?? "This page is already stamped."],
            index: 0,
          },
        });
        return;
      }
      addToPockets("stamp-visitor", "official-visitor");
      sfx.stamp();
      useGame.setState({
        dialog: {
          speaker: townHallPal.id,
          name: townHallPal.name,
          role: townHallPal.role,
          tagColor: townHallPal.tagColor,
          voice: townHallPal.voice,
          lines: o.lines,
          index: 0,
        },
      });
      return;
    }
    useGame.setState({
      dialog: {
        speaker: townHallPal.id,
        name: o.name,
        role: title,
        tagColor: townHallPal.tagColor,
        voice: townHallPal.voice,
        lines: o.lines,
        index: 0,
        action: href ? "link" : undefined,
        href,
        hrefLabel,
      },
    });
    return;
  }
  const tag =
    id === "computer" ? "#D9A066" : id === "tv" ? "#7B6CF6" : id === "bed" ? "#E8513F" : id === "picture" ? "#C48A55" : "#8B5A32";
  useGame.setState({
    dialog: {
      speaker: id,
      name: o.name,
      role: title,
      tagColor: tag,
      voice: [240, 340],
      lines: o.lines,
      index: 0,
      action: href ? "link" : undefined,
      href,
      hrefLabel,
    },
    emote: id === "bed" ? { type: "stretch", at: performance.now() } : useGame.getState().emote,
  });
}

export function pickDialogChoice(id: string) {
  if (id === "resume") {
    useGame.setState({
      dialog: {
        speaker: townHallPal.id,
        name: townHallPal.name,
        role: townHallPal.role,
        tagColor: townHallPal.tagColor,
        voice: townHallPal.voice,
        lines: townHallPal.resumeLines,
        index: 0,
        action: "link",
        href: townHallPal.resumeHref,
        hrefLabel: townHallPal.resumeHrefLabel,
      },
    });
    sfx.open();
    return;
  }
  if (id === "looking-for") {
    useGame.setState({
      dialog: {
        speaker: townHallPal.id,
        name: townHallPal.name,
        role: townHallPal.role,
        tagColor: townHallPal.tagColor,
        voice: townHallPal.voice,
        lines: townHallPal.lookingFor,
        index: 0,
      },
    });
    sfx.open();
  }
}

export function requestEnter(id: InteriorId) {
  const s = useGame.getState();
  if (s.interior || s.transitioning) return;
  const rm = reducedMotion.value;
  const outMs = rm ? WIPE_OUT_MS_REDUCED : WIPE_OUT_MS;
  const inMs = rm ? WIPE_IN_MS_REDUCED : WIPE_IN_MS;
  useGame.setState({
    transitioning: true,
    wipe: { phase: "out", x: playerScreen.x, y: playerScreen.y, at: performance.now() },
    card: null,
    dialog: null,
  });
  sfx.door();
  window.setTimeout(() => {
    visit(getInterior(id).landmarkId);
    placePlayerInside(id);
    useGame.setState({
      interior: id,
      nearby: null,
      wipe: { phase: "in", x: 0.5, y: 0.7, at: performance.now() },
    });
    armDoorLatch(720);
  }, outMs);
  window.setTimeout(() => useGame.setState({ transitioning: false, wipe: null }), outMs + inMs);
}

export function requestExit() {
  const s = useGame.getState();
  if (!s.interior || s.transitioning) return;
  const id = s.interior;
  const rm = reducedMotion.value;
  const outMs = rm ? WIPE_OUT_MS_REDUCED : WIPE_OUT_MS;
  const inMs = rm ? WIPE_IN_MS_REDUCED : WIPE_IN_MS;
  useGame.setState({
    transitioning: true,
    wipe: { phase: "out", x: playerScreen.x, y: playerScreen.y, at: performance.now() },
    dialog: null,
  });
  sfx.door();
  window.setTimeout(() => {
    placePlayerOutside(id);
    useGame.setState({
      interior: null,
      nearby: null,
      wipe: { phase: "in", x: 0.5, y: 0.58, at: performance.now() },
    });
    armDoorLatch(720);
  }, outMs);
  window.setTimeout(() => useGame.setState({ transitioning: false, wipe: null }), outMs + inMs);
}

/** Opens a resident's dialog directly (used for the first-visit greeting). */
export function talkTo(id: ResidentId, from: { x: number; z: number }) {
  const spot = residentSpots.get(id) ?? from;
  interact({ id: `resident:${id}`, kind: "resident", label: id, verb: "Talk", x: spot.x, z: spot.z, y: 0, r: 1, ref: id }, from);
}

export const landmarkCenter = (id: LandmarkId) => getPlacement(id).center;
