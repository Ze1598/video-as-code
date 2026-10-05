import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NARRATION, AUDIO_REQUEST } from "../src/StartBeforeBelief/audio.ts";

test("StartBeforeBelief encodes the full script and every requested pause once", () => {
  const defaults = JSON.parse(readFileSync(".agents/skills/generate-essay-audio/assets/narration-defaults.json", "utf8"));
  assert.equal(AUDIO_REQUEST.model_id, defaults.modelId);
  assert.deepEqual(AUDIO_REQUEST.voice_settings, defaults.voiceSettings);
  assert.deepEqual(NARRATION.pausePlan, defaults.pausePlan);
  const script = NARRATION.segments.map(s => s.sentences.join(" ")).join(" ");
  assert.equal(AUDIO_REQUEST.text.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " ").trim(), script);
  assert.equal(AUDIO_REQUEST.text.match(/\[pause for 0\.25 seconds\]/g)?.length, NARRATION.segments.reduce((n, s) => n + s.sentences.length - 1, 0));
  assert.equal(AUDIO_REQUEST.text.match(/\[pause for 1\.25 seconds\]/g)?.length, NARRATION.segments.length - 1);
  assert.ok(AUDIO_REQUEST.text.endsWith("[pause for 0.75 seconds]"));
  assert.match(AUDIO_REQUEST.text, /^\[Warm, conversational voice, measured delivery\] A delivery manager/);
});

test("the script preserves challenge, honest disagreement and the manager's accountability", () => {
  const script = NARRATION.segments.map(s => s.sentences.join(" ")).join(" ");
  const review = readFileSync("src/StartBeforeBelief/SCRIPT.md", "utf8");
  for (const segment of NARRATION.segments) assert.ok(review.includes(segment.sentences.join(" ")));
  for (const phrase of ["address the points raised", "don't have to pretend they agree", "before the results arrive", "admit you were wrong"]) assert.ok(script.includes(phrase), phrase);
  assert.ok(script.includes("what results would make you continue, and what would make you stop"));
});
