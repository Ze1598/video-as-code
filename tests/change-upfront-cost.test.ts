import test from "node:test";
import assert from "node:assert/strict";
import { buildMovie } from "../src/ChangeUpfrontCost/plan.ts";
import { previewBeats } from "../src/ChangeUpfrontCost/preview.ts";
import { frameState, renderSvg } from "../src/lib/essay-sdk/index.ts";

test("adoption competes with delivery before the missed commitment; guidance finishes gold", () => {
  const movie = buildMovie(previewBeats);
  assert.equal(movie.scenes.length, 9);
  const allocation = movie.scenes[3].visuals![0];
  assert.equal(allocation.kind, "allocation");
  if (allocation.kind !== "allocation") throw Error("allocation required");
  assert.equal(allocation.initial, "delivery");
  assert.equal(allocation.units, 6);
  assert.deepEqual(
    allocation.moves.map((m) => m.to),
    ["learning", "checking"],
  );
  assert.equal(new Set(allocation.moves.flatMap((m) => m.units)).size, 4);
  assert.equal(movie.scenes[4].visuals![0].kind, "timeline");
  assert.equal(movie.scenes[8].textStyle, "italic");
  assert.deepEqual(movie.scenes[8].takeaways, [
    { text: true, start: 0, end: movie.scenes[8].duration },
  ]);
  for (const scene of movie.scenes.slice(0, 8)) {
    assert.ok(
      scene.groups.length || scene.visuals?.length,
      "each explanation has a visual",
    );
    assert.equal(frameState(movie, scene.from + 60).caption, "");
  }
  assert.match(
    renderSvg(frameState(movie, movie.scenes[8].from + 60)),
    /#EEA530/,
  );
});

test("production rejects missing or altered narration and uses paced source duration", () => {
  assert.throws(() => buildMovie({}), /Missing narration/);
  const altered = structuredClone(previewBeats);
  altered["beat-01"].words[0].text = "Invented";
  assert.throws(() => buildMovie(altered), /Script mismatch/);
  const movie = buildMovie(previewBeats, "ChangeUpfrontCostPaced");
  assert.equal(
    movie.scenes[0].audio?.src,
    "voiceover/ChangeUpfrontCostPaced/beat-00.mp3",
  );
  assert.ok(
    movie.scenes[0].audio!.duration >=
      previewBeats["beat-00"].durationMs * 0.06,
  );
});

test('closing planning actions enter with their own narration in one sequential list', () => {
  const movie = buildMovie(previewBeats);
  const scene = movie.scenes[7];
  assert.equal(scene.visuals?.length ?? 0, 0, 'no single-row contrast between two recommended actions');
  assert.deepEqual(scene.items.map(i=>i.label), ['Plan time for adoption','Reduce or defer existing work','If nothing moves, defer change']);
  for (const [index, phrase] of [[1, 'If the schedule'], [2, 'If nothing']] as const) {
    const words = scene.narration;
    const at = words.findIndex((_, i)=>words.slice(i,i+phrase.split(' ').length).map(w=>w.text).join(' ') === phrase);
    const cue = Math.round(words[at].startMs*.06);
    assert.equal(scene.items[index].revealAt,cue);
    assert.equal(scene.topics[index].start,cue);
    assert.equal(frameState(movie,scene.from+cue-1).items[index].visible,false);
    assert.equal(frameState(movie,scene.from+cue).items[index].visible,true);
  }
});

test('opening fades for half a second and focuses reading before productivity', () => {
  const movie = buildMovie(previewBeats);
  assert.equal(movie.fadeInFrames,30);
  assert.equal(frameState(movie,0).openingOpacity,0);
  assert.equal(frameState(movie,15).openingOpacity,0.5);
  assert.equal(frameState(movie,30).openingOpacity,1);
  const first = movie.scenes[0];
  assert.deepEqual(first.items.filter(i=>i.owner==='management').map(i=>i.label), ['Read about AI','Expected productivity gains']);
  const productivity = Math.round(first.narration.find(w=>w.text==='productivity.')!.startMs*.06);
  assert.deepEqual(frameState(movie,productivity-1).cursors.map(c=>c.item),['read']);
  assert.deepEqual(frameState(movie,productivity).cursors.map(c=>c.item),['promise']);
});


test('opening and gold Management actions use the same left-aligned list layout as isolated Engineering', () => {
  const movie = buildMovie(previewBeats);
  const opening = frameState(movie,movie.scenes[0].duration-1);
  const isolated = frameState(movie,movie.scenes[1].from+movie.scenes[1].duration-1);
  const planning = frameState(movie,movie.scenes[7].from+movie.scenes[7].duration-1);
  assert.ok(planning.items.every(item=>item.color === "#EEA530"));
  assert.equal(movie.scenes[7].visuals?.length ?? 0,0,"gold guidance configures the shared actor/list renderer");
  for (const state of [opening,isolated,planning]) for (const item of state.items) {
    const group = state.groups.find(g=>g.id===item.owner)!;
    assert.equal(item.textAnchor,'start');
    assert.equal(item.x+item.width/2,group.x+group.width/2,'headers center over reserved list slots');
    assert.equal(item.x,state.items.find(i=>i.owner===item.owner)!.x,'each list has a common left edge');
  }
});
