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

/** Animal Crossing / Pokopia daylight: cyan zenith, warm cream horizon, even fill. */
export const presets: Record<TimePreset["id"], TimePreset> = {
  morning: {
    id: "morning",
    sky: ["#4FB6EA", "#A6E2F6", "#F3F6C8"],
    hemiSky: "#D6F2FF",
    hemiGround: "#7EDC7A",
    hemiIntensity: 1.18,
    sun: "#FFF6D8",
    sunIntensity: 1.55,
    sunDir: [-8, 28, 10],
    fog: "#B8E6F4",
  },
  afternoon: {
    id: "afternoon",
    sky: ["#3DAAE8", "#8ED6F5", "#EAF6CE"],
    hemiSky: "#C8ECFF",
    hemiGround: "#7EDC7A",
    hemiIntensity: 1.22,
    sun: "#FFF8E4",
    sunIntensity: 1.65,
    sunDir: [-5, 32, 8],
    fog: "#A8DFF2",
  },
  golden: {
    id: "golden",
    sky: ["#5AA8D4", "#F0C48A", "#FFE2B0"],
    hemiSky: "#FFE4C0",
    hemiGround: "#8FCB6E",
    hemiIntensity: 1.08,
    sun: "#FFCC80",
    sunIntensity: 1.42,
    sunDir: [14, 18, 8],
    fog: "#F0D6A8",
  },
};

/** Follows the visitor's local clock. Night arrives in Phase 5; until then late hours use golden hour. */
export function presetForHour(hour: number): TimePreset {
  if (hour >= 5 && hour < 11) return presets.morning;
  if (hour >= 11 && hour < 16) return presets.afternoon;
  return presets.golden;
}
