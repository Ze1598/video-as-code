import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/ChangeBrightSpot/production.ts";

test(
  "bright spot browser frames show reader review, return to author, and gold closing guidance",
  { timeout: 180000 },
  () => {
    const dir = mkdtempSync(join(tmpdir(), "bright-spot-pixels-"));
    const render = (frame: number) => {
      const file = join(dir, `${frame}.png`);
      execFileSync(
        "npx",
        [
          "remotion",
          "still",
          "ChangeBrightSpot",
          file,
          `--frame=${frame}`,
        ],
        { stdio: "pipe" },
      );
      return execFileSync(
        "ffmpeg",
        ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        { maxBuffer: 1920 * 1080 * 4 },
      );
    };
    const count = (p: Buffer, box: number[], rgb: number[]) => {
      let hits = 0;
      for (let y = box[1]; y < box[3]; y++)
        for (let x = box[0]; x < box[2]; x++)
          if (rgb.every((v, i) => p[(y * 1920 + x) * 3 + i] === v)) hits++;
      return hits;
    };
    const gray = [212, 211, 210],
      gold = [238, 165, 48],
      bg = [21, 16, 15];
    try {
      const scene = movie.scenes[2],
        visual = scene.visuals![0];
      if (visual.kind !== "process") throw Error("process required");
      const reader = render(scene.from + visual.moves[0].end + 30);
      const returned = render(scene.from + visual.moves[1].end + 30);
      assert.ok(
        count(reader, [1544, 454, 1576, 486], gray) > 250,
        "documentation reaches reader",
      );
      assert.equal(
        count(reader, [344, 454, 376, 486], gray),
        0,
        "no duplicate at author",
      );
      assert.ok(
        count(returned, [344, 454, 376, 486], gray) > 250,
        "documentation returns to author",
      );
      assert.equal(
        count(returned, [1544, 454, 1576, 486], gray),
        0,
        "no duplicate at reader",
      );
      for (const pixels of [reader, returned])
        assert.equal(
          count(pixels, [120, 900, 1800, 1050], bg),
          1680 * 150,
          "no subtitles on explanation",
        );
      const final = movie.scenes[movie.scenes.length - 1];
      const closing = render(final.from + 60);
      assert.ok(
        count(closing, [120, 300, 1800, 750], gold) > 1500,
        "closing instruction enters in gold",
      );
      assert.equal(
        count(closing, [120, 300, 1800, 750], gray),
        0,
        "no neutral closing text",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
