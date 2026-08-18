import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Regression test for a real production bug: every `scripts/*.ts` file is
// run directly via `node --experimental-strip-types` (not through a
// bundler), and Node's native ESM resolver requires relative import
// specifiers to carry an explicit extension. `tsc` (moduleResolution:
// "Bundler") and Remotion's own bundler both tolerate extensionless
// imports, so this class of bug passes `npm run lint` clean and only
// surfaces the moment someone actually runs the command — which is exactly
// what happened: `import { generateVoiceover } from "./lib/elevenlabs"`
// shipped, passed every static check, and threw ERR_MODULE_NOT_FOUND on
// first real use. This test exists so that can't happen silently again.
//
// Also covers `src/**`: it isn't only `scripts/` that gets run directly by
// Node — this repo's own test suite imports `src/lib/**` and video modules
// directly (e.g. `tests/keyframes.test.ts` imports `src/lib/Camera.ts`),
// so the exact same class of bug applies there too, found the moment this
// suite was extended. "Only one way to execute the code" means both trees
// hold to the same rule, not just the one that broke first.

const REPO_ROOT = join(import.meta.dirname, "..");
const CHECKED_DIRS = ["scripts", "src"];

const RELATIVE_IMPORT = /(?:from\s+|import\s*\()\s*["'](\.[^"']+)["']/g;
const HAS_RECOGNIZED_EXTENSION = /\.(ts|tsx|js|mjs|cjs|json)$/;

function findSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...findSourceFiles(full));
    else if (/\.tsx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

test("every scripts/ and src/ relative import has an explicit extension", () => {
  const files = CHECKED_DIRS.flatMap((dir) => findSourceFiles(join(REPO_ROOT, dir)));
  assert.ok(files.length > 0, "expected to find at least one source file under scripts/ or src/");

  const offenders: string[] = [];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(RELATIVE_IMPORT)) {
      const specifier = match[1];
      if (!HAS_RECOGNIZED_EXTENSION.test(specifier)) {
        offenders.push(`${file}: "${specifier}"`);
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Found extensionless relative imports under scripts/ or src/ — these pass tsc/eslint but ` +
      `throw ERR_MODULE_NOT_FOUND under plain node execution:\n${offenders.join("\n")}`,
  );
});
