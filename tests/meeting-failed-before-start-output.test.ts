import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/MeetingFailedBeforeStart/production.ts";

test(
  "browser frames keep the decision waiting, explain both agenda options, and move preparation before the call",
  { timeout: 180000 },
  () => {
    const dir = mkdtempSync(join(tmpdir(), "meeting-agenda-pixels-"));
    const render = (n: number, local: number) => {
      const frame = movie.scenes[n].from + local,
        file = join(dir, `${frame}.png`);
      execFileSync(
        "npx",
        [
          "remotion",
          "still",
          "MeetingFailedBeforeStart",
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
      const blocked = render(3, movie.scenes[3].duration - 1);
      assert.ok(
        count(blocked, [344, 454, 376, 486], gray) > 250,
        "scope decision remains at preparation needed",
      );
      assert.equal(
        count(blocked, [1544, 454, 1576, 486], gray),
        0,
        "a completed decision is not invented",
      );
      assert.equal(
        count(blocked, [120, 300, 1800, 750], gold),
        0,
        "failed meeting is not promoted",
      );
      const agenda = render(6, movie.scenes[6].duration - 1);
      for (const box of [
        [330, 390, 870, 750],
        [1050, 390, 1750, 750],
      ])
        assert.ok(
          count(agenda, box, gold) > 1500,
          "each option shows its proposed change and consequences",
        );
      const process = movie.scenes[8].visuals![0];
      if (process.kind !== "process") throw Error("prepared process required");
      const preparing = render(8, process.moves[0].end + 30),
        ready = render(8, process.moves[1].end + 30);
      assert.ok(
        count(preparing, [944, 454, 976, 486], gray) > 250,
        "trade-off is at prerequisite checks",
      );
      assert.equal(
        count(preparing, [1544, 454, 1576, 486], gray),
        0,
        "does not jump straight to meeting",
      );
      assert.ok(
        count(ready, [1544, 454, 1576, 486], gray) > 250,
        "prepared trade-off reaches meeting",
      );
      assert.equal(
        count(ready, [944, 454, 976, 486], gray),
        0,
        "no duplicate at prerequisite checks",
      );
      for (const p of [blocked, agenda, preparing, ready])
        assert.equal(
          count(p, [120, 900, 1800, 1050], bg),
          1680 * 150,
          "no subtitle band under visuals",
        );
      const final = render(
        9,
        Math.round((movie.scenes[9].narration[0].startMs * movie.fps) / 1000) +
          30,
      );
      assert.ok(
        count(final, [120, 300, 1800, 750], gold) > 1500,
        "CTA appears in gold",
      );
      assert.equal(
        count(final, [120, 300, 1800, 750], gray),
        0,
        "CTA has no neutral lines",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
