import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/ChangingTooMuchV11/plan.ts";

test(
  "v11 browser output shows displaced capacity, an unresolved problem, delay and paired guidance",
  { timeout: 180000 },
  () => {
    const dir = mkdtempSync(join(tmpdir(), "essay-pattern-pixels-"));
    const render = (id: string, local: number) => {
      const frame = movie.scenes.find((s) => s.id === id)!.from + local;
      const file = join(dir, `${frame}.png`);
      execFileSync(
        "npx",
        ["remotion", "still", "ChangingTooMuchV11", file, `--frame=${frame}`],
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
      const before = render("beat-04", 60),
        after = render("beat-04", 280);
      assert.ok(
        count(before, [980, 338, 1440, 365], gray) > 9000,
        "six available time units",
      );
      assert.equal(
        count(before, [980, 468, 1440, 625], gray),
        0,
        "no new work allocations yet",
      );
      for (const y of [338, 468, 598]) {
        const pixels = count(after, [980, y, 1440, y + 27], gray);
        assert.ok(
          pixels > 3000 && pixels < 3150,
          "two units in each lane, not duplicated",
        );
      }
      const early = render("beat-05", 90),
        waiting = render("beat-05", 850);
      assert.equal(
        count(early, [640, 320, 880, 430], gray),
        0,
        "meeting prerequisite not introduced early",
      );
      assert.ok(
        count(waiting, [640, 320, 880, 430], gray) > 100,
        "meeting prerequisite introduced",
      );
      assert.ok(
        count(early, [344, 454, 376, 486], gray) > 250,
        "problem begins at investigation",
      );
      assert.ok(
        count(waiting, [1144, 454, 1176, 486], gray) > 250,
        "problem held before resolution",
      );
      assert.equal(
        count(waiting, [1544, 454, 1576, 486], gray),
        0,
        "problem has not reached resolved stage",
      );
      const planned = render("beat-06", 60);
      const delay = render("beat-06", 220);
      assert.equal(
        count(planned, [1455, 370, 1459, 538], gray),
        0,
        "actual milestone is absent before its cue",
      );
      assert.ok(
        count(planned, [1113, 370, 1115, 540], gray) > 300,
        "planned milestone is solid",
      );
      assert.ok(
        count(delay, [1113, 370, 1115, 540], gray) > 300,
        "planned milestone remains in place",
      );
      assert.ok(
        count(delay, [1455, 370, 1459, 540], gray) > 100 &&
          count(delay, [1455, 370, 1459, 540], gray) < 250,
        "actual milestone is a later dashed vertical line",
      );
      // Measure only the two full axis rows, excluding vertical marker extensions.
      assert.equal(
        count(delay, [315, 539, 1580, 541], gray),
        2530,
        "one continuous horizontal time axis",
      );
      const guidance = render("beat-09", 810);
      assert.ok(
        count(delay, [1590, 529, 1607, 552], gray) > 15,
        "time axis has a right arrowhead",
      );
      assert.ok(
        count(delay, [910, 568, 1010, 600], gray) > 100,
        "Time labels the horizontal axis",
      );
      assert.ok(
        count(delay, [1460, 310, 1580, 345], gray) > 100,
        "Actual label is above its milestone",
      );
      const questions = render(
        "beat-03",
        movie.scenes.find((s) => s.id === "beat-03")!.duration - 1,
      );
      for (const y of [495, 600]) {
        assert.ok(
          count(questions, [660, y, 1260, y + 40], gray) > 100,
          "question occupies its single-line row",
        );
        assert.equal(
          count(questions, [660, y + 45, 1260, y + 75], bg),
          600 * 30,
          "no unnecessary wrapped second line below first-line descenders",
        );
      }
      const firstMeeting = render("beat-02", 0);
      assert.ok(
        count(firstMeeting, [155, 405, 215, 430], gray) > 20,
        "meeting cursor exists on the first visible frame",
      );
      for (const pixels of [before, after, early, waiting, planned, delay]) {
        for (const box of [
          [200, 160, 1720, 300],
          [200, 740, 1720, 880],
        ]) {
          assert.equal(
            count(pixels, box, bg),
            1520 * 140,
            "no redundant title or bottom description",
          );
        }
      }
      assert.ok(
        count(guidance, [1030, 340, 1070, 344], gold) > 40,
        "guidance has short horizontal bullet marks",
      );
      assert.ok(
        count(guidance, [330, 410, 870, 710], gray) > 1000,
        "case-study side stays neutral",
      );
      assert.equal(
        count(guidance, [330, 410, 870, 800], gold),
        0,
        "no accent on mistakes",
      );
      assert.ok(
        count(guidance, [1050, 410, 1650, 710], gold) > 1000,
        "paired guidance is gold",
      );
      assert.equal(
        count(guidance, [959, 325, 962, 750], bg) < 3 * 425,
        true,
        "comparison has the reference center divider",
      );
      for (const pixels of [before, after, early, waiting, delay, guidance]) {
        assert.equal(
          count(pixels, [120, 900, 1800, 1050], bg),
          1680 * 150,
          "no narration subtitle beneath visual",
        );
        assert.equal(
          count(pixels, [0, 0, 1920, 1080], [255, 255, 255]),
          0,
          "no white",
        );
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
