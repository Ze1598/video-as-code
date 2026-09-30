import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/DidntRepeatPriority/production.ts";

test(
  "browser output shows research expanding rather than reaching software, then promotes concrete story guidance",
  { timeout: 180000 },
  () => {
    const dir = mkdtempSync(join(tmpdir(), "repeat-priority-pixels-"));
    const render = (n: number, local: number) => {
      const frame = movie.scenes[n].from + local,
        file = join(dir, `${frame}.png`);
      execFileSync(
        "npx",
        [
          "remotion",
          "still",
          "DidntRepeatPriority",
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
      const v = movie.scenes[2].visuals![0];
      if (v.kind !== "process") throw Error("research process required");
      const research = render(2, v.moves[0].end + 30),
        expanded = render(2, v.moves[1].end + 30);
      assert.ok(
        count(research, [744, 454, 776, 486], gray) > 250,
        "feature work reaches research",
      );
      assert.ok(
        count(expanded, [1144, 454, 1176, 486], gray) > 250,
        "feature work reaches more possibilities",
      );
      assert.equal(
        count(expanded, [744, 454, 776, 486], gray),
        0,
        "no duplicate token remains in research",
      );
      for (const p of [research, expanded]) {
        assert.equal(
          count(p, [1544, 454, 1576, 486], gray),
          0,
          "working feature is not presented as delivered",
        );
        assert.equal(
          count(p, [120, 300, 1800, 750], gold),
          0,
          "unnecessary research is neutral",
        );
      }
      const guidance = render(6, movie.scenes[6].duration - 1);
      for (const y of [390, 495, 600])
        assert.ok(
          count(guidance, [600, y, 1320, y + 50], gold) > 400,
          "each concrete story requirement is gold",
        );
      const repeat = render(7, movie.scenes[7].duration - 1);
      assert.ok(
        count(repeat, [330, 390, 870, 750], gray) > 1200,
        "course-correction risk stays neutral",
      );
      assert.equal(
        count(repeat, [330, 390, 870, 750], gold),
        0,
        "no gold for communicating only once",
      );
      assert.ok(
        count(repeat, [1050, 390, 1750, 750], gold) > 1200,
        "repetition at decisions and observed work are promoted",
      );
      for (const p of [research, expanded, guidance, repeat])
        assert.equal(
          count(p, [120, 900, 1800, 1050], bg),
          1680 * 150,
          "no duplicate subtitles under explanation",
        );
      const closing = render(
        8,
        Math.round((movie.scenes[8].narration[0].startMs * movie.fps) / 1000) +
          30,
      );
      assert.ok(
        count(closing, [120, 300, 1800, 750], gold) > 1500,
        "closing guidance enters gold",
      );
      assert.equal(
        count(closing, [120, 300, 1800, 750], gray),
        0,
        "all closing lines are gold",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
