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

## Manual storytelling tone case

Full-essay pipeline mechanics are covered separately by `essay-audio.test.ts`:
one v4 request, unchanged approved words, source preservation and actual
250/500 ms silence measured in decoded synthetic audio with matching timings.
These checks are free and do not assess storytelling tone.

Run `npm run preview:tone` after approving the two paid API calls for that run.
This uses `scripts/preview-storytelling-tone.ts` and the credentials in `.env`.
It is a manual listening case, separate from `npm test` and `npm run test:live`.

The case generates the same short leadership story twice with `eleven_v4`,
the same cloned voice and identical voice settings. `baseline.mp3` uses plain
text; `storytelling.mp3` adds conversational, curious and reflective delivery
tags plus short pauses. Each run creates a new `out/voice-tone/manual-*`
directory, preserving earlier samples. `request.json` records the text, model,
settings and listening questions; the accompanying JSON files contain returned
word timings. The output directory is ignored by Git.

Play both MP3s at the same playback volume, or ask Codex to display the saved
samples in chat. Listen for:

- Calm energy that still holds attention.
- Natural thought changes, curiosity in the question and a reflective ending.
- Preservation of the cloned voice's identity and clarity.
- No spoken direction tags or unwanted sounds.

Use 92 BPM (about 652 ms per beat) as a reference for phrasing, rather than
words per minute. Neither `speed: 0.92` nor the delivery tags enforce that rhythm.
Record your preferred sample and observations in the run directory before
changing the case or production settings. Successful API calls and valid timing
data do not establish that the tone is suitable; the listening decision is yours.
Tags can appear in returned alignment, so inspect what you hear before using
those words as captions.

The delivery experiment follows the [ElevenLabs v4 prompting guidance](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices#prompting-eleven-v4).
