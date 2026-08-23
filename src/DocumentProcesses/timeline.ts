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
];

// Every beat's duration is its real ElevenLabs speech length (from data.ts,
// never hand-typed) plus a deliberate hold. Beat-04 (the rejection) and
// beat-07 (the Mechanism Reveal) get long holds as the causal-chain's two
// heaviest pivots; beat-11 (the essay's own thesis line, the Operational
// Close) and beat-12 (the CTA) get the format's longest holds since each is
// the last thing on screen before a mode change or the video's end.
const HOLD_SECONDS: Record<string, number> = {
  "beat-00": 1.5,
  "beat-01": 1.4,
  "beat-02": 1.3,
  "beat-03": 1.4,
  "beat-04": 1.8,
  "beat-05": 1.6,
  "beat-06": 2.0,
  "beat-07": 2.6,
  "beat-08": 1.8,
  "beat-09": 1.8,
  "beat-10": 1.6,
  "beat-11": 2.2,
  "beat-12": 2.5,
};

export const TIMELINE = buildTimeline(BEAT_ORDER, BEATS, HOLD_SECONDS, FPS);
export const TOTAL_DURATION = totalDuration(BEAT_ORDER, TIMELINE);
export const frameOfWord = frameOfWordFactory(BEATS, TIMELINE, FPS);
