# Visual patterns

Import `Visual` from `visuals.ts` and assign `Scene.visuals`. These are executable, reusable patterns, not suggestions for bespoke drawing code. See `src/ChangingTooMuchV11/visual-story.ts` for narration-bound production data.

All times are **scene-local frames**, including events inside a visual. Every visual has `kind`, `start`, and exclusive `end`; `title` is optional. Several visuals may share an audio scene if their intervals do not overlap. A dedicated visual cannot share an actor layout; use consecutive scenes or visual intervals instead. Narration continues without subtitles. Allocation, process, timeline and comparison patterns do not display overall titles or bottom descriptions; their own labels and the narration explain the visual. Legacy title/note fields remain accepted but are not drawn by those patterns.

All current patterns omit overall titles and notes. Keep `notes: []` where required by the compatibility API; meaningful lane, stage and milestone labels remain visible.

## Paired comparison

Use for story versus correction, intention versus inference, or two outcomes. `left` and `right` are column headings. `rows` contains 1–4 `{id, left, right}` pairs. Each cell is `{text, at, promoted?}`. Row positions are reserved; revealing one side never shifts the other. Gold requires explicit `promoted: true` on the guidance cell, not its column position.

```ts
const comparison: Visual = {
  kind: 'comparison', start: 0, end: 600,
  left: 'Win the argument', right: 'Expose the problem',
  rows: [
    {id: 'outcome', left: {text: 'Win the specialist', at: 30},
      right: {text: 'Resolve competing commitments', at: 240, promoted: true}},
    {id: 'repeat', left: {text: 'Repeat the conflict', at: 360},
      right: {text: 'Agree who sets priority', at: 420, promoted: true}},
  ],
};
```

The same layout can distinguish word-of-mouth instructions from an embedded checklist, or a motivational push from diagnosing a missing prerequisite. The centered split has small uppercase, letter-spaced headings and one thin vertical divider. Both column headings and entries are left-aligned. Short horizontal stroke bullets sit to the left of each entry, without enclosing panels. Each heading is gold only when every cell in that column is promoted; column position never determines color. Cells enter over 0.45 seconds and remain full-opacity.

## Allocation and displacement

Use to show finite capacity reassigned between commitments. Supply 2–3 `lanes: {id,label,promoted?}[]`, `units` (1–8), `initial` lane ID and `moves: {units: number[], to, start, end}[]`. Unit IDs are zero-based. Each unit retains its column and moves vertically to its destination lane, so the viewer can see what was taken away. Simultaneous transfers of different units are valid; overlapping transfers of the same unit are rejected.

Set `notes: []` and omit `title`. Allocation shows horizontal lane labels and the moving units only.

These units are schematic, not measured hours or percentages. Their count determines diagram granularity; do not narrate their count as evidence or add invented numeric labels. For *YesCosts*, lanes could be client report and prospect demo. For *AddingMorePeople*, they could distinguish delivery, onboarding and repeated investigation.

## Process, waiting and rework

Supply 2–4 `stages: {id,label,at,promoted?}[]`, a short `token` label, its `initial` stage, and `moves: {to,start,end}[]`. The initial stage must be visible from the visual's start. A destination must be revealed before movement begins. Stage positions remain reserved when intermediate prerequisites appear.

The token stays at its last destination between moves. This is a wait, not a looping animation. A later move resumes the work. Moving to an earlier stage depicts rework or a returned request. Ordered movements can form a repeated decision loop without a separate render implementation. Use concise stage and token labels, not a title or bottom explanation; set `notes: []`. Movement means actual work/request movement; do not use it merely to emphasize a noun.

Examples: a license request returned for the correct approval; a design sent back after discovering a constraint; a migration problem held while the meeting is arranged. Dashed lines retain the SDK's slow 12.6px/second motion.

## Commitment and delay

`kind: 'timeline'` compares planned and actual delivery without inventing dates. Set `plannedLabel`, `actualLabel`, fixed `planned`, `initial` actual position, and `moves: {start,end,to}[]`. Positions are normalized layout coordinates from 0 to 1, **not dates, completion percentages or measured durations**. One horizontal axis with a right arrowhead and centered `Time` label represents time. A solid vertical planned milestone stays fixed; a dashed vertical actual milestone appears at the first movement cue and shifts later. Both milestone labels sit above the axis at the same height, offset to opposite sides of their markers so they do not collide when the actual milestone first appears. Set `notes: []` and omit `title`: milestone labels and narration suffice.

Use only when the story actually establishes a slipped commitment. Do not imply an amount of delay that the source does not provide. The current pattern is a schematic delivery comparison, not a general quantitative chart.

## Verification and extension

`validateVisuals` rejects invalid times, labels beyond supported bounds, missing endpoints and conflicting movements. `visualState` projects frames; `renderVisual` draws them. Per-video code provides data only.

Requirements tests in `tests/essay-patterns.test.ts` cover paired alignment, conserved allocation, waiting/return/resume and fixed commitments, with fixtures from several essay scenarios. `tests/essay-patterns-output.test.ts` checks actual browser pixels for reassignment, prerequisites, waiting, delay and neutral/gold comparison columns. Existing SDK tests retain handoff and list coverage.

This first iteration does not provide arbitrary nested layouts, numeric charts or a dedicated diagnostic-tree API. Use the supported list/comparison/process patterns where they explain the story; extend through requirements-first tests when they do not.
