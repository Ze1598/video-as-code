import { BEATS } from "../ChangingTooMuchV2/data.ts";
import {
  compileEssay,
  type Scene,
  type Group,
  type Item,
} from "../lib/essay-sdk/index.ts";

import { addVisualStory } from "./visual-story.ts";

const fps = 60;
const head: Group = { id: "head", label: "Department Head", members: 1 };
const team: Group = { id: "team", label: "Engineering Team", members: 3 };
const migration: Item = {
  id: "migration",
  label: "Cloud Migration",
  kind: "work",
  owner: "team",
};
const bugs: Item = {
  id: "bugs",
  label: "Cloud Provider Bugs",
  kind: "issue",
  owner: "team",
};
const meetings: Item = {
  id: "meetings",
  label: "Meeting Restructure",
  kind: "process",
  owner: "team",
};
const cue = (id: string, word: string, occurrence = 0) => {
  const match = BEATS[id].words.filter((w) => w.text === word)[occurrence];
  if (!match) throw new Error(`Missing cue ${id}: ${word}`);
  return Math.round((match.startMs * fps) / 1000);
};
const scenes: Scene[] = Object.values(BEATS)
  .filter((beat) => beat.id !== "beat-07")
  .map((beat) => {
    const words = beat.id === "beat-00" ? beat.words.slice(0, 17) : beat.words;
    const audioDuration = Math.ceil(
      (words[words.length - 1].endMs * fps) / 1000,
    );
    return {
      id: beat.id,
      duration: audioDuration + (beat.id === "beat-00" ? 30 : 90),
      narration: words,
      audio: {
        src: `voiceover/ChangingTooMuchV2/${beat.id}.mp3`,
        duration: audioDuration,
      },
      groups: [],
      items: [],
      transfers: [],
      topics: [],
      takeaways: [],
      textMotion: "rise",
    };
  });
const scene = (id: string) => scenes.find((s) => s.id === id)!;

// Existing responsibility: the leader/team relationship, then the team's work.
Object.assign(scene("beat-01"), {
  groups: [head, team],
  items: [migration, bugs],
});
scene("beat-01").relationships = [
  { from: "head", to: "team", start: 30, end: scene("beat-01").duration },
];
scene("beat-01").topics = [
  {
    group: "team",
    item: "migration",
    start: cue("beat-01", "cloud"),
    end: cue("beat-01", "surprise"),
  },
  {
    group: "team",
    item: "bugs",
    start: cue("beat-01", "surprise"),
    end: scene("beat-01").duration,
  },
];

// Preserve both existing rows. The new assignment physically arrives below them.
Object.assign(scene("beat-02"), {
  groups: [head, team],
  items: [migration, bugs, { ...meetings, owner: "head" }],
});
scene("beat-02").relationships = [
  { from: "head", to: "team", start: 0, end: scene("beat-02").duration },
];
scene("beat-02").transfers = [
  {
    item: "meetings",
    to: "team",
    start: cue("beat-02", "asked"),
    end: cue("beat-02", "rebuild") + 60,
  },
];

scene("beat-02").topics = [
  {
    group: "head",
    item: "meetings",
    start: 0,
    end: scene("beat-02").duration,
  },
];

// Reframe to the team's perspective during the half-second audio lead-in.
// The order is unchanged; topic cues move instead of swapping the work rows.
for (const id of ["beat-03"]) {
  Object.assign(scene(id), {
    groups: [team],
    items: [migration, bugs, meetings],
  });
}
scene("beat-03").transition = "reflow";
// A different explanatory screen, not another arrangement of work icons.
scene("beat-03").items = [
  {
    id: "which",
    label: "Which meeting?",
    kind: "question",
    owner: "team",
    revealAt: cue("beat-03", "Which"),
  },
  {
    id: "report",
    label: "What goes in the report?",
    kind: "question",
    owner: "team",
    revealAt: cue("beat-03", "What"),
  },
  {
    id: "decision",
    label: "When is the decision made?",
    kind: "question",
    owner: "team",
    revealAt: cue("beat-03", "Did"),
  },
];
scene("beat-03").topics = [
  {
    group: "team",
    item: "which",
    start: cue("beat-03", "Which"),
    end: cue("beat-03", "What"),
  },
  {
    group: "team",
    item: "report",
    start: cue("beat-03", "What"),
    end: cue("beat-03", "Did"),
  },
  {
    group: "team",
    item: "decision",
    start: cue("beat-03", "Did"),
    end: scene("beat-03").duration,
  },
];
scene("beat-10").takeaways = [
  { text: true, start: 0, end: scene("beat-10").duration },
];
scene("beat-10").textStyle = "italic";

addVisualStory(scenes, cue);

export const movie = compileEssay({ fps, scenes });
// Exact spoken script, derived from the same approved timing data as playback.
export const script = scenes.map((s) => ({
  id: s.id,
  text: s.narration.map((w) => w.text).join(" "),
}));
