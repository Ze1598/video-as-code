import test from "node:test";
import assert from "node:assert/strict";
import { accentEnvelope } from "../src/archive/lib/diagram/emphasis.ts";
import { ACCENT, BG, DIM_TEXT, LINE_ACTIVE, LINE_INACTIVE, TEXT } from "../src/lib/essay-sdk/palette.ts";
import {
  MAIN_QUEST_ACCENT_END,
  MAIN_QUEST_ACCENT_START,
  MAIN_QUEST_LABEL_COLOR,
  SIDE_QUEST_LABEL_COLOR,
  mainQuestAccent,
} from "../src/ChangingTooMuchV3/emphasis.ts";
import { narratedHighlightProgress } from "../src/archive/lib/scenes/highlightTiming.ts";
import {
  DIAGRAM_RETURN_WIPE_END,
  MEETING_CONNECTOR_START_V4,
} from "../src/ChangingTooMuchV4/timing.ts";

test("the visual essay palette has one neutral text color and one retention accent", () => {
  assert.equal(BG, "#15100F");
  assert.equal(TEXT, "#D4D3D2");
  assert.equal(DIM_TEXT, TEXT);
  assert.equal(LINE_ACTIVE, TEXT);
  assert.equal(LINE_INACTIVE, TEXT);
  assert.equal(ACCENT, "#EEA530");
});

test("ChangingTooMuchV4 reveals the meeting connector only after the return wipe", () => {
  assert.ok(MEETING_CONNECTOR_START_V4 > DIAGRAM_RETURN_WIPE_END);
});

test("accentEnvelope is bounded and returns to neutral after the narrated guidance", () => {
  const window = { startFrame: 100, endFrame: 200, fadeInFrames: 10, fadeOutFrames: 20 };
  assert.equal(accentEnvelope(99, window), 0);
  assert.equal(accentEnvelope(100, window), 0);
  assert.equal(accentEnvelope(110, window), 1);
  assert.equal(accentEnvelope(150, window), 1);
  assert.equal(accentEnvelope(190, window), 0.5);
  assert.equal(accentEnvelope(200, window), 0);
  assert.equal(accentEnvelope(240, window), 0);
});

test("ChangingTooMuchV3 reserves gold for the main-quest retention cue", () => {
  assert.equal(SIDE_QUEST_LABEL_COLOR, LINE_ACTIVE);
  assert.equal(MAIN_QUEST_LABEL_COLOR, ACCENT);
  assert.equal(mainQuestAccent(MAIN_QUEST_ACCENT_START - 1), 0);
  assert.equal(mainQuestAccent(MAIN_QUEST_ACCENT_START), 0);
  assert.equal(mainQuestAccent(MAIN_QUEST_ACCENT_START + 12), 1);
  assert.equal(mainQuestAccent(MAIN_QUEST_ACCENT_END), 0);
});

test("text highlights stay neutral until narration reaches the retained phrase", () => {
  const words = [
    { text: "Keep", startMs: 0, endMs: 250 },
    { text: "the", startMs: 300, endMs: 450 },
    { text: "main", startMs: 800, endMs: 1050 },
    { text: "quest.", startMs: 1100, endMs: 1450 },
  ];
  const text = "Keep the main quest.";
  const beforeCue = narratedHighlightProgress(words, text, "main quest.", 30, 60);
  const atCue = narratedHighlightProgress(words, text, "main quest.", 48, 60);
  const afterFade = narratedHighlightProgress(words, text, "main quest.", 56, 60);

  assert.equal(beforeCue, 0);
  assert.equal(atCue, 0);
  assert.equal(afterFade, 1);
});
