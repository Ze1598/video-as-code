import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { movie } from "../src/DontWaitWeeklyReview/production.ts";
import { SLIDES } from "../src/DontWaitWeeklyReview/script.ts";

test("approved production uses actual paced words and preserves source audio", () => {
  assert.equal(movie.scenes.length, SLIDES.length);
  for (const [i, scene] of movie.scenes.entries()) {
    const raw = JSON.parse(
      readFileSync(
        `public/voiceover/DontWaitWeeklyReview/${scene.id}.json`,
        "utf8",
      ),
    );
    const paced = JSON.parse(
      readFileSync(
        `public/voiceover/DontWaitWeeklyReviewPaced/${scene.id}.json`,
        "utf8",
      ),
    );
    assert.equal(scene.narration.map((w) => w.text).join(" "), SLIDES[i].text);
    assert.equal(
      scene.narration[0].startMs,
      Math.round(raw.words[0].startMs + (i ? 500 : 0)),
    );
    assert.equal(
      scene.narration[scene.narration.length - 1].endMs,
      Math.round(paced.words[paced.words.length - 1].endMs),
    );
    assert.equal(
      scene.audio?.src,
      `voiceover/DontWaitWeeklyReviewPaced/${scene.id}.mp3`,
    );
    assert.ok(
      existsSync(`public/voiceover/DontWaitWeeklyReview/${scene.id}.mp3`),
    );
    assert.ok(
      (scene.audio!.duration * 1000) / 60 >=
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
  }
  const outcome = movie.scenes[4].visuals!;
  assert.equal(
    outcome[0].end,
    outcome[1].start,
    "process transitions directly to delay",
  );
  if (outcome[0].kind !== "process" || outcome[1].kind !== "timeline")
    throw Error("story patterns required");
  assert.ok(
    outcome[0].end - outcome[0].moves[0].end >= 30,
    "work settles after Friday decision",
  );
  assert.ok(
    outcome[1].end - outcome[1].moves[0].end >= 30,
    "delay settles before the next thought",
  );
});
