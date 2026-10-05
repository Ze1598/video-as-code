import test from "node:test";
import assert from "node:assert/strict";
import { movie } from "../src/CooperationWithoutConsequences/production.ts";
import { SLIDES } from "../src/CooperationWithoutConsequences/script.ts";
import { frameState, renderSvg } from "../src/lib/essay-sdk/index.ts";

const scene = (id: string) => movie.scenes.find(s => s.id === id)!;
const state = (id: string, local: number) => frameState(movie, scene(id).from + local);

test("one continuous recording preserves the exact cooperation script and timings", () => {
  assert.equal(movie.fps, 60);
  assert.equal(movie.audio?.src, "voiceover/CooperationWithoutConsequences-take-01/narration.mp3");
  assert.equal(movie.audio?.duration, movie.duration);
  assert.ok(movie.scenes.every(s => !s.audio));
  assert.deepEqual(movie.scenes.map(s => ({ id: s.id, text: s.narration.map(w => w.text).join(" ") })), SLIDES);
});

test("a developer is lent once, while the refused return moves no one", () => {
  const s = scene("agreement"), t = s.transfers[0];
  assert.equal(s.transfers.length, 1);
  assert.equal(state(s.id, t.start).items.find(i => i.id === "developer")?.owner, "a");
  assert.equal(state(s.id, t.end).items.find(i => i.id === "developer")?.owner, "b");
  assert.ok(s.duration - t.end >= 30);
  assert.equal(scene("refusal").transfers.length, 0);
  for (const id of ["agreement", "refusal"]) {
    const s = scene(id);
    assert.equal(state(id, s.duration - 1).relationships.length, 1);
    for (const item of s.items) {
      const at = item.revealAt ?? 0;
      assert.equal(state(id, at).items.find(i => i.id === item.id)?.focused, true);
    }
  }
});

test("the incentive to withdraw is neutral while reciprocal help is promoted without collisions", () => {
  for (const id of ["agreement", "refusal", "horizon", "incentives"]) assert.ok(!renderSvg(state(id, scene(id).duration - 1)).includes("#EEA530"));
  const s = scene("reciprocity");
  assert.equal(s.transfers.length, 2);
  assert.notEqual(s.transfers[0].item, s.transfers[1].item);
  const end = state(s.id, s.duration - 1);
  assert.equal(end.items.find(i => i.id === "given")?.owner, "others");
  assert.equal(end.items.find(i => i.id === "returned")?.owner, "your");
  assert.ok(end.items.every(i => i.color === "#EEA530"));
  const t = s.transfers[1];
  for (let at = t.start; at <= t.end; at++) {
    const f = state(s.id, at), a = f.items.find(i => i.id === "given")!, b = f.items.find(i => i.id === "returned")!;
    assert.ok(b.x + b.width <= a.x || a.x + a.width <= b.x || b.y + b.height <= a.y || a.y + a.height <= b.y, `return overlaps received help at ${at}`);
    assert.ok(f.cursors.some(c => c.item === "returned"));
  }
});

test("genuine inability remains distinct from repeated refusal, and access can be rebuilt", () => {
  const first = scene("pattern").visuals![0];
  assert.equal(first.kind, "comparison");
  if (first.kind !== "comparison") return;
  assert.equal(first.left, "Unable to help");
  assert.equal(first.right, "Repeatedly won't help");
  const close = scene("close");
  const firstFrame = Math.ceil(close.narration[0].startMs * 60 / 1000);
  for (const at of [firstFrame, close.duration - 1]) {
    const f = state("close", at);
    assert.ok(f.caption.includes("let a return to cooperation rebuild it."));
    assert.equal(f.captionColor, "#EEA530");
    assert.equal(f.captionStyle, "italic");
  }
  for (const s of movie.scenes.slice(0, -1)) assert.equal(state(s.id, s.duration - 1).caption, "");
});
