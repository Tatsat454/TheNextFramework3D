export type TimePreset = {
  id: "morning" | "afternoon" | "golden";
  sky: [string, string, string];
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  sun: string;
  sunIntensity: number;
  sunDir: [number, number, number];
  fog: string;
};

/** Soft peach–pink–lavender sky from the Pocket Island target painting. */
export const presets: Record<TimePreset["id"], TimePreset> = {
  morning: {
    id: "morning",
    sky: ["#E8B8D4", "#F7CDB8", "#FFE8D4"],
    hemiSky: "#FFE6DA",
    hemiGround: "#8BE07A",
    hemiIntensity: 1.2,
    sun: "#FFF4DC",
    sunIntensity: 1.45,
    sunDir: [-7, 26, 12],
    fog: "#F3D4C8",
  },
  afternoon: {
    id: "afternoon",
    sky: ["#E8A8D0", "#F2B8C6", "#F8D4C4"],
    hemiSky: "#FFE4D8",
    hemiGround: "#8BE07A",
    hemiIntensity: 1.22,
    sun: "#FFF6E4",
    sunIntensity: 1.5,
    sunDir: [-4, 28, 10],
    fog: "#F4C8C0",
  },
  golden: {
    id: "golden",
    sky: ["#E8A8C8", "#FFC8A8", "#FFE2C0"],
    hemiSky: "#FFE0C8",
    hemiGround: "#7ED06A",
    hemiIntensity: 1.12,
    sun: "#FFD8A8",
    sunIntensity: 1.38,
    sunDir: [10, 20, 9],
    fog: "#F6D0B8",
  },
};

export function presetForHour(hour: number): TimePreset {
  if (hour >= 5 && hour < 11) return presets.morning;
  return presets.afternoon;
}

export function presetFromSearch(search: string, hour = new Date().getHours()): TimePreset {
  const id = new URLSearchParams(search).get("tod");
  if (id === "morning" || id === "afternoon" || id === "golden") return presets[id];
  return presetForHour(hour);
}
