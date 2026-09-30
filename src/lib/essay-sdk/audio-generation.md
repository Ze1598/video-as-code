# Full-essay narration with Eleven v4

The production workflow is **plan → prepare the speech string with tone and pause tags → generate audio → write video code from scene timing → render**.

The user approved the complete audio in `DidntRepeatPriority_apitest`. Use its
request and single-track production as the working reference. Preserve approved
source recordings; visual revisions alone do not require another paid call.

## Plan and prepare the request

Plan the story and visual intentions first. Before generation, inventory the
complete pause budget: sentence pauses, scene lead-ins, intermediate holds and
the final hold. When cloning, include spacing previously imposed by scene
padding or audio sequencing. Convert frame holds at the source video's fps.
For new essays, inherit the audio skill’s bundled `assets/narration-defaults.json`
and record the resolved values. Change them only for requested overrides.

`NARRATION.pausePlan` requires `internalSentenceMs`, `laterSceneLeadMs`,
`sceneHoldMs`, `finalHoldMs` and `phrasingBpm`. Use explicit zero for absent holds.
The builder adds scene hold and later lead-in into the inter-scene pause cue.
The approved reference requests 250 ms internally, 750 + 500 = 1250 ms between
scenes, and 750 ms at the end. The 92 BPM value is a phrasing reference, not
words per minute or the relative `speed: 0.92` setting.

Keep the complete narration, delivery directions, explicit model/settings and
request code with the video in `src/<VideoName>/audio.ts`. Use `eleven_v4` and
`buildEssayAudioRequest` from `scripts/lib/essay-audio.ts`. Put one complete
spoken sentence in each `sentences` entry. The builder adds duration-bearing
pause tags; sparse vocal directions guide warm, measured, engaging storytelling.
V4 pause tags express intent rather than guarantee exact timing. Trust the
generated performance and let the user judge tone; do not introduce audio
analysis or silence correction unless a concrete problem requires it.

Keep browser-safe script data separate from Node-only request helpers. The
rendered plan must not import `audio.ts` when it imports server modules.
Use pure shared narration data or generate a browser-safe script/timing module
from the request source. Importing configuration must not make paid calls.

## Generate once

Preview the exact full request, then execute one paid call under user approval.
Keep the generation entry point alongside the video, as in
`src/DidntRepeatPriority_apitest/generate-audio.ts`. Shared transport remains in
`scripts/lib/essay-audio.ts`; do not duplicate it per video.

The helper preserves `narration.mp3`, returned timing JSON and `request.json`
with the endpoint, exact body, timestamp, pause budget and status. API keys are
excluded. Do not silently retry, change models, chunk the script or overwrite
paid output. Use a new output directory for a new take.

## Write video code from the recording

Use `continuousNarrationTimeline` with the approved narration, returned words,
full timing duration, fps and planned visual hold. It maps scene boundaries
and local word timings onto the existing recording, quantizing absolute frame
boundaries once. It does not infer new narration or add playback time.

Save the mapped beats as browser-safe data, then write/configure the SDK plan.
Use each beat's `durationFrames` directly; do not add extra scene padding.
Set one `EssayPlan.audio: { src, duration }` pointing at the full recording.
Leave every `Scene.audio` absent. `EssayVideo` plays the track once from frame
zero while visual scenes follow its timestamps. No splitting, stretching,
silence insertion or per-scene playback is needed.

The reference implementation is `src/DidntRepeatPriority_apitest/`: `audio.ts`,
`generate-audio.ts`, `build-timing.ts`, `data.ts`, `production.ts` and `plan.ts`.
Retain request/source provenance and use the same approved words for the script
and visual cues. Direction tokens may appear in raw alignment; exclude them
from caption words while retaining raw timing and audio.

## Render

Register the SDK composition and render the requested filename. Verify the
resulting video/audio streams and full-file decode. Keep reasoning focused on
planning; use existing SDK behavior and mechanical timing/render commands for
execution. Extend shared code only when an actual missing capability blocks
production.

Tone remains a manual listening judgment. The user-approved reference replaces
the need to run a new comparison for every essay. Legacy per-beat generation and
silence-insertion utilities remain available for existing work, but are not this
workflow.
