---
name: leadership-visual-essay
description: Build a state-driven diagram video from a leadership/organizational essay — a fixed node/connector visual system with a focus-driven camera, one causal chain, one payoff, and per-beat technique matched to content. Opens on a hook, closes on an engagement question, not an essay paraphrase. Use for "Programmatic Leadership Visual Essay" style videos, as opposed to plain kinetic-typography videos.
version: 1.2
---

This is a distinct video genre from plain kinetic-text essay videos (see
[remotion-markup](../remotion-markup/SKILL.md) for that format — no example of it currently
exists in this repo; every video built so far uses this diagram format). Use this skill when
the user wants a leadership/organizational essay turned into a video that shows a *mechanism*
— people, information, and decisions moving through a system — rather than just narrated text
on screen. Reference implementation in this repo: `src/HowToBeUnderstood/`, built against the
shared library below — read it before building a new one, don't rely on memory of a past
session. Earlier implementations (`ConfusedLabels`, `PositiveFeedbackV2`/`V3`) were removed
once superseded by the shared library, to keep exactly one canonical example in the repo —
their rendered outputs (`out/ConfusedLabels.mp4`, `out/PositiveFeedback_v2.mp4`, `_v3.mp4`)
still exist.

## Format definition

**Narrative model**: one observable workplace case gradually exposes an organizational
mechanism. Never a montage of generic examples — one concrete, specific case carries the
entire video.

**Narrative architecture** — this is a causal chain, not an escalation of separate problems,
and it is bracketed by a Hook and a closing engagement question that are NOT paraphrased from
the essay. Map the essay's body onto these beats (skip any that don't apply, but keep the
order); Hook and CTA are new writing, not compressed essay sentences:

```
Hook  <- cold open, no diagram yet: tease the tension/outcome without giving away the mechanism
  -> Concrete First Action
    -> Reasonable Response (the other party's action is competent, not naive)
      -> Immediate Improvement (the response genuinely helps, at first)
        -> Point Where Control Ends (the exact moment/assumption where it breaks)
          -> Surviving Failure Path (the gap persists, unnoticed, across time)
            -> Visible Consequence (someone changes behavior because of the gap)
              -> Mechanism Reveal  <- THE PAYOFF: camera pulls back, shows the whole system
                -> Balanced Counterweight (preserve what was legitimate; isolate only the real mistake)
                  -> Reframe (state the general mechanism, beyond this one case)
                    -> Smallest Correction / Operational Close (the essay's own thesis, as bookend)
                      -> CTA  <- a direct question to the viewer, not "like and subscribe"
```

**Hook** (a few seconds, its own dedicated scene, diagram not visible yet — it has nothing to
show): create curiosity about the outcome without revealing the mechanism. A good test: if the
hook could be the essay's own opening sentence, it's too literal — write it fresh. E.g. instead
of opening on "A product team started designing a new reporting capability" (the essay's actual
first line), open on "Somewhere along the way, this team stopped building one project — and
started building four. Nobody decided that. It just happened," which creates a "how does that
happen?" question the rest of the video answers.

**CTA** (a closing engagement question, own dedicated scene, diagram already receded): after the
essay's thesis lands as the visual bookend, add ONE direct, specific question inviting the
viewer to reflect on their own experience with this exact mechanism — not generic engagement
bait. Style it quieter than the thesis (e.g. italic, muted color) so it reads as a genuine aside,
not another proclamation. This is new writing like the Hook; don't paraphrase the essay for it.

