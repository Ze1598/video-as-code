import { BEATS } from "./data.ts";
import { buildTimeline, frameOfWordFactory, totalDuration } from "../lib/timeline.ts";

export const FPS = 60;

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
  "beat-12",
  "beat-13",
];

// Every beat's duration is its real ElevenLabs speech length (derived from
// data.ts, never hand-typed) plus a deliberate hold. beat-04 (the decision
// to ship anyway — the actual moral hinge) and beat-07 (the turn: "They
// held his team to the standard he advertised") and beat-08 (the Mechanism
// Reveal) get the longest holds; the CTA (beat-13) gets the format's fixed
// ~2.5s closing hold.
const HOLD_SECONDS: Record<string, number> = {
  "beat-00": 1.6,
  "beat-01": 1.4,
  "beat-02": 1.4,
  "beat-03": 1.6,
  "beat-04": 2.2,
  "beat-05": 1.8,
  "beat-06": 1.8,
  "beat-07": 2.2,
  "beat-08": 2.6,
  "beat-09": 1.6,
  "beat-10": 1.6,
  "beat-11": 1.5,
  "beat-12": 2.0,
  "beat-13": 2.5,
};

export const TIMELINE = buildTimeline(BEAT_ORDER, BEATS, HOLD_SECONDS, FPS);
export const TOTAL_DURATION = totalDuration(BEAT_ORDER, TIMELINE);
export const frameOfWord = frameOfWordFactory(BEATS, TIMELINE, FPS);
