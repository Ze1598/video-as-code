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
];

// Every beat's duration is its real ElevenLabs speech length (from data.ts,
// never hand-typed) plus a deliberate hold. Short/plain beats sit at the low
// end; the Mechanism Reveal (beat-06) and the CTA (beat-11) get the format's
// longest holds.
const HOLD_SECONDS: Record<string, number> = {
  "beat-00": 1.5,
  "beat-01": 1.4,
  "beat-02": 1.4,
  "beat-03": 1.6,
  "beat-04": 1.8,
  "beat-05": 1.6,
  "beat-06": 2.6,
  "beat-07": 1.8,
  "beat-08": 1.6,
  "beat-09": 2.0,
  "beat-10": 1.8,
  "beat-11": 2.5,
};

export const TIMELINE = buildTimeline(BEAT_ORDER, BEATS, HOLD_SECONDS, FPS);
export const TOTAL_DURATION = totalDuration(BEAT_ORDER, TIMELINE);
export const frameOfWord = frameOfWordFactory(BEATS, TIMELINE, FPS);
