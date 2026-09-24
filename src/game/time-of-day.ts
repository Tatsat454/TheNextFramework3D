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

/** Animal Crossing / Pokopia daylight: cyan sky, even fill, lime grass. */
export const presets: Record<TimePreset["id"], TimePreset> = {
  morning: {
    id: "morning",
    sky: ["#1B88D0", "#5AB6EA", "#8AD4F0"],
    hemiSky: "#D6F2FF",
    hemiGround: "#7EDC7A",
    hemiIntensity: 1.18,
    sun: "#FFF6D8",
    sunIntensity: 1.55,
    sunDir: [-8, 28, 10],
    fog: "#9ED4EC",
  },
  afternoon: {
    id: "afternoon",
    sky: ["#1680CC", "#4AACE6", "#8AD4F0"],
    hemiSky: "#C8ECFF",
    hemiGround: "#7EDC7A",
    hemiIntensity: 1.22,
    sun: "#FFF8E4",
    sunIntensity: 1.65,
    sunDir: [-5, 32, 8],
    fog: "#9ED4EC",
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

/** Daylight stays on the Animal Crossing cyan look. Golden hour is opt-in (`?tod=golden`) until night ships. */
export function presetForHour(hour: number): TimePreset {
  if (hour >= 5 && hour < 11) return presets.morning;
  return presets.afternoon;
}

export function presetFromSearch(search: string, hour = new Date().getHours()): TimePreset {
  const id = new URLSearchParams(search).get("tod");
  if (id === "morning" || id === "afternoon" || id === "golden") return presets[id];
  return presetForHour(hour);
}
