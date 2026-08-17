import { BEATS } from "./data";

export const FPS = 60;

type TimelineEntry = { from: number; duration: number };

// `from`/`duration` in frames at 60fps. Each beat's duration is its real
// ElevenLabs speech length plus a deliberate hold — long enough to read as a
// breath, not a rounding error (see the plan behind this revision: the first
// cut used holds of 500-900ms, which felt "programmatic"; these are
// 1.4-1.8x longer). Beat 0 is a cold-open hook; Beat 11 is a closing
// engagement question and ends the video (2.5s hold after its last word).
export const TIMELINE: Record<string, TimelineEntry> = {
  "beat-00": { from: 0, duration: 578 },
  "beat-01": { from: 578, duration: 1525 },
  "beat-02": { from: 2103, duration: 874 },
  "beat-03": { from: 2977, duration: 143 },
  "beat-04": { from: 3120, duration: 1781 },
  "beat-05": { from: 4901, duration: 989 },
  "beat-06": { from: 5890, duration: 1134 },
  "beat-07": { from: 7024, duration: 1343 },
  "beat-08": { from: 8367, duration: 710 },
  "beat-09": { from: 9077, duration: 1210 },
  "beat-10": { from: 10287, duration: 317 },
  "beat-11": { from: 10604, duration: 629 },
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
// every visual state change (divergence ramp, label reveal, camera cues) is
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
