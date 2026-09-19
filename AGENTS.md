# Repository contract

Build leadership video essays with `src/lib/essay-sdk` and vendor-agnostic skills in `.agents/skills`. `src/archive/lib` exists to keep older compositions compiling. Do not extend it for new production.

The skill explains essay adaptation and produces a script plus production plan/code that uses the SDK. SDK documentation teaches the LLM how to assemble that production code and describes API support and output requirements. The SDK itself implements layout, state, animation and rendering. Keep these responsibilities separate; reusable visual behavior belongs in SDK code, not per-video workarounds or skill prose.

Use requirements-first development: establish meaningful expected behavior, write failing tests, implement it, then run unit and rendered-output checks. Use deterministic geometry and pixel assertions instead of subjective image review. Correct a test only when its requirement or measurement is wrong, never merely to fit code.

Preserve existing work and paid source audio. Do not mutate git state. Paid narration needs explicit approval. Ordinary implementation and validation proceed under task authorization. Overwrite output only when authorized.

This file and the `.agents` workflow govern new work. Legacy `.claude` documents and archived compositions are references, not constraints on SDK architecture or scene vocabulary.
