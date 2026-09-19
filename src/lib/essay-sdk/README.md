# Leadership essay SDK

The SDK renders scene plans with a fixed 1920×1080 viewport. `index.ts` provides types, compilation, frame state and escaped SVG. `EssayVideo.tsx` uses the same renderer with Remotion audio. Palette and sentence utilities are owned here.

## Read this before authoring

- [Authoring guide](authoring.md): turn the script and scene plan into code that calls the SDK.
- [Visual requirements](visual-requirements.md): intended output behavior and requirements tests.
- [Visual patterns](patterns.md): comparison, allocation, process/rework and delivery-slip APIs, with reuse examples.
- The API reference below describes what the code currently supports, not approval to use behavior that conflicts with those requirements.

## Implementation status

The renderer supports representative people, icon-free vertical lists, physical ownership transfers, animated dashed topic cursors, bounded actor relationships, staged list entrances, sentence entrances, scene reflow and takeaway coloring. Dedicated visuals add paired comparisons, conserved capacity allocation, process waiting/return/resume, and planned-versus-actual delivery. Neutral text stays full-opacity and regular-weight regardless of focus. The current reference production is `src/ChangingTooMuchV11/plan.ts`; earlier plans are historical.

## Plan contract

`EssayPlan` declares fps and ordered scenes. Each `Scene` declares duration in frames, narration words in milliseconds, optional audio source/playback duration, groups, typed items, transfers, topic intervals and takeaway intervals. All event intervals are local and half-open: `[start, end)`. The compiler derives global offsets.

Groups contain representative individual glyphs and a centered name, with no visible boundary. Items are plain list labels for work, issues, processes, systems or questions; `owner` determines placement. Stable reserved rows follow array order. No item icons, panel outlines or redundant headings are drawn. A concept without ownership belongs in narration or a dedicated text scene. Semantic labels are plan data; captions come from timed narration.

Transfers move one existing item to a destination group, first aligning with its row and then crossing horizontally. Slots remain reserved so existing work stays in place. A transfer needs half a second to settle before the scene ends.

Topics place a small dashed-arrow cursor beside the named row without changing its text. The cursor follows the item's position during transfers; keep the topic interval active through a handoff when that work remains the narrated focus. Optional `connection: true` also adds an owner-to-item dashed line; use only for a meaningful relationship, not ordinary list focus. Cues animate dash offset rather than text opacity. When introducing a focused item, start its topic at `revealAt ?? 0`, not a later spoken-word cue. Takeaways color an item or phrase gold. A phrase enters already gold whenever its sentence appears during the interval. Scene changes discard prior emphasis.

Text-only scenes have no groups or items. The renderer displays one timed sentence at a time only on these screens. Scenes with actors/lists suppress narration subtitles automatically, retaining semantic labels. There is no camera API.

Scenes with `visuals` are also explanatory screens, never narration-subtitle screens. Their timed states are independent of the audio segment boundaries. The compiler validates intervals and pattern-specific requirements; `visuals.ts` implements geometry and drawing. Read the pattern guide before authoring these scenes.

For a closing CTA, set `textStyle: 'italic'` and declare `takeaways: [{text: true, start: 0, end: duration}]` on its text-only scene. This colors every wrapped line from entry. Use `phrase` for a narrower retained phrase and `item` for a promoted list entry.

### Motion and relationships

- `Scene.relationships?: {from, to, start, end}[]`: group IDs, local frame interval. A neutral animated dashed stroke spans the actor gap during that interval. Keep it through topic changes when the relationship remains relevant; repeat the declaration on a continuing scene. This is not a transport animation.
- All dashed strokes advance at 12.6 pixels/second (70% slower than the previous 42 pixels/second). Global frame time preserves the dash phase across consecutive scenes, independent of fps.
- `Scene.textMotion?: 'rise'`: each complete sentence on a text-only screen enters with a 24px, 0.45-second cubic settle at its first spoken word. Text remains fully opaque. This is 50% longer than the earlier 0.3-second entrance.
- `Item.revealAt?: number`: local frame for a staged list entry. Its row is reserved from the start; text slides 24px into place over 0.3 seconds. Earlier rows do not move. Omit for continuously visible items.
- `Scene.transition?: 'reflow'`: shared groups and their owned rows move from the preceding layout's group center to the new center over 0.4 seconds. Use during the 0.5-second narration lead-in. Preserve item order for continuing content; a new explanatory scene may introduce new list entries. This moves content, not the camera.

Each motion is a pure function of frame. Do not use CSS animation, random state, timers or per-video drawing code.

## API and supported bounds

- `compileEssay(plan)` validates references, timing and capacity, then calculates layouts and global scene offsets.
- `frameState(movie, frame)` projects geometry, ownership, connectors and caption state.
- `renderSvg(state)` produces deterministic SVG with escaped text.
- `EssayVideo` renders that SVG and sequences the declared audio.

The initial layout supports up to three groups, one to five representative people per group, and three reserved item slots per group including incoming transfers. Group labels have a 36-character limit; item labels have a 34-character limit. One transfer per item per scene is supported. These are explicit implementation bounds, not restrictions on which leadership stories may be told. Extend the SDK with requirements tests when a plan needs another capability.

## Verification

Run `npm run lint` and `npm test`. SDK requirements live in `tests/essay-sdk.test.ts`; reference acceptance requirements live in `tests/changing-too-much-sdk.test.ts`. `tests/essay-sdk-output.test.ts` renders actual Remotion PNGs and asserts independent RGB regions for background, actors, list text, relationship strokes, focus cursors and takeaway text. It compares list-text pixels across topic changes. Blank images cannot pass.

The reference plan is `src/ChangingTooMuchV11/plan.ts`, with visual production data in `visual-story.ts`. Archived helpers under `src/archive/lib` are not SDK dependencies.
