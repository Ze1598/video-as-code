import { BEATS } from "./data";

export const FPS = 60;

type TimelineEntry = { from: number; duration: number };

// `from`/`duration` in frames at 60fps. Each beat's duration is its real
// ElevenLabs speech length plus a deliberate hold long enough to read as a
// breath (1.2-2.6s, weighted by beat importance), not a rounding error. Beat
// 0 is a cold-open hook; Beat 11 is a closing engagement question and ends
// the video (2.5s hold after its last word).
export const TIMELINE: Record<string, TimelineEntry> = {
  "beat-00": { from: 0, duration: 609 },
  "beat-01": { from: 609, duration: 675 },
  "beat-02": { from: 1284, duration: 345 },
  "beat-03": { from: 1629, duration: 273 },
  "beat-04": { from: 1902, duration: 770 },
  "beat-05": { from: 2672, duration: 731 },
  "beat-06": { from: 3403, duration: 947 },
  "beat-07": { from: 4350, duration: 594 },
  "beat-08": { from: 4944, duration: 887 },
  "beat-09": { from: 5831, duration: 460 },
  "beat-10": { from: 6291, duration: 404 },
  "beat-11": { from: 6695, duration: 426 },
};

export const TOTAL_DURATION = TIMELINE["beat-11"].from + TIMELINE["beat-11"].duration;

export const BEAT_ORDER = [
  "beat-00",
  "beat-01",
  "beat-02",
  "beat-03",
  "beat-04",
  "beat-05",
  "beat-06",
  "beat-07",
  "beat-08",
  "beat-09",
  "beat-10",
  "beat-11",
];

// Converts a beat-local ElevenLabs word timestamp into a global frame number,
// by matching the word's text within that beat's real word list. This is how
// every diagram state change (connector draw-on, packet travel, camera cues)
// is anchored to real speech instead of a guessed frame.
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
