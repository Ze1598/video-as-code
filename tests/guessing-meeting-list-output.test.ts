import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/GuessingMeetingList/production.ts";

test("rendered essay shows actors, constraints, returned questions and gold guidance", { timeout: 240000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "guessing-meeting-list-pixels-"));
  const render = (id: string, local: number) => {
    const s = movie.scenes.find(s => s.id === id)!;
    const file = join(dir, `${id}-${local}.png`);
    execFileSync("npx", ["remotion", "still", "GuessingMeetingList", file, `--frame=${s.from + local}`], { stdio: "pipe" });
    return execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1920 * 1080 * 4 });
  };
  const count = (pixels: Buffer, box: number[], rgb: number[]) => {
    let n = 0;
    for (let y = box[1]; y < box[3]; y++) for (let x = box[0]; x < box[2]; x++) {
      if (rgb.every((v, c) => pixels[(y * 1920 + x) * 3 + c] === v)) n++;
    }
    return n;
  };
  const gray = [212, 211, 210], gold = [238, 165, 48], bg = [21, 16, 15];
  try {
    const kickoff = render("kickoff", 600);
    assert.ok(count(kickoff, [400, 215, 640, 300], gray) > 80, "architect and PM glyphs");
    assert.ok(count(kickoff, [1310, 215, 1480, 300], gray) > 40, "account manager glyph");
    assert.ok(count(kickoff, [705, 255, 1210, 266], gray) > 100, "kickoff relationship");
    const constraints = render("constraints", 950);
    for (const y of [390, 495, 600]) assert.ok(count(constraints, [1080, y, 1720, y + 80], gray) > 150, "two issues and the received briefing");
    assert.ok(count(constraints, [705, 255, 1210, 266], gray) > 100, "briefing relationship persists");
    const returned = render("rework", 250);
    const repeated = render("rework", 590);
    assert.ok(count(returned, [344, 454, 376, 486], gray) > 250, "questions reach account manager");
    assert.ok(count(repeated, [944, 454, 976, 486], gray) > 250, "questions return to architect and PM");
    assert.equal(count(repeated, [344, 454, 376, 486], gray), 0, "token is moved, never duplicated");
    const guidance = render("invitation", 893);
    assert.ok(count(guidance, [325, 515, 860, 605], gold) > 150, "include action is gold");
    assert.ok(count(guidance, [1080, 515, 1650, 605], gold) > 150, "outcome action is gold");
    assert.ok(count(guidance, [325, 395, 880, 500], gray) > 150, "participation criterion is neutral");
    const close = render("close", 290);
    assert.ok(count(close, [200, 300, 1720, 750], gold) > 1500, "closing guidance is visible in gold");
    assert.equal(count(close, [200, 300, 1720, 750], gray), 0, "no neutral closing lines");
    for (const pixels of [kickoff, constraints, returned, repeated]) assert.equal(count(pixels, [0, 0, 1920, 1080], gold), 0, "case study is neutral");
    for (const pixels of [kickoff, constraints, returned, repeated, guidance, close]) {
      assert.equal(count(pixels, [0, 0, 100, 100], bg), 10000, "background is the specified color");
      assert.equal(count(pixels, [120, 900, 1800, 1050], bg), 1680 * 150, "bottom safe area has no subtitles");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
