# Authoring a video with the SDK

Start with the narration script and scene intentions produced using the generation skill. Read [visual requirements](visual-requirements.md) and the [current API/status](README.md). This guide explains production code; it does not decide the story.

Use the [visual-pattern guide](patterns.md) to select a mechanism for each causal change. A single audio segment can contain staged entries, reallocations, waits, returns or several non-overlapping visual intervals. Do not hold an unchanged visual across unrelated narration simply because it is one audio file. Comparisons are paired semantic entries, not parallel subtitle paragraphs. Text-only screens need an editorial reason.

## 1. Prepare and generate narration

Follow the [audio-generation guide](audio-generation.md): plan → tagged speech
string → one v4 audio generation → SDK video code from returned timing → render.
Plan the scene intentions before generating audio; implement their exact timing
after the recording exists. Include all sentence pauses, scene lead-ins, holds
and final spacing in the request's explicit pause plan.

Keep the request code and exact request record with the video. Preserve the
full generated recording. Use `continuousNarrationTimeline` to build
browser-safe scene/word timing data, as shown in
`src/DidntRepeatPriority_apitest/build-timing.ts`. Video code plays that recording
once through `EssayPlan.audio`. Do not add `Scene.audio`, scene-duration padding,
or a silence-insertion pass. Keep Node-only generation helpers out of browser
imports. Reuse approved audio for visual revisions.

## 2. Write the production plan

Import actual timed words into `plan.ts`. Construct an `EssayPlan` using documented types; no bespoke drawing or frame-by-frame rendering belongs here. Convert word timestamps to scene-local frames with `Math.round(startMs * fps / 1000)`. Resolve cues unambiguously and fail on missing cues. Keep caption text derived from timed words, while semantic diagram labels come from the editorial plan.

Here is a minimal current-API text-scene factory. It receives timing data, so it does not invent narration or timestamps:

```ts
import { compileEssay, type Scene } from '../lib/essay-sdk/index.ts';
import type { WordTiming } from '../lib/essay-sdk/sentences.ts';

export function makeTextVideo(words: WordTiming[], audioSrc: string, audioFrames: number) {
  if (!words.length) throw new Error('Narration required');
  const fps = 60;
  const scene: Scene = {
    id: 'explanation', duration: audioFrames, narration: words,
    groups: [], items: [], transfers: [], topics: [], takeaways: [],
  };
  return compileEssay({ fps, scenes: [scene], audio: { src: audioSrc, duration: audioFrames } });
}
```

For handoffs, declare groups and owned items, then a transfer with `item`, `to`, `start` and `end`. Preserve continuing item identifiers and ordering across the plan. The default aligns rows before crossing; use `route: 'cross-first'` for a return that must cross its vacant source row before aligning at the destination, avoiding overlap with work already received. Verify separation throughout the path. See `src/CooperationWithoutConsequences/plan.ts` for a reciprocal exchange, `src/ChangingTooMuchV11/plan.ts` for wiring real audio and exporting the exact script, and `visual-story.ts` for dedicated patterns.

Use `topics` for row cursors and `relationships` for timed actor-to-actor dashed strokes. Use item `revealAt` cues for a list narrated in stages, `textMotion: 'rise'` for complete sentence entrances, and `transition: 'reflow'` when continuing actors move into a new scene layout. These APIs are defined in the README. Keep focus independent of neutral text appearance. Do not add animation just because an API supports it: tie each event to an explanatory change.

Relationship intervals follow relevance, not the length of a mention: keep the head/team connection during the whole interaction. Diagram scenes have no narration subtitles. Text-only scenes show timed spoken sentences; use `textStyle: 'italic'` and a full-scene `{text: true, start: 0, end: duration}` takeaway for the final reflective/actionable CTA.

If a required capability is absent, add it through requirements-first SDK development when authorized, then use that API in the plan. Do not simulate it through one-off rendering code.

## 3. Compose and register

Keep the composition thin:

```tsx
import { EssayVideo } from '../lib/essay-sdk/EssayVideo.tsx';
import { movie } from './plan.ts';
export const Video = () => <EssayVideo movie={movie} />;
```

Register it in `src/Root.tsx` using `movie.duration`, `movie.fps`, width 1920 and height 1080. Audio paths are relative to `public/`; `EssayVideo` resolves them with Remotion's `staticFile`.

## 4. Verify and render

Run `npm run lint` and `npm test`, including requirement tests and actual raster-output assertions. Add checks for the scene's intended output, not merely copies of compiler values. Do not spend on `npm run test:live` without specific approval.

Render the requested filename using `npx remotion render <CompositionId> out/<Name>.mp4`. Preserve existing output unless overwriting is authorized. Use ffprobe to confirm streams, duration, resolution and frame rate, and `ffmpeg -v error -i out/<Name>.mp4 -f null -` for full decode validation.
