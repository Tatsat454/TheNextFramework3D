"use client";

import { create } from "zustand";
import type { ItemId, LandmarkId, ResidentId } from "@/content/landmarks";
import { residents } from "@/content/landmarks";

export type Emote = "wave" | "cheer" | "thinking" | "clap";

export type Card =
  | { type: "landmark"; id: LandmarkId }
  | { type: "exhibit"; slug: string }
  | { type: "skill"; id: string }
  | { type: "item"; id: ItemId };

export type DialogState = {
  speaker: ResidentId;
  lines: string[];
  index: number;
  action?: "museum";
};

export type Toast = { id: number; title: string; color?: string; kind: "found" | "info" | "celebrate" };

type Persisted = {
  visited: Partial<Record<LandmarkId, true>>;
  donated: Record<string, true>;
  pockets: ItemId[];
  collected: Record<string, true>;
  watered: Record<string, true>;
  hasCan: boolean;
  arrived: Partial<Record<ResidentId, true>>;
  completed: boolean;
};

type State = Persisted & {
  loaded: boolean;
  sound: boolean;
  touch: boolean;
  nearby: string | null;
  card: Card | null;
  dialog: DialogState | null;
  mapOpen: boolean;
  pocketsOpen: boolean;
  emoteOpen: boolean;
  emote: { type: Emote; at: number } | null;
  toasts: Toast[];
  celebrateAt: number;
  hopAt: number;
  shakes: Record<string, number>;
  drops: { id: string; item: ItemId; x: number; z: number; y: number; at: number }[];
  waterAt: { id: string; at: number } | null;
  arrivalAt: Partial<Record<ResidentId, number>>;
  set: (p: Partial<State>) => void;
};

const STORAGE_KEY = "pocket-island:v1";

const blank: Persisted = {
  visited: {},
  donated: {},
  pockets: [],
  collected: {},
  watered: {},
  hasCan: false,
  arrived: { bramble: true },
  completed: false,
};

export function readSaved(): Persisted {
  if (typeof window === "undefined") return blank;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return blank;
    return { ...blank, ...(JSON.parse(raw) as Partial<Persisted>) };
  } catch {
    return blank;
  }
}

function save(s: Persisted) {
  try {
    const { visited, donated, pockets, collected, watered, hasCan, arrived, completed } = s;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ visited, donated, pockets, collected, watered, hasCan, arrived, completed }),
    );
  } catch {
    /* storage can be unavailable (private mode, quota); progress just won't persist */
  }
}

export const useGame = create<State>((set) => ({
  ...blank,
  loaded: false,
  sound: false,
  touch: false,
  nearby: null,
  card: null,
  dialog: null,
  mapOpen: false,
  pocketsOpen: false,
  emoteOpen: false,
  emote: null,
  toasts: [],
  celebrateAt: 0,
  hopAt: 0,
  shakes: {},
  drops: [],
  waterAt: null,
  arrivalAt: {},
  set: (p) => set(p),
}));

let hydrated = false;
export function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const saved = readSaved();
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const count = Object.keys(saved.visited).length;
  const arrived = { ...saved.arrived };
  for (const r of residents) {
    if (count >= r.unlockAt) arrived[r.id] = true;
  }
  useGame.setState({ ...saved, arrived, touch });
  useGame.subscribe((s, prev) => {
    if (
      s.visited !== prev.visited ||
      s.donated !== prev.donated ||
      s.pockets !== prev.pockets ||
      s.collected !== prev.collected ||
      s.watered !== prev.watered ||
      s.hasCan !== prev.hasCan ||
      s.arrived !== prev.arrived ||
      s.completed !== prev.completed
    )
      save(s);
  });
}

/** Update saved progress from pages where the island (and its store) isn't mounted. */
export function patchSaved(fn: (s: Persisted) => Persisted) {
  if (typeof window === "undefined") return;
  save(fn(readSaved()));
}

const POS_KEY = "pocket-island:pos";
export function savePosition(p: { x: number; z: number; facing: number }) {
  try {
    window.sessionStorage.setItem(POS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
export function readPosition(): { x: number; z: number; facing: number } | null {
  try {
    const raw = window.sessionStorage.getItem(POS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const isPaused = (s: State) => !!(s.card || s.dialog || s.mapOpen || s.pocketsOpen);

let toastId = 1;
export function toast(title: string, kind: Toast["kind"] = "found", color?: string) {
  const id = toastId++;
  useGame.setState((s) => ({ toasts: [...s.toasts, { id, title, kind, color }].slice(-3) }));
  setTimeout(() => useGame.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
}

/** Residents move in as landmarks are discovered. Returns the ids that just arrived. */
export function checkArrivals(): ResidentId[] {
  const s = useGame.getState();
  const count = Object.keys(s.visited).length;
  const arrivedNow = residents.filter((r) => !s.arrived[r.id] && count >= r.unlockAt).map((r) => r.id);
  if (!arrivedNow.length) return [];
  const now = performance.now();
  const arrived = { ...s.arrived };
  const arrivalAt = { ...s.arrivalAt };
  for (const id of arrivedNow) {
    arrived[id] = true;
    arrivalAt[id] = now;
  }
  useGame.setState({ arrived, arrivalAt, celebrateAt: now });
  return arrivedNow;
}
