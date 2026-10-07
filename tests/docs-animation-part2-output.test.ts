import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/DocsAnimationPart2/production.ts";

test(
  "Part 2 pixels preserve the macro map, every micro view, causal movement and a plain delivery ending",
  { timeout: 300000 },
  () => {
    const dir = mkdtempSync(join(tmpdir(), "docs-part2-pixels-"));
    const gray = [212, 211, 210],
      bg = [21, 16, 15],
      gold = [238, 165, 48];
    const count = (p: Buffer, b: number[], rgb: number[]) => {
      let n = 0;
      for (let y = b[1]; y < b[3]; y++)
        for (let x = b[0]; x < b[2]; x++)
          if (rgb.every((c, i) => p[(y * 1920 + x) * 3 + i] === c)) n++;
      return n;
    };
    const cache = new Map<string, Buffer>();
    const render = (id: string, local: number) => {
      const key = `${id}-${local}`;
      if (cache.has(key)) return cache.get(key)!;
      const s = movie.scenes.find((s) => s.id === id)!;
      const path = join(dir, key + ".png");
      execFileSync(
        "npx",
        [
          "remotion",
          "still",
          "DocsAnimationPart2",
          path,
          `--frame=${s.from + local}`,
        ],
        { stdio: "pipe" },
      );
      const p = execFileSync(
        "ffmpeg",
        ["-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        { maxBuffer: 1920 * 1080 * 4 },
      );
      cache.set(key, p);
      return p;
    };
    try {
      for (const [id, x] of [
        ["overview", 360],
        ["source", 360],
        ["understand", 760],
        ["planning", 1160],
        ["produce", 1560],
      ] as const) {
        const p = render(id, 0);
        for (const stageX of [360, 760, 1160, 1560])
          assert.ok(
            count(p, [stageX - 160, 330, stageX + 160, 405], gray) > 150,
            `${id}: all four macro labels visible`,
          );
        assert.ok(
          count(p, [x - 16, 454, x + 16, 486], gray) > 250,
          `${id}: token indicates the current stage`,
        );
      }
      const overview = movie.scenes[0];
      assert.ok(
        count(
          render("overview", overview.duration - 2),
          [1544, 454, 1576, 486],
          gray,
        ) > 250,
        "overview completes the end-to-end journey before detail begins",
      );
      for (const s of movie.scenes) {
        for (const f of s.visuals?.map((v) => v.end - 2) ?? [s.duration - 2]) {
          const p = render(s.id, f);
          assert.ok(
            count(p, [120, 250, 1800, 850], gray) > 600,
            `${s.id}: meaningful explanatory content`,
          );
          assert.equal(
            count(p, [0, 0, 1920, 100], bg),
            1920 * 100,
            `${s.id}: top safe area`,
          );
          assert.equal(
            count(p, [0, 950, 1920, 1080], bg),
            1920 * 130,
            `${s.id}: bottom safe area`,
          );
          assert.equal(
            count(p, [120, 900, 1800, 1050], bg),
            1680 * 150,
            `${s.id}: no duplicated narration subtitles`,
          );
        }
      }
      const handoff = movie.scenes.find((s) => s.id === "handoff")!;
      const before = render("handoff", 0),
        after = render("handoff", handoff.duration - 2);
      assert.ok(
        count(before, [300, 395, 800, 460], gray) > 100,
        "draft begins with author",
      );
      assert.equal(
        count(before, [1150, 395, 1650, 460], gray),
        0,
        "reviewer has no draft yet",
      );
      assert.equal(
        count(after, [300, 395, 800, 460], gray),
        0,
        "author relinquishes the draft",
      );
      assert.ok(
        count(after, [1150, 395, 1650, 460], gray) > 100,
        "draft reaches reviewer",
      );
      const patterns = movie.scenes.find((s) => s.id === "patterns")!;
      assert.ok(
        count(render("patterns", 0), [344, 454, 376, 486], gray) > 250,
        "request begins at its origin",
      );
      assert.ok(
        count(
          render("patterns", patterns.visuals![0].end - 2),
          [1544, 454, 1576, 486],
          gray,
        ) > 250,
        "request reaches delivery",
      );
      const last = movie.scenes[movie.scenes.length - 1];
      assert.equal(
        count(render(last.id, last.duration - 2), [0, 0, 1920, 1080], gold),
        0,
        "ending is the delivery stage, without a gold closing CTA",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
