# Leadership video essays

An editorial plan becomes a deterministic Remotion video. Use the vendor-agnostic [generation skill](.agents/skills/generate-video-essay/SKILL.md), [SDK contract](src/lib/essay-sdk/README.md) and repository instructions in `AGENTS.md`.

The skill adapts an input essay into a narration script and production plan/code. SDK documentation teaches the LLM how to write that code. The SDK implements the video behavior. Read the [authoring guide](src/lib/essay-sdk/authoring.md) and [visual requirements](src/lib/essay-sdk/visual-requirements.md), then check implementation status in the SDK README before selecting APIs.

## Active implementation

- `src/lib/essay-sdk`: plan types, compiler, frame projection, SVG renderer, Remotion integration, palette and narration utilities.
- `src/ChangingTooMuchV11`: current reference script, visual production plan and thin composition.
- `scripts/lib/elevenlabs.ts`: narration API and timing derivation.
- `scripts/generate-voiceover.ts`: voice generation CLI.
- `scripts/add-voiceover-pauses.ts`: actual silence and matching timestamp shifts.
- `scripts/build-timing-data.ts`: timed narration data generation.
- `tests/essay-sdk*.test.ts`: requirements and actual rendered-output assertions.
- `src/archive/lib`: legacy helpers retained for existing compositions.
- `out`: rendered MP4s.

## Workflow

1. Plan the explanation, including a scenario-only hook and scene-by-scene visual meaning.
2. Generate approved narration or reuse existing audio; apply pauses and load actual timings.
3. Compile the scene plan with the SDK and register `EssayVideo`.
4. Execute requirements and rendered-output tests, then render and verify the MP4.

New SDK capabilities use requirements tests before implementation. Output assertions use independently specified geometry, colors and visibility. Automated verification replaces subjective screenshot review.

```sh
npm run dev
npm run lint
npm test
npx remotion render ChangingTooMuchV11 out/ChangingTooMuch_v11.mp4
node --env-file=.env --experimental-strip-types scripts/generate-voiceover.ts <VideoName>
node --experimental-strip-types scripts/build-timing-data.ts <VideoName>
```

Paid generation needs `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` in `.env`, and explicit approval. `npm test` skips paid live calls; `npm run test:live` requires specific approval.
