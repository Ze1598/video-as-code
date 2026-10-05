import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { movie, storyboard, cues } from "../src/WorkingTogether105/plan.ts";
import { frameState, renderSvg } from "../src/lib/essay-sdk/index.ts";

test("episode 105 preserves the complete recording and uses stock SDK rendering", () => {
  const manifest = JSON.parse(readFileSync("public/recordings/WorkingTogether105/source-manifest.json", "utf8"));
  for (const file of [manifest.source, "public/recordings/WorkingTogether105/source.m4a"])
    assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"), "d0a88e14a27f5ccd900c89b81e9ba7ab4f0cab29d37f98ef6a35a0d8760ae8ca");
  const baseline = JSON.parse(readFileSync("src/WorkingTogether105/sdk-baseline.json", "utf8"));
  for (const [file, hash] of Object.entries(baseline)) assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"), hash);
  assert.equal(movie.duration, Math.ceil(1326.486349 * movie.fps));
  assert.equal(movie.audio?.duration, movie.duration);
  assert.equal(movie.audio?.src, "recordings/WorkingTogether105/source.m4a");
  assert.ok(movie.scenes.every(s => !s.audio));
});

test("every explanatory beat has source-bound cues, continuous coverage and readable content", () => {
  assert.equal(storyboard.length, movie.scenes.length);
  let end = 0;
  for (const scene of movie.scenes) {
    assert.equal(scene.from, end);
    end += scene.duration;
    for (const local of [0, Math.floor(scene.duration / 2), scene.duration - 1]) {
      const state = frameState(movie, scene.from + local);
      const svg = renderSvg(state);
      assert.match(svg, /<text/, scene.id);
      assert.ok(!/NaN|undefined/.test(svg), scene.id);
      if (scene.groups.length || scene.visuals?.length) assert.equal(state.caption, "");
    }
    const v = scene.visuals?.[0];
    if (v?.kind === "comparison") assert.ok(Math.min(...v.rows.flatMap(r => [r.left.at, r.right.at])) <= 3 * movie.fps, `${scene.id}: establish a meaningful entry without a long empty setup`);
  }
  assert.equal(end, movie.duration);
  for (const cue of cues) assert.ok(cue.text.trim());
});

test("cooperation, rework and testing preserve the discussion's causal meaning", () => {
  const scene = (id: string) => movie.scenes.find(s => s.id === id)!;
  assert.deepEqual(scene("first-help").groups.map(g => g.id), ["a", "b"]);
  assert.deepEqual(scene("refusal").groups.map(g => g.id), ["a", "b"]);
  assert.equal(scene("first-help").transfers[0].to, "a");
  assert.equal(scene("refusal").transfers.length, 0, "Team A refuses the return request");
  for (const id of ["secondhand-loop", "alignment-loop"]) {
    const v = scene(id).visuals![0];
    assert.equal(v.kind, "process");
    if (v.kind === "process") assert.equal(v.moves[v.moves.length - 1]?.to, v.initial, "work returns instead of advancing");
  }
  assert.ok(scene("capacity-objection"), "genuine inability to help remains distinct from selfishness");
  assert.ok(scene("meeting-bloat"), "inviting everyone is not the solution");
  assert.ok(scene("orders-objection"), "do not erase the objection to imposed tests");
  const conditions = scene("accept-evidence").visuals![0];
  if (conditions.kind !== "comparison") throw Error("conditional outcomes required");
  assert.match(conditions.left, /^If /);
  assert.match(conditions.right, /^If /);
  assert.equal(scene("close").textStyle, "italic");
  assert.match(scene("close").narration.map(w => w.text).join(" "), /what broken system are you currently tolerating/i);
  assert.ok(!scene("close").narration.some(w => /attributing|Ethiopian/.test(w.text)));
});
