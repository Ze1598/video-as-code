import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { movie } from '../src/ChangeUpfrontCost/production.ts';
import { SLIDES } from '../src/ChangeUpfrontCost/script.ts';

test('final production includes every approved word and preserved paced audio with no clipping', () => {
  assert.equal(movie.scenes.length, SLIDES.length);
  for (const [i, scene] of movie.scenes.entries()) {
    const original = JSON.parse(readFileSync(`public/voiceover/ChangeUpfrontCost/${scene.id}.json`, 'utf8'));
    assert.equal(scene.narration.map(w=>w.text).join(' '), SLIDES[i].text);
    assert.ok(existsSync(`public/${scene.audio!.src}`));
    assert.ok(scene.audio!.duration >= scene.narration[scene.narration.length-1].endMs * movie.fps / 1000);
    assert.equal(scene.narration[0].startMs, Math.round(original.words[0].startMs + (i ? 500 : 0)));
    assert.ok(scene.duration > scene.audio!.duration);
  }
});
