import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/RepoOverview/production.ts";

test(
  "overview rendered pixels show handoff, process progress, readable catalogs and a gold close",
  { timeout: 240000 },
  () => {
    const dir = mkdtempSync(join(tmpdir(), "repo-overview-pixels-"));
    const count = (p: Buffer, box: number[], rgb: number[]) => {
      let n = 0;
      for (let y = box[1]; y < box[3]; y++)
        for (let x = box[0]; x < box[2]; x++)
          if (rgb.every((v, i) => p[(y * 1920 + x) * 3 + i] === v)) n++;
      return n;
    };
    const gray = [212, 211, 210],
      gold = [238, 165, 48],
      bg = [21, 16, 15];
    const render = (id: string, local: number) => {
      const s = movie.scenes.find((s) => s.id === id)!;
      const file = join(dir, `${id}-${local}.png`);
      execFileSync(
        "npx",
        [
          "remotion",
          "still",
          "DocsAnimationPart1",
          file,
          `--frame=${s.from + local}`,
        ],
        { stdio: "pipe" },
      );
      return execFileSync(
        "ffmpeg",
        ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        { maxBuffer: 1920 * 1080 * 4 },
      );
    };
    try {
      const start = render("opening", 0),
        handoff = render("opening", movie.scenes[0].transfers[0].end + 15);
      assert.ok(
        count(start, [300, 395, 800, 460], gray) > 100,
        "idea starts at the author",
      );
      assert.equal(
        count(start, [1150, 395, 1650, 460], gray),
        0,
        "viewer has no idea before the handoff",
      );
      assert.equal(
        count(handoff, [300, 395, 800, 460], gray),
        0,
        "idea leaves the author",
      );
      assert.ok(
        count(handoff, [1150, 395, 1650, 460], gray) > 100,
        "idea arrives at the viewer",
      );
      const features = movie.scenes.find(s => s.id === 'opening-features')!;
      const featureStart = render('opening-features',0);
      const featureEnd = render('opening-features',features.duration-2);
      for (const y of [395,500,605]) {
        assert.equal(count(featureStart,[260,y,850,y+65],gray),0,'feature rows are empty before their spoken cues');
        assert.ok(count(featureEnd,[260,y,850,y+65],gray)>100,'each narrated feature is visible below You');
      }
      assert.ok(count(featureStart,[1150,395,1650,460],gray)>100,'audience retains the idea at the continuation');
      assert.ok(count(featureEnd,[1150,395,1650,460],gray)>100,'audience retains the idea beside the feature list');
      const essay = movie.scenes.find((s) => s.id === "essay")!;
      const before = render("essay", 0),
        after = render("essay", essay.duration - 2);
      assert.ok(
        count(before, [344, 454, 376, 486], gray) > 250,
        "explanation begins at Essay",
      );
      assert.equal(
        count(before, [1544, 454, 1576, 486], gray),
        0,
        "video token absent before creation",
      );
      assert.ok(
        count(after, [1544, 454, 1576, 486], gray) > 250,
        "explanation reaches Video",
      );
      const samples = [start, handoff, before, after];
      for (const id of [
        "remotion",
        "recording",
        "skills",
        "experiment",
        "invitation",
      ]) {
        const s = movie.scenes.find((s) => s.id === id)!;
        const p = render(id, s.duration - 5);
        assert.ok(
          count(p, [120, 250, 1800, 850], id === "invitation" ? gold : gray) >
            500,
          `${id}: meaningful visible content`,
        );
        assert.equal(
          count(p, [0, 0, 1920, 100], bg),
          1920 * 100,
          `${id}: top safe area`,
        );
        assert.equal(
          count(p, [0, 950, 1920, 1080], bg),
          1920 * 130,
          `${id}: bottom safe area`,
        );
        if (id === "invitation")
          assert.equal(
            count(p, [120, 250, 1800, 850], gray),
            0,
            "closing text is entirely gold",
          );
        else if (id !== "remotion") {
          assert.equal(
            count(p, [120, 900, 1800, 1050], bg),
            1680 * 150,
            `${id}: no duplicated narration subtitles`,
          );
          samples.push(p);
        }
      }
      const experiment = movie.scenes.find(s => s.id === "experiment")!;
      const created = render("experiment", experiment.duration - 5);
      assert.ok(count(created, [1544,454,1576,486], gray) > 250, "this video's explanation reaches the rendered-video stage");
      for (const p of samples)
        assert.equal(
          count(p, [0, 0, 1920, 1080], gold),
          0,
          "neutral explanatory diagrams reserve gold for the closing invitation",
        );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