**Body wording**: the essay's own strongest, most quotable lines (the counterweight, the thesis)
are worth keeping close to verbatim — they're already written for a reader's eye and tend to
land fine spoken too. Everything else should be rewritten as spoken narrative, not compressed
essay prose: add small connective/tension phrases ("Slowly, each of them started building on
their own definition," "The warning had been there in every conversation") that a written essay
doesn't need but spoken narration does, to keep it from reading as a paraphrase.

Do not write a villain. If the response looks obviously stupid, the mechanism doesn't teach
anything. The strongest material shows a competent action that still produces a bad outcome
through an incomplete follow-through — that's what the Balanced Counterweight beat exists to
protect: preserve the legitimate part explicitly (e.g. "he was right to X — the mistake was
assuming that was the same as Y"), even if it means writing one original line not lifted
verbatim from the source essay. Flag that line to the user as original when you write it.

**Pacing — causal beats, not sentences.** One "beat" = one state change worth animating
(ownership changes, information arrives/disappears, a decision locks in, someone is
excluded, a consequence lands, the viewer's understanding changes). Group multiple sentences
under one beat and let the visual hold/develop rather than rebuilding on every sentence — a
beat's narration can be a full paragraph. As a rough size: the causal architecture above
maps to ~8-10 beats for an essay that would otherwise be ~15-20 kinetic-text sentences.

## Visual system

**Persistent world, not per-beat scenes.** Build one continuous SVG canvas in world-space
coordinates holding every entity for the whole video (people/roles as nodes, connectors
between them, an "info packet" that travels, HUD elements like a timeline/caption). Do NOT
scope entities to per-beat `<Sequence>`s — state must persist and evolve across beats (e.g. a
connector that's absent in beat 3 and appears in beat 6 needs `frame`-based logic, not
mount/unmount). Use `<Sequence>` only to place each beat's `<Audio>` at the right time.

**Connectors carry the entire mechanism — get their meaning right:**
- A connector must only exist between two entities that are *actually* in some form of
  contact in the story. **Do not draw any connector — dashed, faint, or otherwise — between
  two entities that have no relationship yet.** A "pending/exists-but-not-reaching" dashed
  state is only valid when the story genuinely has a degraded-but-real channel between those
  two specific entities. If they simply never talk, there is no line until the moment a real
  connection is made — it draws in fresh, live, exactly on that beat.
- Give each connector state a fixed, stable meaning used consistently for the whole video:
  e.g. grey = not yet relevant, solid neutral = active/healthy, solid accent + glow =
  delivered/reinforced. Don't reuse the accent color for something that turns out to be
  routine — reserve it for the one thing the essay is actually about.
- **Draw-on animations must grow in the true direction the information travels** (e.g. if
  information moves from Node A to Node B, animate the line growing from A's end toward B's
  end — `x1/y1` = the source, and drive `stroke-dasharray`/`stroke-dashoffset` off of that
  orientation). Getting this backwards reads as a subtle but real error.
- If an "info packet" travels between people, give it **one continuous journey** through the
  whole video (spawn -> hop to hop -> idle where it's stuck -> final delivery) rather than
  separate disconnected animations — one object's journey is what makes the mechanism legible
  as a single throughline.

**Node occlusion (a real bug to avoid):** connector lines terminate at node centers in code,
relying on the node's circle being drawn afterward and fully opaque to visually clip the line
at the circle's edge. **Never wrap a node in a group-level `opacity` to "dim" it** — that
opacity applies to the fill too, and any connector terminating inside it will visibly bleed
through instead of cleanly stopping at the edge. To dim a node (e.g. "this person is
currently out of the loop"), only change its stroke color and label color; keep fill opacity
at 1 always.

**Caption/diagram safe zone (a real bug to avoid):** the diagram's camera can zoom out far
enough (wide/reveal shots) that node labels sit in the same screen region as a bottom-anchored
caption — they will visibly overlap at some point in the video if you don't prevent it
structurally. Don't fix this by nudging pixel offsets per beat; guarantee it by construction:
wrap the diagram in a container styled `transform: scale(0.75); transform-origin: 50% 0%;`
(shrinks it uniformly, anchored to the top edge, so its lowest possible pixel is fixed
regardless of camera position/zoom) and position the caption in the now-permanently-clear band
below it (e.g. `top: ~860` instead of `bottom: ~130` on a 1080-tall frame). The diagram
literally cannot render into the caption's territory this way — a tuned-by-eye offset will
eventually be violated by some camera state you didn't test.

**Camera — derive the target, don't hand-pick coordinates.** For every beat, decide which
persona(s) are actually being discussed (0, 1, or 2 — rarely more) and compute the camera
from that:
- 1 focus node: center on it, tight zoom.
- 2 focus nodes: center on their midpoint; set zoom from their actual on-screen distance so
  they consistently fit with the same visual margin (e.g. `zoom = clamp(desiredOnScreenSpan /
  actualWorldDistance, minZoom, maxZoom)`), not a guessed constant per beat.
- 0 focus nodes ("wide"/"reveal"): center on the centroid of all entities, zoomed out. Use
  this whenever the beat is general/reflective rather than about a specific 1-2 people, and
  always for the Mechanism Reveal payoff (with a slightly wider zoom than the default idle
  wide shot, since the reveal is the one moment that needs to show literally everything at
  once).
- Never leave an entity in frame that the current beat isn't about — that's what reads as
  "not accurately centered" / confusing, even if technically visible.

**Camera must actually hold, not drift.** Build keyframes as explicit (arrive, hold-until)
pairs carrying the *same* x/y/zoom, so interpolating between them is genuinely constant —
then transition to the next target only in the gap between one hold-until and the next
arrive. A naive keyframe list of single points per beat will perpetually ease toward the next
target and never rest, which is most noticeable (and most damaging) on any beat that needs a
true static hold (a deadpan emotional beat, or the reveal itself while a connector draws).

**Camera moves must read as pans, not cuts.** A short transition (under ~20 frames at 60fps)
with an ease-out curve reads as a snap with a decorative curve on top, not a camera actually
sweeping across the layout — this is especially visible on any beat that cuts between several
entities in sequence (e.g. introducing four people one after another within one beat). Use
**at least 45-50 frames (0.75-0.85s)** for a between-entity pan and **~55 frames** for a
beat-boundary transition, with **`Easing.inOut(Easing.cubic)`** (accelerate away from the start,
decelerate into the hold) rather than the ease-out curve used for text entrances — that curve is
tuned for something appearing, not a viewpoint moving. This one `easing` choice in `Camera.ts`
governs every transition segment in the whole keyframe list (the flat hold segments are
unaffected since interpolating between two equal values ignores the easing shape), so it's a
single, low-risk change with a large effect on how "programmatic" the video feels.

## Structure conventions for this format

- **No title card** (no essay title/byline card) — but there IS a Hook scene before the diagram
  appears (see Narrative architecture above); the difference is a title card announces the
  video, a Hook creates a question. The diagram fades in at the start of the first causal-chain
  beat, not at frame 0.
- **No separate outro/end card.** After the thesis bookend, the CTA is the true final beat: hold
  it on screen for about 2.5 seconds after its audio ends, then end the composition there.
- Default to **1920x1080 at 60fps** for this format (smoother diagram/camera motion than the
  30fps used for the plain kinetic-text format).
- Keep the same base dark/accent palette as the project's other essay videos for series
  continuity, unless told otherwise.

**Pacing: silence needs real duration, not just a nonzero value.** Every beat's hold (the gap
between its speech ending and the next beat's speech starting) is already structurally silent —
but 500-900ms of that reads as a rounding error, not a breath, especially stacked against fast
camera cuts. Use **1.2-2.6 seconds of hold** depending on the beat's weight (short/plain beats
at the low end, the Mechanism Reveal and the final CTA at the high end) — roughly 1.5-1.8x
what feels sufficient on first instinct. This, together with the pan-not-cut camera rule above,
is most of what separates a video that feels "programmatic" from one that feels directed.

## Audio & timing pipeline (reuse, don't reinvent)

Follow the same real-timestamp pipeline as the plain kinetic-text format
(`scripts/generate-voiceover*.ts` in this repo): one ElevenLabs `with-timestamps` call per
*beat* (not per sentence — a beat's script can be a full paragraph), derive word-level timing
JSON, and drive every diagram state change (connector draw-on start/end, packet travel
start/end, camera cue points) off real word timestamps via a `frameOfWord(beatId, word,
edge?, occurrence?)` lookup — never a guessed frame number. Run generation with:
`node --env-file=.env --experimental-strip-types scripts/generate-voiceover-<name>.ts`
(no `tsx`/`ts-node` dependency needed on Node 22+).

**Voice settings — avoid a flat/monotone read.** Default `voice_settings` tuned for
consistency (`stability: 0.5, style: 0.3`) reads as monotone over 2-3 minutes of narration. For
this format, prefer `stability: 0.35` (ElevenLabs' actual lever for natural prosodic variation
between sentences — lower is more expressive/human, higher is flatter/more consistent),
`style: 0.45` (leans into the voice's natural expressiveness), and `speed: 0.92` (valid range
0.7-1.2, default 1.0; a measured pace reads as more deliberate/less rushed than default). There
is no literal per-breath pitch control in the ElevenLabs API — `stability` is the closest real
lever to "less monotone," not a pitch-curve parameter, so don't over-promise precision here when
describing the effect to a user.

**Sentence-to-sentence pauses — still an open problem, `eleven_v3` is not the fix.** A beat's
script is often a full paragraph (multiple sentences in one `with-timestamps` call), and the
model's default pause at a sentence-ending period is short and uniform — over several sentences
it can read as separate audio clips butted together rather than one person speaking. The tag
`<break time="Xs" />` does insert a real, controllable gap when sent to `model_id: "eleven_v3"`
(confirmed directly: ignored on `eleven_multilingual_v2` — 0.45s gap, tag literally read back
as text in the alignment response — but honored on `eleven_v3` — 2.0s gap, tag not spoken).
**Don't use this fix anyway**: `eleven_v3` is still a preview feature and was found, on direct
listening after a full-script regeneration, to measurably degrade voice fidelity/character
compared to `eleven_multilingual_v2` — a worse trade than the pause problem it solves. Generate
on `eleven_multilingual_v2` (see `voice_settings` above) and accept the tighter natural pauses
until v3 (or an equivalent break-tag-supporting model) leaves preview and is re-verified for
fidelity, not just for whether the tag works.

If pausing is worth solving before then, the two options that don't require a model swap are:
post-process the already-generated beat MP3s to splice in measured silence at each real sentence
boundary (via ffmpeg) and re-derive word timings shifted to account for it — no new ElevenLabs
cost, but requires rebuilding `data.ts`/`timeline.ts` and re-verifying every camera/connector cue
still resolves; or generate one `with-timestamps` call per *sentence* instead of per beat and
assemble the beat's audio with exact silence gaps controlled directly in Remotion — more control,
but a real pipeline change away from this section's "one call per beat" convention, and still
costs a fresh paid generation. Neither has been implemented or tested end-to-end yet.

If a future break-tag-supporting model is used again, two mechanical footguns to handle in the
generation script (found while testing `eleven_v3`, still true for any such model): pad the tag
with real spaces (`sentence one. <break time="0.35s" /> sentence two.`, not butted against the
punctuation) or its characters fuse onto the adjacent real words when the alignment response is
split into words, corrupting both; and filter tag characters out of the derived word list — the
alignment response reports the tag's own characters with timestamps as if they were spoken text,
even though real audio doesn't voice them, so drop any parsed "word" matching `/[<>="]/` before
writing to the timing JSON (none of this format's real spoken words contain those characters, so
the filter is safe).

Verify end to end on a single real beat (word count and reconstructed text vs. original, byte
for byte) before spending on a full multi-beat regeneration — a bad filter or an unsupported
tag combination wastes the whole script's cost at once, a single-beat test costs a fraction of
that.

## Reusable library — import, don't copy-paste

`scripts/lib/` and `src/lib/` hold every piece of this pipeline that's genuinely mechanical
boilerplate, not creative per-video content. Built after three videos had independently
re-derived (and once, mis-derived) the same code. **Before writing any of the code below by
hand, check whether `src/lib`/`scripts/lib` already has it** — re-deriving something that
already exists there is exactly the wasted-token/re-discovered-bug pattern this library exists
to prevent. `src/lib/__demo__/` is a standing smoke test for the library itself (synthetic
placeholder data, not a real video) — run `npx remotion still LibDemo out.png --frame=N` after
touching anything under `src/lib` to confirm nothing broke.

What's in the library (import these, don't reimplement):
- `scripts/lib/elevenlabs.ts` — `generateVoiceover({ outDir, slides, voiceSettings?, modelId? })`,
  the entire ElevenLabs `with-timestamps` call + word-timing derivation + file-writing loop.
  Defaults to the validated `voice_settings` and `eleven_multilingual_v2` (see "Voice settings"
  and "Sentence-to-sentence pauses" below — don't default to `eleven_v3`).
- `scripts/build-timing-data.ts` — CLI: `node --experimental-strip-types
  scripts/build-timing-data.ts <VideoName>` builds `src/<VideoName>/data.ts` straight from
  `public/voiceover/<VideoName>/beat-*.json`. Never hand-write this conversion.
- `src/lib/palette.ts` — the format's palette/font constants.
- `src/lib/sentences.ts` — `splitSentences`/`wordsToText`.
- `src/lib/timeline.ts` — `buildTimeline(beatOrder, beats, holdSeconds, fps)` (real audio
  duration + a declared per-beat hold weight, not a hand-summed cumulative frame table — a
  hand-summed table silently goes stale the moment the audio changes) and
  `frameOfWordFactory(beats, timeline, fps)`.
- `src/lib/Camera.ts` — `cameraTransformFactory(frames, xs, ys, zooms)`, called with a video's
  own `CAMERA_FRAMES`/`X`/`Y`/`ZOOM` from its `layout.ts`.
- `src/lib/Wipe.tsx` — the scene-transition wipe.
- `src/lib/diagram/PersonNode.tsx` — node circle + label, with the occlusion-safety rule (see
  below) enforced by construction: `dim` only ever changes stroke/text color, never fill opacity.
- `src/lib/diagram/DiagramFrame.tsx` — the safe-zone wrapper (see "Caption/diagram safe zone"
  below) + camera `<g>` + `<svg>`, taking `worldOpacity` and children.
- `src/lib/diagram/connectorMath.ts` — `drawOnStyle(t)`, the pathLength=1 draw-on primitive.
  **Connector activation, direction, and color meaning stay hand-written per video** — that's
  the creative core of the diagram, not boilerplate (see "Connectors carry the entire
  mechanism" below).
- `src/lib/scenes/` — `HookScene`, `CtaScene`, `SplitArgumentScene` (right-call/mistake split,
  with the title-alignment/weight fix below baked in — see "Match technique to content"),
  `ListRow`, `Caption`, `LongFormScene` (see "Match technique to content" for when to use this
  one), and the shared `sentenceCycle`/`HighlightedText` logic they're built on.

## File layout (mirror this)

```
src/<VideoName>/
  data.ts      # BEATS: id, durationMs, words[] — generated by
               # scripts/build-timing-data.ts, never hand-written
  timeline.ts  # FPS, BEAT_ORDER, HOLD_SECONDS, then TIMELINE = buildTimeline(...)
               # and frameOfWord = frameOfWordFactory(...) from src/lib/timeline
  layout.ts    # STILL FULLY CUSTOM: palette overrides (rare), node positions,
               # connector/packet cue frames, focus-driven camera keyframes,
               # per-beat highlight phrases — this is the video's creative core
  Camera.ts    # export const cameraTransform = cameraTransformFactory(...)
               # from src/lib/Camera, called with this video's own keyframes
  World.tsx    # STILL CUSTOM: the persistent SVG world — which nodes/connectors
               # exist and what they mean — built on src/lib/diagram primitives
               # (PersonNode, DiagramFrame, drawOnStyle)
  Hud.tsx      # thin: which beats use the generic caption (CAPTIONED_BEATS),
               # rendering <Caption> from src/lib/scenes with this video's data
  Scenes.tsx   # STILL CUSTOM where content is bespoke (which items, which
               # split text, word-slice indices, real-word-anchored reveal
               # frames), built on src/lib/scenes primitives (HookScene,
               # CtaScene, SplitArgumentScene, ListRow, LongFormScene)
  index.tsx    # composition: <World/>, <Caption/> rendered continuously, one
               # <Sequence> per beat for <Audio>, dedicated scene <Sequence>s,
               # <Wipe/> at actual diagram-visibility mode switches only
```

**Naming gotcha**: don't name the data/constants file `world.ts` alongside a `World.tsx`
component in the same directory — on a case-sensitive filesystem TypeScript still rejects
filenames differing only by case (`forceConsistentCasingInFileNames`). Use `layout.ts` for
the data file instead.

## On-screen text must be derived, never hand-typed (this is the #1 recurring bug)

Every version of this format so far has shipped with captions that quietly diverge from the
actual audio — e.g. showing "at the review" when the recorded line says "at the performance
review." The fix is architectural, not "be more careful": **on-screen text must be computed
from the same real word array that generated the audio, never retyped by hand as a separate
string.** Concretely:

- Write a `splitSentences(words)` utility that groups a beat's real `WordTiming[]` into
  sentences at real sentence-ending punctuation (`.`, `?`, `!`). Every piece of on-screen text
  — captions, list items, split-screen phrases, the closing line — is built by slicing this
  array and joining, e.g. `wordsToText(words.slice(a, b))`, never a separately hand-typed
  string. If you need a line break mid-sentence (e.g. after a comma), find it by scanning the
  words (`words.findIndex(w => w.text.endsWith(","))`), don't hand-split the string.
- Caption presentation should show **one real sentence at a time**, timed to that sentence's
  own first-word start / next-sentence start (not the whole beat's paragraph held statically
  for the beat's full duration). This is both more accurate (always a complete, exact
  sentence) and reads as the screen actively tracking the narration.
- Cosmetic normalization is fine and doesn't violate this rule: capitalizing the first letter
  of a phrase pulled out for standalone display, or swapping a trailing comma for a period
  when a mid-sentence clause becomes its own line. Changing, adding, or dropping a *word* is
  never fine.
- The one exception: a short original line for the Balanced Counterweight beat (see above) —
  that's new content, not a caption of existing audio, and should be flagged to the user as
  such.

## Match technique to content — the diagram is not the only tool

The single biggest quality failure in early drafts of this format was applying the same
node/connector diagram to every beat regardless of what that beat is actually about, so nothing
about the screen distinguished "we're describing a relationship between two people" from "we're
listing three things" from "we're weighing a legitimate action against a mistake." Treat the
diagram as **one technique among several**, reserved for beats that are genuinely about people/
information moving through the system. For other beats, build a dedicated full-screen scene
whose *structure* matches the sentence's structure:

- **An enumeration** ("it says: this worked, this mattered, do it again") becomes an actual
  list: wipe away from the diagram, then reveal each item as its own row, timed to that item's
  own real words (first-word start frame), with a small recurring visual motif per row (a
  growing tick/line, a checkmark) — not narrated over the graph.
- **A two-sided argument** (preserve the legitimate action, isolate the actual mistake — the
  Balanced Counterweight beat) becomes a literal split: two labeled zones (e.g. "THE RIGHT
  CALL" vs "THE MISTAKE"), each revealing on its own real timing, colored so only the actual
  mistake gets the accent color. **Align both column labels to the same top edge**
  (`alignItems: "flex-start"` on the row, not `"center"`) — centering the row vertically makes
  the label of whichever column has the shorter body text visually float higher than the other
  once real (unequal-length) text fills them in, which reads as broken layout, not a design
  choice. And **give both column bodies the same font weight**, differing only by color (e.g.
  both `fontWeight: 700`, one `TEXT` and one `ACCENT`) — weight and color both changing at once
  reads as two unrelated styles rather than one system with one variable (the color) doing the
  distinguishing work.
- **A quote** gets its own flat, deadpan typographic treatment (no camera movement, an
  intentionally muted color, added quotation marks) distinct from ordinary narration beats.
- **Long-form reflective narration** (a beat that states a general principle or thesis line,
  not tied to any specific node or relationship — e.g. the Reframe or Smallest Correction beats)
  gets a dedicated full-screen scene too, not a generic caption layered over the dimmed diagram.
  Center it properly in the frame (not confined to the bottom caption band — there's no diagram
  to keep clear of anymore) and size the text larger than the ordinary caption, since it's now
  the sole thing on screen. Set the diagram's opacity to a literal `0` for this stretch, not a
  faint residual (the ~0.02-0.05 "near-invisible" dimming below is for a dedicated scene with
  substantial content covering most of the frame, where a faint diagram ghost is negligible; a
  single line of large centered text leaves most of the frame empty, and a faint diagram there
  reads as visible clutter, not restraint).
- Look for small concrete illustrations tied to specific nouns in the sentence — e.g. if the
  script lists concrete work items ("corrections, task assignments, deadline reminders"),
  label the moving pieces in the diagram with those exact words instead of generic shapes.
  This kind of detail is cheap to add and is what separates "the graph is running" from "the
  video is showing me what's being said."

Reserve the diagram itself for beats about a relationship, an exclusion, or the mechanism
reveal — the throughline of the video — not as a default backdrop for every beat regardless of
content. Once a beat (or run of beats) has moved past the mechanism into pure reflection — no
node or relationship left to show — the diagram doesn't need to come back for the rest of the
video; don't dim-and-restore repeatedly across a stretch that's structurally done with the
diagram.

## Scene transitions (wipes)

When switching from the diagram into a dedicated full-screen scene (or between two dedicated
scenes), use a deliberate full-screen color wipe (a colored panel sweeping across in ~0.4-0.5s,
e.g. `translateX` from -100% to 0% to 100% centered on the cut frame) rather than a soft
crossfade. This is a genre cue that the mode of the video just changed, not just the content —
reserve it for actual mode switches (diagram -> dedicated scene), not every beat, or it stops
meaning anything. When a dedicated scene takes over, dim the diagram behind it to
near-invisible (~0.02-0.05 opacity, not merely reduced) — a partially-visible diagram bleeding
through undermines the sense that the screen actually changed. Once the diagram is fully gone
(opacity `0`, e.g. entering a run of long-form reflective beats), further beats within that same
stretch don't each need their own wipe — the diagram's mode isn't changing again, only the text
is, so treat those as ordinary beat transitions. Reserve the wipe for the moments the diagram's
visibility actually flips.

## Verification before rendering

- Spot-check stills (`npx remotion still <id> out.png --frame=N`) at every beat boundary and
  specifically at the Mechanism Reveal, before committing to a full render.
- For every piece of on-screen text, read it against the actual `words` array it was sliced
  from — not against your memory of what the essay said. This is the check that catches
  dropped words; do it for every beat, not just the ones that feel risky.
- Confirm no connector is visible between entities that shouldn't have one yet.
- Zoom into a still where a connector meets a node and confirm the line visibly stops at the
  circle's edge (the occlusion bug above).
- Confirm the camera framing at each beat only includes the entities that beat discusses.
- Confirm at least the enumeration/list beat and the counterweight beat use a dedicated scene,
  not the diagram + generic caption — if every beat still looks like "graph + caption," the
  match-technique-to-content step above was skipped.
- Check a still at the widest camera framing (the Mechanism Reveal, or any other 0-focus-node
  beat) with the caption visible — confirm no diagram content (node labels, tags) intersects
  the caption band. This is the safe-zone check; do it at the widest shot specifically, since
  that's where a tuned-by-eye offset would have failed.
- Scrub (not just spot-check) the multi-person pans within a beat — confirm they read as a
  sweep across the layout, not a snap-cut with a curve on it.
- Confirm the video opens on a Hook scene (not the diagram, not a title card) and closes on a
  CTA scene (not the thesis) — and that neither is a paraphrase of the essay's own opening/
  closing sentences.
- On any two-column comparison scene, check a still with both columns' real (unequal-length)
  text visible: confirm both labels sit on the same top edge and both bodies share one font
  weight, differing only by color.
- On any long-form reflective beat, confirm the diagram is fully gone (not a faint residual)
  and the text is centered in the full frame, not confined to the bottom caption band.
- `npx tsc` and `npx eslint <dir>` clean before rendering.
