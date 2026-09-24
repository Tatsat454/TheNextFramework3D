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

export const presets: Record<TimePreset["id"], TimePreset> = {
  morning: {
    id: "morning",
    sky: ["#FFD9CC", "#EBD0EE", "#C7B9FF"],
    hemiSky: "#FFE9E0",
    hemiGround: "#9ADBB0",
    hemiIntensity: 0.95,
    sun: "#FFF1DC",
    sunIntensity: 1.4,
    sunDir: [-9, 26, 7],
    fog: "#D9CBFA",
  },
  afternoon: {
    id: "afternoon",
    sky: ["#FFE3D6", "#EDD8F2", "#CFC4FF"],
    hemiSky: "#FFF2EA",
    hemiGround: "#9ADBB0",
    hemiIntensity: 1.0,
    sun: "#FFF6EA",
    sunIntensity: 1.5,
    sunDir: [-4, 28, 6],
    fog: "#DCD2FB",
  },
  golden: {
    id: "golden",
    sky: ["#FFC9A8", "#F2C2DA", "#B9A8FF"],
    hemiSky: "#FFE0CC",
    hemiGround: "#8FCFA2",
    hemiIntensity: 0.85,
    sun: "#FFD2A6",
    sunIntensity: 1.3,
    sunDir: [12, 20, 7],
    fog: "#D6C2F2",
  },
};

/** Follows the visitor's local clock. Night arrives in Phase 5; until then late hours use golden hour. */
export function presetForHour(hour: number): TimePreset {
  if (hour >= 5 && hour < 11) return presets.morning;
  if (hour >= 11 && hour < 16) return presets.afternoon;
  return presets.golden;
}
