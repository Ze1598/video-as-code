---
name: animate-recorded-audio
description: Create explanatory videos from existing podcast, interview or discussion audio using the leadership essay SDK. Preserve the supplied recording and time diagrams to its ideas; use generate-video-essay when starting from an essay that needs new narration.
---

# Animate recorded audio

## Scope and shared conventions

Produce a finished video, a timestamped transcript, and a chapter/scene plan expressed as SDK production code. The recording determines the spoken content, order and timing. Do not rewrite, regenerate, trim, rearrange, time-stretch or pad the soundtrack unless the user requests that editing. Visual revisions reuse the same source audio.

The canonical skill is `.agents/skills/animate-recorded-audio/SKILL.md`. Keep the installed personal copy synchronized byte-for-byte, including supporting files. Locate the video repository before using its relative paths; the personal skill directory is not the project root.

Read the repository's `AGENTS.md`, `src/lib/essay-sdk/README.md` and its linked authoring, visual-pattern and verification guidance. Reuse the [visual explanation rules](../generate-video-essay/SKILL.md#plan-the-visual-explanation) from `generate-video-essay`; its script adaptation, speech-generation and pause-planning steps do not apply here. Keep rendering behavior in the SDK and video-specific choices in scene data. Use existing capabilities first and report useful SDK improvements separately. Honor constraints against SDK changes; do not work around them with bespoke drawing code.

## Establish the recording and transcript

- Inspect duration, streams and codecs. Preserve the original, record its hash, and use a separate production asset when needed. Inspect existing transcripts, timing files and outputs before starting expensive work or overwriting anything.
- Prefer a supplied timestamped transcript or a suitable local transcription method. Align an untimed transcript to the actual recording. Keep transcription vendor-agnostic; reuse available tooling rather than requiring a particular service or model.
- For external transcription, establish authorization for the recording, destination and any cost. Honor authorization already given; approval for narration generation alone does not establish approval to upload a different recording. Use a viable local alternative when an upload is blocked. Do not generate replacement speech to solve a transcription problem.
- Retain raw transcription output and identify the engine/model. Treat ASR text as provisional: flag low-confidence passages, improbable repetition, collapsed word timings and drift. Check important cues and suspicious passages against the audio when playback/listening is available. Keep corrections distinct from the raw result; report unreviewed uncertainty rather than claiming a verified transcript.
- Identify speakers only when attribution affects the requested visuals. Do not invent identities from vocal characteristics. Explanatory diagrams usually follow ideas rather than speaker turns.

## Map the explanation before building scenes

First map chapters: the central question, examples, causal explanation, objections, qualifications and conclusion. Then divide them into complete explanatory thoughts. Preserve the recording's digressions and repetitions; they may reuse or extend an existing visual instead of forcing another scene.

For each beat record its source interval, purpose, relevant actors/work, what remains visible, what changes, and the SDK pattern that explains it. Use meaningful spoken cues for reveals, handoffs, decisions and consequences. Do not impose a scene count, regular cutting interval or one scene per transcript segment.

Prefer a sustained diagram that develops with the explanation. Preserve identities and relevant relationships through a continuing example using supported continuity mechanisms. A repeated point can return to the same visual vocabulary. During an objection, retain enough of the proposed approach for the contrast to make sense. Avoid long empty setups, static visuals that outlast their relevance, and animations added merely to fill time.

Keep semantic labels concise and faithful; do not present inferred quantities or schematic distances as measured facts. Explanatory diagrams suppress narration subtitles under the shared essay style unless the user requests otherwise. Any verbatim text must come from the recording's timed words. If the recording ends with a suitable actionable or reflective sentence, it can supply the italic gold closing treatment; do not invent a spoken CTA or extend the audio to fit one.

## Bind timing and produce the video

Resolve source cues explicitly and fail on missing or ambiguous matches. Convert absolute recording times to scene-local frames using the chosen frame rate. Keep the complete track continuous from its intended start, with no scene-level audio duplication, added pauses or independent padding. Scene coverage should end at the recording's duration rounded up to the next video frame.

Honor the requested format and established project defaults. For long recordings with restrained motion, consider a short 30 fps comparison before committing to a costly full render; do not automatically inherit hard-coded 60 fps timing from an example. Preview difficult transitions and dense diagrams at the final resolution first.

Use a thin SDK composition and documented production commands. When the source codec is compatible with the delivery container, render visuals separately if needed and mux the original audio by stream copy. Verify audio packet/payload hashes before claiming exact audio preservation. If transcoding is necessary, preserve the source, avoid unnecessary processing, verify duration/synchronization and disclose that the delivered audio was re-encoded.

## Verify and deliver

Follow the repository's requirements-first checks for the production code. Check full timeline coverage, source-bound cues, readable layout and important causal changes with deterministic geometry and actual rendered pixels. Cover each distinct scene and the before/after states where movement explains the argument. Playback review complements those tests: sample each chapter, scene transitions and flagged transcript passages to check semantic timing and listening flow. State what was actually reviewed; screenshots alone cannot verify speech synchronization.

After export, verify streams, resolution, frame rate, duration, complete-file decoding and audio preservation. Deliver the requested filename with a playable video link, retain transcript/cue provenance and the production plan, and record any remaining uncertainty or SDK limitation. Keep improvement suggestions separate from changes made to produce the video.
