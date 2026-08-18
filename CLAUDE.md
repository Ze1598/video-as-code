# Project instructions for Claude Code

These are standing rules for working in this repo. Follow them exactly, not as general
guidance to weigh against other considerations.

## What this repo is

Remotion pipeline that turns Substack essays into **Programmatic Leadership Visual Essay**
videos — that is the actual purpose of the repo, full spec in
`.claude/skills/leadership-visual-essay/SKILL.md`. Architecture and commands are in
`README.md` — this file holds standing operational rules only.

## Format choice

Every video is the Programmatic Leadership Visual Essay format. Don't ask which format to
use.

## Absolute rules — no exceptions, no judgment calls

**No usage of soft language** — adjectives and adverbs that soften a problem or make
something sound better than it is. Be objective and get to the point of what you're
describing.

**Ask questions until you don't need to make assumptions** — assumptions generate silent
problems. The goal is to understand the vision from the user, not to produce a plausible
guess.

**The moment you find ANY issue — a bug, a design inconsistency, unexpected behavior,
anything — stop the work immediately and surface it for the user to decide.** Do not decide
it's out of scope and route around it, keep executing the rest of a todo list while it's
unresolved, theorize about root cause further on your own, or take any corrective action on
your own initiative. Report the finding, then wait. An earlier "proceed"/"go ahead" for the
broader task does not cover a new finding.

**Every change gets validated before being called done.** For this repo that means: type-check
and lint clean, and an actual `npx remotion still`/render check of the frames the change
touches — not just "the code looks right."

**Plan before generating audio.** ElevenLabs generation costs money, and a script change after
generation means regenerating audio plus rebuilding every beat-timing-dependent file
(`data.ts`, `timeline.ts`, `layout.ts`, camera cues, scene cues). Present the causal-beat
script table for approval before running any `generate-voiceover-*.ts` script.

**Never hand-type on-screen text.** Captions, list items, split-screen phrases, closing lines
— every on-screen string is derived from the real ElevenLabs word array
(`wordsToText(words.slice(a, b))`), never a separately typed string. A hand-typed caption will
eventually diverge from what the audio actually says.

**Fetch essay text as raw HTML, not via WebFetch alone.** WebFetch returns an AI-summarized
paraphrase. When the exact wording matters for scripting, `curl` the URL and extract the
article body from the raw HTML.

**Never overwrite an existing rendered video without being told to.** Each revision gets its
own filename (`PositiveFeedback.mp4`, `_v2`, `_v3`, ...). Confirm the target filename before
rendering if it's ambiguous whether this is a new video or a revision of an existing one.

**Never touch git state, in any way, for any reason — not even a dry run.** No `git add` (not
even `-n`), no `git commit`, no `git push`, no `git restore`/`reset`. The user handles all git
state themselves, including staging. `git status`/`git diff`/`git log`/`git show` (pure
read-only, no index mutation) are fine for checking state.

**Always ask before making ANY change** — file edits, rendering a video, running a paid API
call. Describing a want, a problem, or an idea is not authorization to act on it. Ask
explicitly before writing code or investing real effort down a specific implementation path.
Purely read-only actions that answer a question directly from already-known context don't
need this gate.

**Within already-authorized work, only stop for destructive commands or commands operating
outside this project's own directory.** Once a task is authorized, don't re-ask permission for
each individual command needed to carry it out — run it. Stop and ask only when a specific
command would be destructive (deletes/overwrites data, force-pushes, etc.) or would
navigate/act outside this project's own directory tree.

**A diagnostic question vs. a design/intent question are different.** "Why is this failing" is
discoverable in code/logs/state — investigate it independently. "What should this look like /
what should this beat say" is not discoverable — it's a decision that exists only in the
user's head. When the answer isn't obviously mechanical (a typo, a missing import), pause and
ask what the intended design is rather than reasoning harder toward a confident-looking guess.

**Never call something "difficult," "expensive," or a "sunk cost," and never let effort factor
into a decision.** Evaluate purely on what's architecturally/creatively correct. If something
is genuinely low-priority, say so based on relevance/impact, not effort.

**Run voiceover-generation scripts with:**
```
node --env-file=.env --experimental-strip-types scripts/generate-voiceover-<name>.ts
```
Not `tsx`/`ts-node` — Node 22+ strips TypeScript natively and no such dependency exists in
this repo.

**Spot-check with `npx remotion still` before a full render.** At minimum: every beat
boundary, the payoff/reveal moment, and the widest camera framing with a caption visible (the
diagram/caption overlap check). A full render is expensive to redo over a bug a still would
have caught.

**Filesystem gotcha:** never name a data/constants file the same as a component file differing
only by case in the same directory (`world.ts` next to `World.tsx`) — TypeScript's
`forceConsistentCasingInFileNames` rejects this even on a case-sensitive filesystem. Use
`layout.ts` for the data file instead.

## CLAUDE.md

No agent edits this file on its own initiative. Propose wording in conversation; the user
applies it, or explicitly directs an edit.

## Where the rest lives

This file has the standing rules. Architecture, the two video formats, the pipeline, and
commands live in `README.md`. The full technical spec for the diagram-based format — visual
system, camera math, pacing, voice settings, script structure — lives in
`.claude/skills/leadership-visual-essay/SKILL.md`; read it before building one, don't rely on
memory of past sessions.

**Before writing any video code by hand, check `src/lib/` and `scripts/lib/` first.** They
hold every mechanical, non-creative piece of this pipeline (ElevenLabs API calls, word-timing
derivation, the camera transform, the safe-zone diagram wrapper, node rendering, connector
draw-on math, Hook/CTA/split-argument/list-row/caption/long-form scene primitives) — import
from there, don't re-derive or copy-paste from an existing video. `src/HowToBeUnderstood/` is
the current reference implementation, built against that library. This applies regardless of
how the opening prompt is worded — it's not something the user has to ask for each time.
