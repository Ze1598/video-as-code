import test from "node:test";
import assert from "node:assert/strict";
import { movie } from "../src/StartBeforeBelief/production.ts";
import { SLIDES } from "../src/StartBeforeBelief/script.ts";
import { frameState, renderSvg } from "../src/lib/essay-sdk/index.ts";

const scene = (id: string) => movie.scenes.find(s => s.id === id)!;
const state = (id: string, local: number) => frameState(movie, scene(id).from + local);

test("one actual recording drives all eight scenes without invented words or playback gaps", () => {
  assert.equal(movie.fps, 60);
  assert.equal(movie.scenes.length, 8);
  assert.equal(movie.audio?.src, "voiceover/StartBeforeBelief-take-01/narration.mp3");
  assert.equal(movie.audio?.duration, movie.duration);
  assert.ok(movie.scenes.every(s => !s.audio));
  assert.deepEqual(movie.scenes.map(s => ({ id: s.id, text: s.narration.map(w => w.text).join(" ") })), SLIDES);
  assert.equal(movie.duration, movie.scenes.reduce((n, s) => n + s.duration, 0));
});

test("concerns appear with focus and the checklist waits in feedback without reaching a trial", () => {
  const proposal = scene("proposal");
  for (const item of proposal.items) {
    const at = item.revealAt ?? 0;
    assert.equal(state("proposal", at).items.find(i => i.id === item.id)?.focused, true);
    if (at) assert.equal(state("proposal", at - 1).items.find(i => i.id === item.id)?.visible, false);
  }
  assert.equal(state("proposal", proposal.duration - 1).relationships.length, 1);
  const waiting = scene("waiting").visuals!.find(v => v.kind === "process")!;
  assert.equal(waiting.kind, "process");
  if (waiting.kind !== "process") return;
  assert.equal(waiting.initial, "revised");
  assert.deepEqual(waiting.moves.map(m => m.to), ["feedback"]);
  for (const local of [waiting.moves[0].end, scene("waiting").duration - 1]) {
    const v = state("waiting", local).visual;
    assert.equal(v?.kind === "process" ? v.token.stage : undefined, "feedback");
  }
  for (const id of ["proposal", "waiting", "unused"]) assert.ok(!renderSvg(state(id, scene(id).duration - 1)).includes("#EEA530"));
});

test("the test requires explicit execution and both continue and stop criteria", () => {
  const decision = scene("decision");
  const process = decision.visuals!.find(v => v.kind === "process")!;
  assert.equal(process.kind, "process");
  if (process.kind !== "process") return;
  assert.deepEqual(process.moves.map(m => m.to), ["address", "decide", "execution"]);
  const criteria = state("decision", decision.duration - 1).visual;
  assert.equal(criteria?.kind, "comparison");
  if (criteria?.kind !== "comparison") return;
  assert.equal(criteria.left, "Continue if");
  assert.equal(criteria.right, "Stop and rethink if");
  assert.ok(criteria.cells.every(c => c.visible && c.color === "#EEA530"));
});

test("honest disagreement stays neutral while the agreed execution is promoted", () => {
  const v = state("followthrough", scene("followthrough").duration - 1).visual;
  assert.equal(v?.kind, "comparison");
  if (v?.kind !== "comparison") return;
  assert.equal(v.cells.find(c => c.text === "Honest disagreement")?.color, "#D4D3D2");
  assert.equal(v.cells.find(c => c.text === "Do the agreed work")?.color, "#EEA530");
  assert.ok(v.cells.filter(c => c.side === "right").every(c => c.color === "#D4D3D2"));
});

test("success criteria precede results and the closing failure condition is italic gold", () => {
  const evidence = scene("evidence").visuals![0];
  assert.equal(evidence.kind, "process");
  if (evidence.kind !== "process") return;
  assert.equal(evidence.initial, "criteria");
  assert.deepEqual(evidence.moves.map(m => m.to), ["results", "judge"]);
  assert.ok(evidence.moves[0].end <= evidence.moves[1].start);
  for (const s of movie.scenes.slice(0, -1)) assert.equal(state(s.id, s.duration - 1).caption, "");
  const closing = scene("close");
  const first = Math.ceil(closing.narration[0].startMs * 60 / 1000);
  for (const at of [first, closing.duration - 1]) {
    const c = state("close", at);
    assert.ok(c.caption.startsWith("If it fails,"));
    assert.equal(c.captionColor, "#EEA530");
    assert.equal(c.captionStyle, "italic");
  }
});
