import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NARRATION, AUDIO_REQUEST } from "../src/GuessingMeetingList/audio.ts";

test("the full essay requests every pause once, with no opening delay", () => {
  const defaults = JSON.parse(readFileSync(".agents/skills/generate-essay-audio/assets/narration-defaults.json", "utf8"));
  assert.equal(AUDIO_REQUEST.model_id, defaults.modelId);
  assert.deepEqual(AUDIO_REQUEST.voice_settings, defaults.voiceSettings);
  assert.deepEqual(NARRATION.pausePlan, defaults.pausePlan);
  const internal = NARRATION.segments.reduce((n, s) => n + s.sentences.length - 1, 0);
  assert.equal(AUDIO_REQUEST.text.match(/\[pause for 0\.25 seconds\]/g)?.length, internal);
  assert.equal(AUDIO_REQUEST.text.match(/\[pause for 1\.25 seconds\]/g)?.length, NARRATION.segments.length - 1);
  assert.ok(AUDIO_REQUEST.text.endsWith("[pause for 0.75 seconds]"));
  assert.match(AUDIO_REQUEST.text, /^\[Warm, conversational voice, measured delivery\] The account manager/);
});

test("tagged request and review script preserve precisely the same spoken words", () => {
  const spoken = NARRATION.segments.map(s => s.sentences.join(" ")).join(" ");
  assert.equal(AUDIO_REQUEST.text.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " ").trim(), spoken);
  const script = readFileSync("src/GuessingMeetingList/SCRIPT.md", "utf8");
  for (const segment of NARRATION.segments) assert.ok(script.includes(segment.sentences.join(" ")));
  assert.ok(spoken.includes("understand, question, or help decide"), "inclusion is broader than decision authority");
  assert.ok(spoken.includes("Send them the outcome."), "adjacent people still receive the outcome");
});
