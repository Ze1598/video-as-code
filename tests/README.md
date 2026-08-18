# Regression tests

Built from the tests actually designed and run by hand while debugging a real production
failure: `scripts/generate-voiceover-*.ts` scripts type-checked, linted, and rendered fine, but
threw `ERR_MODULE_NOT_FOUND` the moment anyone actually ran them. `npx tsc`/`eslint` use
resolution modes that tolerate extensionless relative imports; plain `node` does not — so that
class of bug shipped invisibly. These tests exist so validation covers what actually gets
*executed*, not just what type-checks.

Uses Node's built-in test runner (`node --test`), not a separate framework — this repo already
commits to native Node (`--experimental-strip-types`, no `ts-node`/`tsx`), so this stays
consistent with that and adds zero new dependencies.

## Running

```console
npm test          # everything except the live ElevenLabs tests (free, ~10-20s)
npm run test:live # ONLY the two live ElevenLabs tests (paid — see below)
```

`npm test` always shows the two live tests as `SKIP`, not silently omitted — a visible reminder
they exist without ever spending money by accident.

## What's covered

- **`module-resolution.test.ts`** — static regression test for the exact bug above: every
  relative import under `scripts/` must carry an explicit extension. Fast, free.
- **`elevenlabs-wiring.test.ts`** — runs the real `generateVoiceover()` against a mocked network
  response: correct request shape, default/overridden `voice_settings`/`model_id`, correct
  word-timing derivation, correct file writes, clear errors on missing env vars. Fast, free.
  Does **not** re-verify the live ElevenLabs response contract — that's what the live tests are
  for.
- **`build-timing-data.test.ts`** — runs the real CLI as a subprocess against freshly-written
  fixture JSON (not pre-existing repo data), confirming it builds a correctly structured
  `data.ts`, including correct escaping of embedded quotes in real spoken text. Fast, free.
- **`lib-demo-render.test.ts`** — renders every beat of `src/lib/__demo__`'s `LibDemo`
  composition via the real `npx remotion still`. `tsc`/`eslint` can't catch a runtime-only
  error (a bad `frameOfWord` cue, a missing word in synthetic data); this can. Slower
  (~10-20s, real Remotion bundling), still free.
- **`elevenlabs-live.test.ts`** — **two real, paid ElevenLabs API calls**, skipped unless
  `RUN_LIVE_ELEVENLABS_TESTS=1` is set (which `npm run test:live` does). Re-verifies the one
  thing the mocked wiring test can't: that the real `with-timestamps` response shape still
  matches what `deriveWordTimings()` expects, and that the configured credentials/voice are
  actually valid. Costs a few seconds of TTS each run.

## Adding a test for a new bug

If you hit a real error running a documented command that the existing checks didn't catch,
the fix isn't just patching the bug — add a test here that would have caught it, the same way
`module-resolution.test.ts` now stands permanently between that exact class of bug and ever
shipping silently again.
