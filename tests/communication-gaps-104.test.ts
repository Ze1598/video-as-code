import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { movie, storyboard, cues } from "../src/CommunicationGaps104/plan.ts";
import { frameState, renderSvg } from "../src/lib/essay-sdk/index.ts";

test("recorded discussion keeps the full source and the existing SDK unchanged", () => {
  const baseline = JSON.parse(readFileSync("src/CommunicationGaps104/sdk-baseline.json", "utf8"));
  for (const [file, hash] of Object.entries(baseline)) assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"), hash, file);
  const manifest = JSON.parse(readFileSync("public/recordings/CommunicationGaps104/source-manifest.json", "utf8"));
  for (const file of [manifest.source, "public/recordings/CommunicationGaps104/source.m4a"]) assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"), manifest.sourceSha256);
  assert.equal(movie.duration, 64086);
  assert.equal(movie.audio?.duration, movie.duration);
  assert.equal(movie.audio?.src, "recordings/CommunicationGaps104/source.m4a");
  assert.ok(movie.scenes.every(s => !s.audio));
});

test("all recorded time has an explanation with transcript-bound changes", () => {
  assert.equal(storyboard.length, movie.scenes.length);
  assert.ok(cues.length > 100, "visual changes follow the discussion throughout");
  for (const cue of cues) assert.ok(cue.text.trim(), `source evidence for ${cue.seconds}`);
  for (const scene of movie.scenes) {
    for (const local of [0, Math.floor(scene.duration / 2), scene.duration - 1]) {
      const svg = renderSvg(frameState(movie, scene.from + local));
      assert.match(svg, /<text/, `${scene.id} must never be blank`);
      assert.ok(!/NaN|undefined/.test(svg));
    }
    if (scene.id !== "close") {
      assert.ok(scene.groups.length || scene.visuals?.length, `${scene.id} needs a diagram`);
      assert.equal(scene.narration.length, 0, "diagrams do not duplicate speech as subtitles");
    }
  }
});

test("three distinct failure mechanisms and their corrections remain explicit", () => {
  const scene = (id: string) => movie.scenes.find(s => s.id === id)!;
  assert.equal(scene("blank-ticket").items.filter(i => i.kind === "issue").length, 3);
  assert.equal(scene("research-loop").visuals?.[0].kind, "process");
  assert.equal(scene("client-dependencies").groups.length, 3);
  assert.equal(scene("monday-tuesday").groups.length, 3);
  const friday = scene("friday-decision").visuals![0];
  assert.equal(friday.kind, "process");
  if (friday.kind === "process") assert.equal(friday.moves.length, 1, "decision releases work to build, not a magically completed release");
  assert.equal(scene("launch-slips").visuals![0].kind, "timeline");
  const cadence = scene("adaptive-cadence").visuals![0];
  if (cadence.kind !== "comparison") throw Error("cadence comparison required");
  assert.equal(cadence.rows[1].left.promoted, true);
  assert.equal(cadence.rows[1].right.promoted, true);
  assert.equal(scene("close").textStyle, "italic");
  assert.equal(scene("close").narration.map(w => w.text).join(" "), "You need to redesign the interface you built around them.");
});
