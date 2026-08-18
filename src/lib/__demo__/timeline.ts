import { buildTimeline, frameOfWordFactory } from "../timeline";
import { DEMO_BEATS } from "./data";

export const FPS = 60;

export const BEAT_ORDER = ["hook", "diagram", "list", "split", "longform", "cta"];

const HOLD_SECONDS: Record<string, number> = {
  hook: 1.0,
  diagram: 1.5,
  list: 1.0,
  split: 1.0,
  longform: 1.0,
  cta: 1.5,
};

export const TIMELINE = buildTimeline(BEAT_ORDER, DEMO_BEATS, HOLD_SECONDS, FPS);
export const TOTAL_DURATION = TIMELINE.cta.from + TIMELINE.cta.duration;
export const frameOfWord = frameOfWordFactory(DEMO_BEATS, TIMELINE, FPS);
