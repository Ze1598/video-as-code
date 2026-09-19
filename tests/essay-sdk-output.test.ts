import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/ChangingTooMuchV8/plan.ts";

// Raster assertions use independently specified screen regions and RGB values,
// not snapshots blessed after viewing generated images. A blank PNG fails.
test(
  "actual Remotion output has stable neutral lists, dashed focus, staged questions and takeaway emphasis",
  { timeout: 180000 },
  () => {
    const dir = mkdtempSync(join(tmpdir(), "essay-output-"));
    const render = (frame: number) => {
      const file = join(dir, `frame-${frame}.png`);
      execFileSync(
        "npx",
        ["remotion", "still", "ChangingTooMuchV8", file, `--frame=${frame}`],
        { stdio: "pipe" },
      );
      return execFileSync(
        "ffmpeg",
        ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        { maxBuffer: 1920 * 1080 * 4 },
      );
    };
    const count = (pixels: Buffer, box: number[], rgb: number[]) => {
      let hits = 0;
      for (let y = box[1]; y < box[3]; y++)
        for (let x = box[0]; x < box[2]; x++) {
          const offset = (y * 1920 + x) * 3;
          if (rgb.every((v, c) => pixels[offset + c] === v)) hits++;
        }
      return hits;
    };
    try {
      const scene = movie.scenes.find((s) => s.id === "beat-01")!;
      const pixels = render(scene.from + 120);
      assert.equal(
        count(pixels, [0, 0, 100, 100], [21, 16, 15]),
        10000,
        "background RGB",
      );
      assert.ok(
        count(pixels, [450, 215, 600, 300], [212, 211, 210]) > 40,
        "leader glyph",
      );
      assert.ok(
        count(pixels, [1250, 215, 1540, 300], [212, 211, 210]) > 120,
        "team glyphs",
      );
      assert.ok(
        count(pixels, [1190, 345, 1590, 485], [212, 211, 210]) > 100,
        "compact migration item and label",
      );
      // The large panel borders and left-side connector bus have no narrative
      // function. Their independently specified former regions must be empty.
      assert.equal(
        count(pixels, [118, 128, 123, 760], [21, 16, 15]),
        5 * 632,
        "no leader panel border",
      );
      assert.equal(
        count(pixels, [988, 345, 1020, 750], [21, 16, 15]),
        32 * 405,
        "no team panel border or connector bus",
      );
      assert.equal(
        count(pixels, [0, 0, 1920, 1080], [238, 165, 48]),
        0,
        "no case-study gold",
      );
      assert.ok(
        count(pixels, [710, 255, 1210, 266], [212, 211, 210]) > 100,
        "dashed actor relationship spans the gap",
      );
      assert.equal(
        count(pixels, [120, 790, 1800, 1040], [21, 16, 15]),
        1680 * 250,
        "visual scene has no narration subtitles",
      );
      const persistent = render(scene.from + scene.duration - 1);
      assert.ok(
        count(persistent, [710, 255, 1210, 266], [212, 211, 210]) > 100,
        "actor relationship still visible at the end",
      );
      const demands = movie.scenes.find((s) => s.id === "beat-05")!;
      const first = render(demands.from + 90);
      const migrationTopic = demands.topics.find(
        (t) => t.item === "migration",
      )!;
      const later = render(demands.from + migrationTopic.start + 30);
      for (const y of [390, 495, 600]) {
        assert.ok(
          count(first, [790, y, 1140, y + 70], [212, 211, 210]) > 100,
          "visible list row",
        );
        // Exact region equality proves focus has not dimmed, brightened, moved,
        // or reweighted the list text in the actual browser rasterization.
        for (let row = y; row < y + 70; row++) {
          const offset = (row * 1920 + 790) * 3;
          assert.deepEqual(
            first.subarray(offset, offset + 350 * 3),
            later.subarray(offset, offset + 350 * 3),
          );
        }
      }
      assert.ok(
        count(first, [590, 510, 650, 535], [212, 211, 210]) > 20,
        "cursor points at bugs",
      );
      assert.equal(
        count(first, [590, 405, 650, 430], [212, 211, 210]),
        0,
        "no competing cursor",
      );
      assert.ok(
        count(later, [590, 405, 650, 430], [212, 211, 210]) > 20,
        "cursor follows migration topic",
      );
      const questions = movie.scenes.find((s) => s.id === "beat-03")!;
      const firstQuestion = render(
        questions.from + questions.items[0].revealAt! + 30,
      );
      assert.ok(
        count(firstQuestion, [790, 390, 1140, 460], [212, 211, 210]) > 100,
        "first plain question",
      );
      assert.equal(
        count(firstQuestion, [790, 495, 1140, 670], [21, 16, 15]),
        350 * 175,
        "later questions wait for their spoken cues",
      );
      const close = movie.scenes.find((s) => s.id === "beat-09")!;
      const give = close.narration.find((w) => w.text === "Give")!;
      const takeaway = render(
        close.from + Math.ceil((give.startMs * movie.fps) / 1000) + 1,
      );
      assert.ok(
        count(takeaway, [150, 450, 1770, 680], [238, 165, 48]) > 100,
        "main quest gold on first visible sentence",
      );
      assert.equal(
        count(takeaway, [0, 0, 1920, 1080], [255, 255, 255]),
        0,
        "no pure white",
      );
      const cta = movie.scenes.find((s) => s.id === "beat-10")!;
      const ctaPixels = render(
        cta.from + Math.ceil((cta.narration[0].startMs * movie.fps) / 1000),
      );
      assert.ok(
        count(ctaPixels, [150, 450, 1770, 680], [238, 165, 48]) > 1000,
        "CTA enters gold",
      );
      assert.equal(
        count(ctaPixels, [0, 0, 1920, 1080], [212, 211, 210]),
        0,
        "no neutral words in the CTA",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
