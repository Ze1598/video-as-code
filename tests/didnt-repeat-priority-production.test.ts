import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { movie } from "../src/DidntRepeatPriority/production.ts";
import { SLIDES } from "../src/DidntRepeatPriority/script.ts";

test("priority production uses complete actual narration and preserves paced pauses and settled research actions", () => {
  assert.equal(movie.scenes.length, SLIDES.length);
  for (const [i, scene] of movie.scenes.entries()) {
    const original = JSON.parse(
      readFileSync(
        `public/voiceover/DidntRepeatPriority/${scene.id}.json`,
        "utf8",
      ),
    );
    const paced = JSON.parse(
      readFileSync(
        `public/voiceover/DidntRepeatPriorityPaced/${scene.id}.json`,
        "utf8",
      ),
    );
    assert.equal(scene.narration.map((w) => w.text).join(" "), SLIDES[i].text);
    assert.equal(
      scene.narration[0].startMs,
      Math.round(original.words[0].startMs + (i ? 500 : 0)),
    );
    assert.equal(
      scene.narration[scene.narration.length - 1].endMs,
      Math.round(paced.words[paced.words.length - 1].endMs),
    );
    assert.equal(
      scene.audio?.src,
      `voiceover/DidntRepeatPriorityPaced/${scene.id}.mp3`,
    );
    assert.ok(
      existsSync(`public/voiceover/DidntRepeatPriority/${scene.id}.mp3`),
    );
    assert.ok(
      (scene.audio!.duration * 1000) / movie.fps >=
        scene.narration[scene.narration.length - 1].endMs,
    );
    if (i) {
      const samples = execFileSync("ffmpeg", [
        "-v",
        "error",
        "-i",
        `public/${scene.audio!.src}`,
        "-t",
        "0.4",
        "-f",
        "f32le",
        "-ac",
        "1",
        "-",
      ]);
      for (let offset = 0; offset < samples.length; offset += 4)
        assert.ok(
          Math.abs(samples.readFloatLE(offset)) < 0.001,
          "later scenes begin with actual silence",
        );
    }
    for (const v of scene.visuals ?? [])
      if (v.kind === "process")
        for (const [j, move] of v.moves.entries())
          assert.ok(
            (v.moves[j + 1]?.start ?? v.end) - move.end >= 30,
            "research action settles before next move or cut",
          );
  }
});
