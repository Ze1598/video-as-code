import { BEATS } from "./data";

export const FPS = 60;

type TimelineEntry = { from: number; duration: number };

// `from`/`duration` in frames at 60fps. Each beat's duration is its real
// ElevenLabs speech length plus a deliberate hold (for the camera to move and
// for the beat to land) — not a fixed guess. No title card, no end card: the
// video opens directly on Beat 1 and ends 2 seconds after Beat 9's last word.
export const TIMELINE: Record<string, TimelineEntry> = {
  "beat-01": { from: 0, duration: 476 },
  "beat-02": { from: 476, duration: 219 },
  "beat-03": { from: 695, duration: 230 },
  "beat-04": { from: 925, duration: 772 },
  "beat-05": { from: 1697, duration: 592 },
  "beat-06": { from: 2289, duration: 717 },
  "beat-07": { from: 3006, duration: 544 },
  "beat-08": { from: 3550, duration: 761 },
  "beat-09": { from: 4311, duration: 426 },
};

export const TOTAL_DURATION = TIMELINE["beat-09"].from + TIMELINE["beat-09"].duration;

export const BEAT_ORDER = [
  "beat-01",
  "beat-02",
  "beat-03",
  "beat-04",
  "beat-05",
  "beat-06",
  "beat-07",
  "beat-08",
  "beat-09",
];

// Converts a beat-local ElevenLabs word timestamp into a global frame number,
// by matching the word's text within that beat's real word list. This is how
// every diagram state change (connector draw-on, info packet travel, etc.) is
// anchored to real speech instead of a guessed frame.
export function frameOfWord(
  beatId: string,
  wordText: string,
  edge: "start" | "end" = "start",
  occurrence = 0,
): number {
  const beat = BEATS[beatId];
  const matches = beat.words.filter((w) => w.text === wordText);
  const word = matches[occurrence];
  if (!word) {
    throw new Error(`Word "${wordText}" (occurrence ${occurrence}) not found in ${beatId}`);
  }
  const localMs = edge === "start" ? word.startMs : word.endMs;
  const localFrame = Math.round((localMs * FPS) / 1000);
  return TIMELINE[beatId].from + localFrame;
}
