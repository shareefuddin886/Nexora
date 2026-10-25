// Accent colour per module, shared by the home progress cards and the
// dashboard. Gold stays the brand colour for primary actions.
export const TONES = {
  dsa: "#f2b544",
  assess: "#60a5fa",
  interview: "#a78bfa",
  resume: "#34d399",
} as const;

export type Tone = (typeof TONES)[keyof typeof TONES];

// 8-digit hex with alpha, e.g. tint("#60a5fa", 0.12) for soft backgrounds.
export function tint(hex: string, alpha: number) {
  return (
    hex +
    Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0")
  );
}
