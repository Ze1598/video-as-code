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

## The format: Programmatic Leadership Visual Essay

A state-driven diagram — people/roles as nodes, information moving between them, one causal
mechanism, one payoff reveal — plus dedicated full-screen scenes for content that isn't a
diagram (lists, two-sided arguments). Opens on a hook, closes on an engagement question, not
an essay paraphrase. 16:9, 60fps.

**Full spec: `.claude/skills/leadership-visual-essay/SKILL.md`. Read it before building a new
one** — it has the accumulated fixes (caption/diagram layout, camera pacing, voice settings,
script structure) from three iterations, not just the concept.

Reference implementations: `src/PositiveFeedbackV2/`, `src/PositiveFeedbackV3/`,
`src/ConfusedLabels/`. Outputs: `out/PositiveFeedback_v2.mp4`, `out/PositiveFeedback_v3.mp4`,
`out/ConfusedLabels.mp4`.

## Pipeline

1. Fetch the essay's full text — `WebFetch` returns an AI-summarized paraphrase, not verbatim
   text. Pull raw HTML (`curl` the URL) and extract the article body directly when the exact
   wording matters for scripting.
2. Write the script as causal beats, not sentences — see the skill for the narrative
   architecture (Hook → causal chain → Mechanism Reveal → Balanced Counterweight → Reframe →
   Smallest Correction → CTA). Present the beat table for approval before generating audio;
   audio generation costs money and a script change means regenerating it.
3. Generate voiceover: `scripts/generate-voiceover-<name>.ts`, one ElevenLabs
   `with-timestamps` call per beat, output to `public/voiceover/<VideoName>/beat-NN.mp3` +
   `.json`. Run with:
   ```
   node --env-file=.env --experimental-strip-types scripts/generate-voiceover-<name>.ts
   ```
   (Node 22+ has built-in TS stripping — no `tsx`/`ts-node` dependency needed.)
4. Generate `src/<VideoName>/data.ts` directly from the resulting JSON — never hand-transcribe
   word timings; that's how captions silently drift from the actual audio.
5. Build the Remotion composition (mirror the file layout in the skill: `data.ts`,
   `timeline.ts`, `sentences.ts`, `layout.ts`, `Camera.ts`, `World.tsx`, `Hud.tsx`,
   `Scenes.tsx`, `index.tsx`), register it in `src/Root.tsx`, spot-check with
   `npx remotion still <id> out.png --frame=N` at every beat boundary and the payoff moment,
   then render:
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
scripts/generate-voiceover-*.ts   # one script per video, ElevenLabs generation
public/voiceover/<VideoName>/     # generated audio + word-timing JSON per video
src/<VideoName>/                  # one Remotion composition module per video
src/Root.tsx                      # registers every composition (id, fps, dimensions)
out/                               # rendered .mp4 output
.claude/skills/leadership-visual-essay/  # full spec for the format
```

## Docs

[Remotion fundamentals](https://www.remotion.dev/docs/the-fundamentals).
