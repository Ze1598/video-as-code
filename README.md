# video-as-code

Remotion pipeline that turns José Fernando Costa's Substack essays
([villager1598.substack.com](https://villager1598.substack.com)) into **Programmatic
Leadership Visual Essay** videos — a state-driven diagram, one causal mechanism, one payoff
reveal, real ElevenLabs word-level timestamps driving every animation. This is the actual
purpose of the repo.

Essay in, causal-beat script out, ElevenLabs voiceover with timestamps, Remotion composition
driven by those timestamps, rendered `.mp4` in `out/`.

## Starting a new video

Opening prompt for a fresh session:

```
New video from <substack URL> — use the leadership-visual-essay format, call it <Name>.mp4.
```

The reuse-the-shared-library rule lives in `CLAUDE.md` (always loaded, regardless of prompt
wording) and in the skill — not in this prompt. Keep this prompt minimal; don't grow it to
compensate for something a standing rule should already guarantee.

## The format: Programmatic Leadership Visual Essay

A state-driven diagram — people/roles as nodes, information moving between them, one causal
mechanism, one payoff reveal — plus dedicated full-screen scenes for content that isn't a
diagram (lists, two-sided arguments). Opens on a hook, closes on an engagement question, not
an essay paraphrase. 16:9, 60fps.

**Full spec: `.claude/skills/leadership-visual-essay/SKILL.md`. Read it before building a new
one** — it has the accumulated fixes (caption/diagram layout, camera pacing, voice settings,
script structure, the shared library below) baked in, not just the concept. Don't rely on
memory of a past session.

**Reusable library — check before writing anything by hand.** `src/lib/` and `scripts/lib/`
hold every mechanical, non-creative piece of this pipeline (ElevenLabs API calls, word-timing
derivation, sentence-splitting, the camera transform, the safe-zone diagram wrapper, node
rendering, connector draw-on math, and the Hook/CTA/split-argument/list-row/caption/long-form
scene primitives). A new video should import from these, not re-derive or copy-paste them —
see the skill's "Reusable library" section for the full inventory. `src/lib/__demo__/` is a
standing smoke test for the library itself, not a real video.

Reference implementation: `src/HowToBeUnderstood/`, built against the shared library — read it
before building a new one. Output: `out/HowToBeUnderstood.mp4`.

## Pipeline

1. Fetch the essay's full text — `WebFetch` returns an AI-summarized paraphrase, not verbatim
   text. Pull raw HTML (`curl` the URL) and extract the article body directly when the exact
   wording matters for scripting.
2. Write the script as causal beats, not sentences — see the skill for the narrative
   architecture (Hook → causal chain → Mechanism Reveal → Balanced Counterweight → Reframe →
   Smallest Correction → CTA). Present the beat table for approval before generating audio;
   audio generation costs money and a script change means regenerating it.
3. Generate voiceover: one ElevenLabs `with-timestamps` call per beat, output to
   `public/voiceover/<VideoName>/beat-NN.mp3` + `.json`. `scripts/generate-voiceover.ts` is the
   single, deterministic CLI for every video — it reads that video's own beat list from
   `src/<VideoName>/script.ts` (a `SLIDES` array). Write the script as data there, never as a
   new hand-written `generate-voiceover-<name>.ts` file. Run with:
   ```
   node --env-file=.env --experimental-strip-types scripts/generate-voiceover.ts <VideoName>
   ```
   (Node 22+ has built-in TS stripping — no `tsx`/`ts-node` dependency needed.)
4. Generate `src/<VideoName>/data.ts` directly from the resulting JSON — never hand-transcribe
   word timings; that's how captions silently drift from the actual audio:
   ```
   node --experimental-strip-types scripts/build-timing-data.ts <VideoName>
   ```
5. Build the Remotion composition (mirror `src/HowToBeUnderstood/`'s layout — see the skill's
   "File layout" for which files stay fully custom per video — `layout.ts`, `World.tsx`'s
   connector meaning, `Scenes.tsx`'s bespoke wrappers — and which are thin wrappers around
   `src/lib`), register it in `src/Root.tsx`, spot-check with `npx remotion still <id> out.png
   --frame=N` at every beat boundary and the payoff moment, then render:
   ```
   npx remotion render <CompositionId> out/<VideoName>.mp4
   ```

## Commands

```console
npm install                # install dependencies
npm run dev                 # remotion studio (preview all compositions)
npx remotion render <id> out/<Name>.mp4   # render a specific composition
npx remotion still <id> out.png --frame=N # single-frame spot check
npm run lint                # eslint + tsc
```

## Environment

`.env` needs:

```
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
```

## Repo layout

```
scripts/lib/elevenlabs.ts         # shared generateVoiceover() — import, don't copy
scripts/generate-voiceover.ts     # the ONE voiceover CLI — <VideoName> arg, reads that
                                   # video's own src/<VideoName>/script.ts for its SLIDES
scripts/build-timing-data.ts      # CLI: JSON -> src/<VideoName>/data.ts
public/voiceover/<VideoName>/     # generated audio + word-timing JSON per video
src/lib/                          # shared library — palette, timeline, camera, diagram
                                   # primitives, scene primitives; src/lib/__demo__ is its smoke test
src/<VideoName>/                  # one Remotion composition module per video (script.ts holds
                                   # its beat-by-beat narration, read by scripts/generate-voiceover.ts)
src/Root.tsx                      # registers every composition (id, fps, dimensions)
out/                               # rendered .mp4 output
.claude/skills/leadership-visual-essay/  # full spec for the format
tests/                             # regression suite (npm test) — see tests/README.md
```

## Tests

`tests/` is a regression suite (Node's built-in test runner, no added dependency) built from
real bugs hit while building videos against this pipeline — module resolution, camera-boundary
keyframe collisions, a non-focus node leaking into a tight/pair shot, the ElevenLabs wiring, and
more. See `tests/README.md` for what's covered and why.

```console
npm test          # everything except the live ElevenLabs tests (free, ~10-20s)
npm run test:live # ONLY the two live ElevenLabs tests (paid — see tests/README.md)
```

Run `npm test` whenever code changes, and whenever a test case is added or changed — it's part
of validating a change is actually done, the same as `tsc`/`eslint`/a still-check.

## Docs

[Remotion fundamentals](https://www.remotion.dev/docs/the-fundamentals).
