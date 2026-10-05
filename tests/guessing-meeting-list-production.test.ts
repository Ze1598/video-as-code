import test from "node:test";
import assert from "node:assert/strict";
import { movie } from "../src/GuessingMeetingList/production.ts";
import { SLIDES } from "../src/GuessingMeetingList/script.ts";
import { frameState, renderSvg } from "../src/lib/essay-sdk/index.ts";

const scene = (id: string) => movie.scenes.find(s => s.id === id)!;
const state = (id: string, frame: number) => frameState(movie, scene(id).from + frame);

test("production plays the actual narration once and preserves every spoken word", () => {
  assert.equal(movie.fps, 60);
  assert.equal(movie.audio?.src, "voiceover/GuessingMeetingList-take-02/narration.mp3");
  assert.equal(movie.audio?.duration, movie.duration);
  assert.ok(movie.scenes.every(s => !s.audio));
  assert.deepEqual(movie.scenes.map(s => ({ id: s.id, text: s.narration.map(w => w.text).join(" ") })), SLIDES);
});

test("developers receive the briefing and introduce constraints with immediate focus", () => {
  assert.ok(!scene("kickoff").groups.some(g => g.id === "developers"));
  const s = scene("constraints");
  const transfer = s.transfers.find(t => t.item === "briefing")!;
  assert.equal(state(s.id, transfer.start).items.find(i => i.id === "briefing")?.owner, "planners");
  assert.equal(state(s.id, transfer.end).items.find(i => i.id === "briefing")?.owner, "developers");
  assert.ok(s.duration - transfer.end >= 30);
  for (const id of ["unsupported", "unplanned"]) {
    const item = s.items.find(i => i.id === id)!;
    const at = item.revealAt!;
    assert.equal(state(s.id, at - 1).items.find(i => i.id === id)?.visible, false);
    assert.equal(state(s.id, at).items.find(i => i.id === id)?.focused, true);
    assert.ok(state(s.id, at).cursors.some(c => c.item === id));
  }
  assert.equal(state(s.id, s.duration - 1).relationships.length, 1);
  const earlier = state(s.id, s.items.find(i => i.id === "unsupported")!.revealAt! + 20).items.find(i => i.id === "unsupported")!;
  const later = state(s.id, s.duration - 1).items.find(i => i.id === "unsupported")!;
  assert.deepEqual([earlier.x, earlier.y, earlier.color, earlier.opacity], [later.x, later.y, later.color, later.opacity]);
});

test("questions return from developers through planners and repeat a real discussion path", () => {
  const process = scene("rework").visuals![0];
  assert.equal(process.kind, "process");
  if (process.kind !== "process") return;
  assert.equal(process.initial, "developers");
  assert.deepEqual(process.moves.map(m => m.to), ["planners", "account", "planners", "developers", "planners"]);
  for (const move of process.moves) {
    const v = state("rework", move.end).visual;
    assert.equal(v?.kind === "process" ? v.token.stage : undefined, move.to);
  }
});

test("only recommendations use gold and only the close has narration text", () => {
  for (const s of movie.scenes.slice(0, 5)) {
    const frame = state(s.id, s.duration - 1);
    assert.equal(frame.caption, "");
    assert.ok(!renderSvg(frame).includes("#EEA530"));
  }
  const guidance = state("invitation", scene("invitation").duration - 1).visual;
  assert.equal(guidance?.kind, "comparison");
  if (guidance?.kind !== "comparison") return;
  const gold = guidance.cells.filter(c => c.color === "#EEA530");
  assert.deepEqual(gold.map(c => c.text), ["Include them", "Send the outcome"]);
  for (const word of ["Bring", "Don't"]) {
    const cue = scene("close").narration.find(w => w.text === word)!;
    const f = state("close", Math.ceil(cue.startMs * 60 / 1000));
    assert.equal(f.captionStyle, "italic");
    assert.equal(f.captionColor, "#EEA530");
    assert.ok(f.caption.startsWith(word));
  }
});
