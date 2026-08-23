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
  "beat-14",
  "beat-15",
];

// Every beat's duration is its real ElevenLabs speech length (derived from
// data.ts, never hand-typed) plus a deliberate hold. beat-05 (the deadpan
// turn: "So the feedback changed nothing") and beat-08 (the Mechanism
// Reveal) and beat-14 (the final thesis bookend) get the longest holds
// short of the CTA; beat-15 (the CTA) gets the format's fixed ~2.5s
// closing hold.
const HOLD_SECONDS: Record<string, number> = {
  "beat-00": 1.6,
  "beat-01": 1.4,
  "beat-02": 1.4,
  "beat-03": 1.6,
  "beat-04": 1.8,
  "beat-05": 2.2,
  "beat-06": 1.8,
  "beat-07": 1.8,
  "beat-08": 2.6,
  "beat-09": 1.6,
  "beat-10": 1.6,
  "beat-11": 1.5,
  "beat-12": 2.0,
  "beat-13": 1.8,
  "beat-14": 2.2,
  "beat-15": 2.5,
};

export const TIMELINE = buildTimeline(BEAT_ORDER, BEATS, HOLD_SECONDS, FPS);
export const TOTAL_DURATION = totalDuration(BEAT_ORDER, TIMELINE);
export const frameOfWord = frameOfWordFactory(BEATS, TIMELINE, FPS);
