import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/DontWaitWeeklyReview/production.ts";

test(
  "browser output shows Friday work reaching build, fixed commitment, adaptive guidance and gold CTA",
  { timeout: 180000 },
  () => {
    const dir = mkdtempSync(join(tmpdir(), "weekly-review-pixels-"));
    const render = (n: number, local: number) => {
      const frame = movie.scenes[n].from + local,
        file = join(dir, `${frame}.png`);
      execFileSync(
        "npx",
        ["remotion", "still", "DontWaitWeeklyReview", file, `--frame=${frame}`],
        { stdio: "pipe" },
      );
      return execFileSync(
        "ffmpeg",
        ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        { maxBuffer: 1920 * 1080 * 4 },
      );
    };
    const count = (p: Buffer, b: number[], rgb: number[]) => {
      let hits = 0;
      for (let y = b[1]; y < b[3]; y++)
        for (let x = b[0]; x < b[2]; x++)
          if (rgb.every((v, i) => p[(y * 1920 + x) * 3 + i] === v)) hits++;
      return hits;
    };
    const gray = [212, 211, 210],
      gold = [238, 165, 48],
      bg = [21, 16, 15];
    try {
      const monday = render(2, movie.scenes[2].duration - 1);
      const tuesday = render(3, 0);
      assert.ok(
        count(monday, [1280, 390, 1530, 440], gray) > 500,
        "Monday blocked work is visible",
      );
      for (let y = 390; y < 440; y++) {
        const start = (y * 1920 + 1280) * 3,
          end = (y * 1920 + 1530) * 3;
        assert.deepEqual(
          monday.subarray(start, end),
          tuesday.subarray(start, end),
          "Monday label pixels remain fixed across the Tuesday cut",
        );
      }
      const process = movie.scenes[4].visuals![0];
      if (process.kind !== "process") throw Error("Friday process required");
      const early = render(4, Math.max(0, process.moves[0].start - 1)),
        build = render(4, process.moves[0].end + 30),
        delay = render(4, movie.scenes[4].duration - 1);
      assert.ok(
        count(early, [344, 454, 376, 486], gray) > 250,
        "change waits for Friday decision",
      );
      assert.ok(
        count(build, [944, 454, 976, 486], gray) > 250,
        "decision releases the change to build",
      );
      assert.equal(
        count(build, [1544, 454, 1576, 486], gray),
        0,
        "test is still ahead",
      );
      assert.ok(
        count(delay, [1064, 370, 1066, 540], gray) > 300,
        "planned go live remains fixed",
      );
      const actual = count(delay, [1406, 370, 1410, 538], gray);
      assert.ok(
        actual > 100 && actual < 300,
        "actual go live is a later dashed milestone",
      );
      const cadence = render(6, movie.scenes[6].duration - 1);
      for (const box of [
        [330, 410, 870, 750],
        [1050, 410, 1650, 750],
      ])
        assert.ok(
          count(cadence, box, gold) > 600,
          "both daily and weekly can be appropriate",
        );
      for (const p of [early, build, delay, cadence])
        assert.equal(
          count(p, [120, 900, 1800, 1050], bg),
          1680 * 150,
          "explanations have no subtitle strip",
        );
      const closing = render(
        10,
        Math.round((movie.scenes[10].narration[0].startMs * movie.fps) / 1000) +
          30,
      );
      assert.ok(
        count(closing, [120, 300, 1800, 750], gold) > 1500,
        "CTA enters gold",
      );
      assert.equal(
        count(closing, [120, 300, 1800, 750], gray),
        0,
        "no neutral text in CTA",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
