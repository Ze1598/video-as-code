import test from "node:test";
import assert from "node:assert/strict";
import { compileEssay, frameState, type Scene } from "../src/lib/essay-sdk/index.ts";

const reciprocal: Scene = {
  id: "reciprocal", duration: 360, narration: [],
  groups: [{ id: "a", label: "Your team", members: 3 }, { id: "b", label: "Other teams", members: 3 }],
  items: [{ id: "given", label: "Help given", kind: "work", owner: "a" }, { id: "returned", label: "Help returned", kind: "work", owner: "b", revealAt: 150 }],
  transfers: [{ item: "given", to: "b", start: 30, end: 90 }, { item: "returned", to: "a", start: 150, end: 210, route: "cross-first" }],
  topics: [{ group: "b", item: "returned", start: 150, end: 300 }], takeaways: [],
};

test("a reciprocal return crosses the vacant row before aligning, leaving received help readable", () => {
  const movie = compileEssay({ fps: 60, scenes: [reciprocal] });
  const given = frameState(movie, 149).items.find(i => i.id === "given")!;
  for (let frame = 150; frame <= 210; frame++) {
    const state = frameState(movie, frame);
    const first = state.items.find(i => i.id === "given")!;
    const returned = state.items.find(i => i.id === "returned")!;
    assert.deepEqual([first.x, first.y, first.owner], [given.x, given.y, "b"]);
    const separated = returned.x + returned.width <= first.x || first.x + first.width <= returned.x || returned.y + returned.height <= first.y || first.y + first.height <= returned.y;
    assert.ok(separated, `contributions overlap at frame ${frame}`);
    const cursor = state.cursors.find(c => c.item === "returned")!;
    assert.equal(cursor.x, returned.x - 24);
    assert.equal(cursor.y, returned.y + 24);
  }
  const midway = frameState(movie, 180).items.find(i => i.id === "returned")!;
  assert.equal(midway.y, 390, "return crosses on its original vacant row");
  assert.ok(midway.x < 1200 && midway.x > 450);
  const end = frameState(movie, 210).items.find(i => i.id === "returned")!;
  assert.equal(end.owner, "a");
  assert.equal(end.y, 495);
});

test("default handoffs retain alignment-first motion and unknown routes are rejected", () => {
  const movie = compileEssay({ fps: 60, scenes: [reciprocal] });
  const early = frameState(movie, 45).items.find(i => i.id === "given")!;
  const first = frameState(movie, 30).items.find(i => i.id === "given")!;
  assert.equal(early.x, first.x);
  assert.ok(early.y > first.y);
  assert.throws(() => compileEssay({ fps: 60, scenes: [{ ...reciprocal, transfers: [{ ...reciprocal.transfers[0], route: "invalid" as "cross-first" }] }] }), /route/);
});
