---
name: generate-video-essay
description: Adapt an input essay into a leadership video script and production plan, then write production code using the documented leadership video SDK.
---

# Leadership video essays

## Responsibility and deliverables

This skill explains how to adapt an essay into a leadership video essay. Its output is the narration script plus a production plan expressed as code using the SDK. The SDK supplies executable video behavior. SDK documentation teaches the LLM how to assemble that code.

The canonical skill is `.agents/skills/generate-video-essay/SKILL.md`. Keep any installed personal copy synchronized byte-for-byte. Use vendor-agnostic `.agents` skills rather than `.claude` skills.

Read `AGENTS.md` and the SDK documentation at `src/lib/essay-sdk/README.md`. Follow its authoring guide, visual requirements, API reference and verification instructions when translating the plan into code. Do not duplicate API instructions or rendering algorithms in this skill.

## Adapt the essay into a script

Identify the concrete leadership situation: who is involved, what they are already trying to achieve, what someone changes, why that action appears reasonable, and how the consequences arise. Preserve the essay's meaning and relevant nuance. Do not invent factual details.

Write for spoken explanation rather than reproduce the essay paragraph by paragraph. The hook establishes the scenario or intervention without disclosing the consequence. Let the causal explanation earn the outcome later. End with a useful behavior or principle grounded in that explanation.

Build progression from the example story to its consequences, then extrapolate the broader problem and present the solution. Each segment must advance understanding. Remove restatements of the same mechanism and empty bridge sentences; do not repeat the case study immediately before making the same point in broader terms.

Use complete explanatory thoughts as scene units. There is no mandatory beat count or fixed narrative checklist. Distinguish source material from newly written hooks, connective narration and closing questions.

Supply the exact spoken script. Short semantic labels may differ from narration; verbatim captions must derive from the actual timed spoken words.

## Plan the visual explanation

For every proposed element ask: "Does this element help the viewer better understand the story? If not, do not add it."

Choose the simplest explanatory form for each thought: an interaction, physical handoff, list of competing demands, comparison or kinetic-text scene. Do not force every noun into an icon or connected graph. Use the SDK's documented visual language, continuity rules and focus treatments. Gold belongs to the promoted behavior the viewer should retain.

Prefer rich, minimal explanatory visuals throughout the essay. Consult the SDK's visual-pattern guide for comparisons, allocation, process/rework and consequences, not only actor diagrams. Text-only screens are deliberate choices for a concise statement, quotation or closing question, not a fallback for missing visual support. An audio segment may contain several visual states: plan each meaningful causal change, rather than hold one illustration while narration moves on. Comparisons use short paired entries, not two columns of verbatim narration.

When a scene already has an explanatory visual, let narration accompany that visual without explicit narration subtitles. Display timed narration text only on text-only screens. Short diagram labels and list entries remain part of the visual, not duplicate subtitles.

Keep animation understated: entrances should settle comfortably, and moving dashes should suggest dynamism without competing for attention. Keep relationship lines present for as long as the relationship remains relevant, even when the narrated topic changes. A newly introduced item that is the focus needs its focus cue immediately, not after the viewer has already seen the item. Make the final reflective or actionable CTA italic and gold from its entrance, as guidance for the viewer to follow through on.

Plan content as a horizontally centered composition slightly above vertical center, leaving room for player controls. Use the screen's available space for short labels rather than unnecessary wrapping. Avoid overall titles and bottom explanations on allocation/process/timeline visuals when their labels and narration already communicate the meaning. Comparison columns use left-aligned headings and entries with bullets on the left. Follow the SDK documentation for the implementation of these presentation rules.

For each scene specify:
- Its purpose and exact narration.
- The people, groups, work and relationships needed to explain it.
- What changes, what stays in place, and how the scene connects to the next.
- The narrated focus and the intended takeaway.
- The documented SDK capabilities that implement that intent.

Preserve successful explanatory actions when revising surrounding design. Ask for genuinely missing editorial decisions; do not infer them from what the current renderer happens to support.

## Produce SDK usage code

Deliver the script and corresponding production code, not only a prose storyboard. Use the SDK authoring guide to construct the scene data, narration timing bindings and composition entry point. Per-video code selects and configures SDK capabilities; reusable visual behavior belongs in the SDK.

Check the SDK documentation's implementation-status section. If a required capability is missing or conflicts with the visual requirements, identify the gap in the plan. Extend it through the documented requirements-first process when authorized; do not invent an API or silently accept an unsuitable rendering.

Obtain approval before paid narration generation. Preserve existing authorization for ordinary implementation and verification. Follow the SDK docs for audio preparation, production commands, tests and artifact validation. Preserve requested filenames and overwrite only when authorized.

The script and production code must express the same explanation. Report any remaining SDK gap explicitly rather than describe the intended result as already implemented.
