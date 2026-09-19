# Required visual behavior

This is the output contract for SDK implementation and authoring. Consult the README's implementation status before assuming a requirement is available as an API.

## Visual economy and continuity

Center the overall composition horizontally, with its visual center modestly above the viewport midpoint and a clear bottom safe area for player controls. Fit each actor list to the width of its longest measured text line and center the resulting block beneath the actor/header axis. Keep rows left-aligned within that block; do not center individual rows or use a fixed-width box that leaves surplus space beside short text. Reserve future rows and incoming transfers when measuring. Keep staged layouts stable; do not recenter on each reveal. Text-only multi-line blocks are centered as a whole, not by placing their first line at the center.

For every icon, line, container and motion ask: "Does this element help the viewer better understand the story? If not, do not add it."

Use person/group glyphs where they establish actors. Do not force icons onto work or problems, frame every group, stretch boxes to fill a column, or display redundant category headings. Architecture-diagram conventions communicate relationships; they do not require diagram decoration.

Keep existing items in stable order and position while their relationship is unchanged. Topic changes move the focus cue, not the items. Preserve relative order across scenes; necessary relocation must be an explicit understandable transition, never an abrupt swap. Use fixed-camera scenes without close-ups or pans.

Physical handoffs move the actual item between owners and preserve existing work. Retain successful handoff behavior during redesigns. Allow settled display time before a cut; do not reveal an item only to hide it immediately.

Match visual state changes to causal developments, not just audio-file boundaries. Use comparisons, allocations, processes and consequences when actor lists stop explaining the story. Minimize text-only screens without adding decoration. Resource units and timeline distances are schematic unless the essay supplies actual measurements; never invent percentages, hours or dates.

Paired comparisons preserve row alignment and use short semantic entries. Allocation conserves identifiable units during transfer. Process stages reserve their positions while prerequisites appear; a waiting token stays put until a narrated action resumes or returns it. Delivery-slip visuals keep the commitment fixed as actual delivery moves later. No enclosing panels are required by any of these patterns.

## Lists, focus and kinetic text

Competing demands or problems use a simple stable vertical text list, without an icon per entry. A group of people may identify whose problems they are.

Use the available horizontal space for short labels. Do not force a narrow character-count wrap onto an otherwise spacious single-group list. A newly introduced focused item must display its cursor on the same first visible frame, including before its handoff begins.

Focus uses a small animated dashed-arrow cursor beside the current row, like an old-school game-menu cursor. The cursor moves with narration and follows a focused item continuously during an ownership handoff. Text color, opacity and weight remain identical across focus states.

Allocation, process and delivery timelines show only their meaningful paths, units, markers and labels, without an overall title or bottom explanation. Planned versus actual delivery uses one horizontal time axis with a right arrowhead and a Time label, a fixed solid vertical planned milestone, then a later dashed vertical actual milestone. Both milestone labels sit above their lines without colliding during the reveal. Comparisons use a centered split, a thin vertical divider, small uppercase headings and short horizontal stroke bullets. Both headings and item text are left-aligned; bullets always precede text on its left.

When explaining an interaction between people or groups, use a lightweight animated dashed line across the relevant gap. Declare its start and end. Relationship lines must not imply transport unless the story describes transport. A list cursor merely points to an entry. Remove obsolete cues.

Do not remove a still-relevant relationship when the narrated topic changes. Preserve it through continuing scenes. Dashed motion is understated at 12.6 pixels/second, with continuous phase rather than resets that draw attention.

Use kinetic text for purposeful entrances, staged explanation and transitions synchronized to complete thoughts. Specify what each motion communicates. Do not replace kinetic text with static icon arrangements or arbitrary movement. Implement the motion once in the SDK and configure it in the video plan.

Text-only sentence entrances settle over 0.45 seconds. Narration subtitles appear only on text-only screens: explanatory visuals already carry the scene. This does not remove semantic actor labels or list entries.

## Palette and text

- Background: `#15100F`.
- All visible neutral text: `#D4D3D2`, full opacity, consistent weight across focus states. No dimming, brightening or parent opacity that changes inactive text. Motion or reveals may introduce text; focus must not change its appearance.
- Takeaway accent: `#EEA530`, reserved for promoted behavior or the retained principle. Mistakes, failures, generic activity and decoration stay neutral.
- Dedicated takeaway sentences enter with their retained phrase already gold. Emphasis has explicit bounds and does not persist into unrelated content.
- The final reflective or actionable CTA is italic and entirely gold from entry, including all wrapped lines, because it is guidance for the viewer to follow through on.

## Requirements-first verification

Write tests from this contract and the editorial plan before implementing SDK behavior. Cover stable ordering/placement, unchanged neutral text across focus states, icon-free lists, cursor alignment/movement, bounded dashed relationship cues, kinetic-text timing, collision-free handoffs and scene continuity.

Run the failing tests, implement the capability, and rerun them. Test actual rendered output with independently specified regions, colors and visibility, as in `tests/essay-sdk-output.test.ts`. A non-empty PNG is insufficient. Do not bless generated screenshots or substitute subjective image review for assertions.

Correct a test only when its requirement or measurement is wrong or underspecified; explain why. Never weaken it simply to accept code. Passing tests for implementation choices does not establish compliance with the intended design. Tests demonstrate specified measurable properties, not all possible perceptual qualities.
