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
];

// Every beat's duration is its real ElevenLabs speech length (from data.ts)
// plus a deliberate hold. Beat-03 (the pivotal "why does this need to
// exist?" question going unanswered) and beat-04 ("sat there, quietly")
// get longer holds for the deadpan weight; beat-06 (the Mechanism Reveal)
// gets the longest between-beat hold in the video.
//
// Beats 00-09's holds were cut 35% from their original values after the
// first render played every beat-to-beat transition as a long, awkward
// pause (user feedback, not a skill-guidance change) — this puts several
// of them below the leadership-visual-essay skill's usual 1.2s floor, a
// deliberate override, not an oversight. Beat-10 (the CTA) is left at the
// original 2.5s: nothing transitions after it, so it isn't the pause the
// feedback was about — it's the format's documented closing hold.
const HOLD_SECONDS: Record<string, number> = {
  "beat-00": 1.0, // 1.5 * 0.65
  "beat-01": 0.9, // 1.4 * 0.65
  "beat-02": 0.9, // 1.4 * 0.65
  "beat-03": 1.3, // 2.0 * 0.65
  "beat-04": 1.3, // 2.0 * 0.65
  "beat-05": 1.2, // 1.8 * 0.65
  "beat-06": 1.7, // 2.6 * 0.65
  "beat-07": 1.2, // 1.8 * 0.65
  "beat-08": 1.0, // 1.6 * 0.65
  "beat-09": 1.3, // 2.0 * 0.65
  "beat-10": 2.5,
};

export const TIMELINE = buildTimeline(BEAT_ORDER, BEATS, HOLD_SECONDS, FPS);
export const TOTAL_DURATION = totalDuration(BEAT_ORDER, TIMELINE);
export const frameOfWord = frameOfWordFactory(BEATS, TIMELINE, FPS);
