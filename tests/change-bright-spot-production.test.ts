import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { movie } from '../src/ChangeBrightSpot/production.ts';
import { SLIDES } from '../src/ChangeBrightSpot/script.ts';

test('production uses complete approved narration and settled process actions', () => {
  assert.equal(movie.scenes.length, SLIDES.length);
  for (const [i, scene] of movie.scenes.entries()) {
    assert.equal(scene.narration.map(w=>w.text).join(' '),SLIDES[i].text);
    assert.ok(scene.audio);
    assert.match(scene.audio.src,/^voiceover\/ChangeBrightSpotPaced\/beat-\d\d\.mp3$/);
    assert.ok(existsSync(`public/${scene.audio.src}`));
    assert.ok(scene.audio.duration >= scene.narration[scene.narration.length-1].endMs * movie.fps/1000);
    assert.ok(scene.duration > scene.audio.duration);
    if (i) assert.ok(scene.narration[0].startMs >= 500,'later scenes retain actual lead-in silence');
    for (const visual of scene.visuals ?? []) {
      if(visual.kind !== 'process') continue;
      for (const [j, move] of visual.moves.entries()) {
        assert.ok((visual.moves[j+1]?.start ?? visual.end)-move.end >= 30,'work settles before next action or cut');
      }
    }
  }
});
