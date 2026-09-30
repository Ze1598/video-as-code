import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { movie } from "../src/MeetingFailedBeforeStart/production.ts";
import { SLIDES } from "../src/MeetingFailedBeforeStart/script.ts";

test("meeting production binds the full approved narration and allows preparation actions to settle", () => {
  assert.equal(movie.scenes.length, SLIDES.length);
  for (const [i, scene] of movie.scenes.entries()) {
    const original = JSON.parse(
      readFileSync(
        `public/voiceover/MeetingFailedBeforeStart/${scene.id}.json`,
        "utf8",
      ),
    );
    const paced = JSON.parse(
      readFileSync(
        `public/voiceover/MeetingFailedBeforeStartPaced/${scene.id}.json`,
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
      `voiceover/MeetingFailedBeforeStartPaced/${scene.id}.mp3`,
    );
    assert.ok(
      existsSync(`public/voiceover/MeetingFailedBeforeStart/${scene.id}.mp3`),
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
          "later scenes contain actual lead-in silence",
        );
    }
    for (const t of scene.transfers)
      assert.ok(scene.duration - t.end >= 30, "invite handoff settles");
    for (const v of scene.visuals ?? [])
      if (v.kind === "process")
        for (const [j, move] of v.moves.entries())
          assert.ok(
            (v.moves[j + 1]?.start ?? v.end) - move.end >= 30,
            "preparation steps settle before moving on",
          );
  }
  const detail = movie.scenes[6].visuals!;
  assert.equal(
    detail[0].end,
    detail[1].start,
    "constraint transitions directly to concrete options",
  );
});
