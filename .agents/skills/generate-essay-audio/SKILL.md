---
name: generate-essay-audio
description: Prepare and generate continuous Eleven v4 narration for leadership video essays, with per-video request code, preserved pause rules and manual listening review. Called by generate-video-essay for narration work.
---

# Leadership essay audio

Use this subskill when the base `generate-video-essay` skill reaches narration
preparation, generation or reuse. The base skill owns essay adaptation and visual
intent. This skill owns delivery decisions and audio workflow. Shared production
code implements requests, word mapping and audio/timestamp transformations; do
not reproduce those mechanics in per-video workarounds.

Read `AGENTS.md` and `src/lib/essay-sdk/audio-generation.md` for the executable
contract, per-video code shape, commands and source/output conventions.

## Workflow and bundled reference

Plan → prepare the full speech string with tone and pause tags → generate one
complete v4 recording → write video code from its scene timing → render.
Trust generated pauses and use returned timestamps to drive the visuals. Keep
execution mechanical after planning; add analysis tools only for a demonstrated
problem.

Use these bundled assets when preparing delivery directions and pause cues:

- [Storytelling audio](assets/storytelling.mp3): a complete narration demonstrating
  warm, measured delivery, clear explanation and a reflective close. Play it when
  a listening comparison is useful; do not infer a listening verdict from text.
- [Exact generation request](assets/storytelling-request.json): the original
  request record, including the complete tagged speech string in `body.text`,
  model, voice settings and pause budget. Read it to see how the delivery and
  pauses were encoded. It contains no API credentials.

Adapt the vocal directions and pause structure to the new essay. The example's
story is reference content, not material to copy into unrelated narration. Use
configured voice credentials for new calls; the recorded voice identifies the
sample rather than imposing a voice on other projects. Reuse these files for
reference without generating another paid sample.

## Prepare the whole narration before spending

Use `eleven_v4` explicitly and one API request for the complete essay. Visual
beats are authored scene boundaries, not separate synthesis requests. Preserve
the exact approved spoken words and scene order. Keep continuous explanatory
thoughts intact; add delivery guidance around the words instead of changing
their meaning. Preview the assembled full request before generation.

Keep the actual code/configuration that produces the request in
`src/<VideoName>/audio.ts`, beside that video's script, plan and composition.
Record complete spoken sentences, vocal directions, model and explicit voice
settings there. Derive the spoken script from that source. Keep transport in
the shared helper. Importing a video request module must be free of paid side
effects. Retain the exact request record with its generated source, excluding
credentials. A generic CLI invocation alone is not sufficient provenance.

## Direct engaging, restrained storytelling

The target is a warm conversational narrator: curious where a question opens
the story, clear through the explanation, reflective at the close. Keep energy restrained while preserving natural expression and interest.
Use sparse, explicit auditory tags such as `[Warm, conversational voice,
measured delivery]`, `[Calm, clear storytelling voice]` and `[Softening, reflective]`.
The bundled request demonstrates these directions in context. Use manual
listening review when requested or when delivery changes materially. Avoid unrequested laughter, sighs, whispering, sound effects, shouting,
exclamation-heavy phrasing and capitalization that increases emphasis.

Use natural sentence punctuation, paragraph boundaries and pause cues in the
text sent to v4. V4 does not support SSML `<break>` tags. The shared builder
derives duration-bearing pause tags from the explicit complete pause plan.
Consult the [v4 prompting guidance](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices#prompting-eleven-v4)
when changing the tag vocabulary. Do not assume tags guarantee durations.

Use 92 BPM as the user's **phrasing rhythm** reference, about 652 ms per beat.
It does not mean 92 words per minute, and `speed: 0.92` does not implement it.
Judge natural thought pacing by listening rather than asserting a BPM result
from API settings. Existing voice settings are a starting point; save any
per-video changes explicitly and listen before promoting them to defaults.

## Plan every pause before generation

Before any paid request, inventory all spacing imposed by the source video or
new plan: internal sentence pauses, later-scene lead-ins, scene-duration padding,
Sequence offsets, intermediate holds and the final hold. Convert frame counts
using the video's fps. Never account only for the audio utility's insertions.

Record all fields in `NARRATION.pausePlan`: `internalSentenceMs`,
`laterSceneLeadMs`, `sceneHoldMs`, `finalHoldMs`, and `phrasingBpm`. Missing fields
must fail before the API call; use explicit zero for a deliberately absent hold.
The builder combines the scene hold and later lead-in into one requested pause.
The bundled request demonstrates 250 ms within sentences, a 750 ms scene hold
plus a 500 ms lead-in combined into 1250 ms between scenes, and 750 ms at the end.
For new essays, choose and record holds during planning instead of inheriting
unexplained frame padding. Inspect the complete prompt before generation.

Play the resulting file once through `EssayPlan.audio`. All scene audio must be
absent. Visual scene boundaries and cues follow returned timestamps using
`continuousNarrationTimeline`; scene holds consume native pause time rather
than adding time to playback. Do not split the recording, insert silence, or
add extra scene-duration padding for this workflow. Preserve raw recordings.
Trust the requested pause cues; exact durations and tone remain
manual listening judgments, not an invitation to invent audio-analysis work.

Keep Node-only request/build helpers out of browser imports. The visual plan
imports browser-safe script data and generated timings; audio.ts and timing
preparation run in Node. Reuse the existing visual plan when cloning. Generate the complete recording after preparing the request, then map its
returned timing, write the SDK production code and render directly.

## Generate, review and hand back

Obtain explicit approval for paid generation and retain existing authorization
within its scope. No automatic paid retries, model substitutions or chunking.
Check the current model's request limit before approving a long script. Preserve
paid sources and refuse unapproved overwrites; use new versioned output paths.

Returned alignment can contain audio tags. Keep raw alignment for provenance;
the shared preparation helper maps only spoken words to scenes and captions,
failing on mismatches instead of guessing. Removing tag tokens from caption
data does not prove they were inaudible. Have the user listen for spoken tags,
unwanted sounds, voice fidelity, engagement and restrained energy.

Treat tone evaluation as a manual listening case, as documented in
`tests/README.md` and `scripts/preview-storytelling-tone.ts`. Present saved audio
samples in chat when useful. Automated request, word-map and actual-silence
checks establish pipeline mechanics; they cannot approve perceptual tone.

Return the per-video request code, exact request record, preserved raw source,
the one full audio file and mapped scene timings and listening-review status to the base skill.
Construct SDK production code using the mapped timings and one movie-level audio track. Regenerate timing
data after any approved audio edit. Visual revisions alone do not justify
regenerating paid narration.
