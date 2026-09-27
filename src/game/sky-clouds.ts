/** Shared drift paths for the visible sky clouds and their ground shadows. */
export const skyClouds = [
  { z: -10, y: 15.5, s: 4.4, speed: 0.16, off: 4, span: 72 },
  { z: 6, y: 17.2, s: 5.1, speed: 0.12, off: 22, span: 80 },
  { z: 18, y: 14.8, s: 3.6, speed: 0.2, off: 41, span: 68 },
  { z: -2, y: 18.6, s: 4.8, speed: 0.14, off: 9, span: 76 },
  { z: 12, y: 16.4, s: 3.9, speed: 0.18, off: 55, span: 70 },
];

export function cloudX(c: (typeof skyClouds)[number], t: number) {
  return ((t * c.speed + c.off) % c.span) - c.span / 2;
}
