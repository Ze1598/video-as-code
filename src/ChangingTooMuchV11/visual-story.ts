import type { Scene } from "../lib/essay-sdk/index.ts";
import type { Visual } from "../lib/essay-sdk/visuals.ts";

type Cue = (id: string, word: string, occurrence?: number) => number;
/** Editorial bindings only: all motion, geometry and drawing belong to the SDK. */
export function addVisualStory(scenes: Scene[], cue: Cue) {
  const get = (id: string) => scenes.find((s) => s.id === id)!;
  const assignVisual = (id: string, visual: Visual) =>
    Object.assign(get(id), {
      groups: [],
      items: [],
      topics: [],
      transfers: [],
      takeaways: [],
      visuals: [visual],
    });

  assignVisual("beat-04", {
    kind: "allocation",
    start: 0,
    end: get("beat-04").duration,
    lanes: [
      { id: "migration", label: "Cloud migration" },
      { id: "calendar", label: "Calendar changes" },
      { id: "reports", label: "Report preparation" },
    ],
    units: 6,
    initial: "migration",
    moves: [
      {
        units: [2, 3],
        to: "calendar",
        start: cue("beat-04", "calendars"),
        end: cue("beat-04", "calendars") + 54,
      },
      {
        units: [4, 5],
        to: "reports",
        start: cue("beat-04", "reports."),
        end: cue("beat-04", "reports.") + 54,
      },
    ],
    notes: [],
  });

  assignVisual("beat-05", {
    kind: "process",
    start: 0,
    end: get("beat-05").duration,
    stages: [
      { id: "problem", label: "Investigate", at: 0 },
      { id: "meeting", label: "Which meeting?", at: cue("beat-05", "But") },
      { id: "schedule", label: "When and where?", at: cue("beat-05", "when") },
      { id: "resolve", label: "Resolve", at: 0 },
    ],
    token: "Migration problem",
    initial: "problem",
    moves: [
      {
        to: "meeting",
        start: cue("beat-05", "But") + 30,
        end: cue("beat-05", "But") + 110,
      },
      {
        to: "schedule",
        start: cue("beat-05", "when") + 30,
        end: cue("beat-05", "when") + 110,
      },
    ],
    notes: [],
  });

  assignVisual("beat-06", {
    kind: "timeline",
    start: 0,
    end: get("beat-06").duration,
    plannedLabel: "Planned",
    actualLabel: "Actual",
    planned: 0.55,
    initial: 0.55,
    moves: [
      {
        start: cue("beat-06", "fell"),
        end: cue("beat-06", "fell") + 72,
        to: 0.9,
      },
    ],
    notes: [],
  });

  assignVisual("beat-08", {
    kind: "comparison",
    start: 0,
    end: get("beat-08").duration,
    left: "The idea",
    right: "The decision",
    rows: [
      {
        id: "promise",
        left: { text: "More productive meetings", at: 30 },
        right: {
          text: "Adopt another change now",
          at: cue("beat-08", "mistake"),
        },
      },
      {
        id: "capacity",
        left: { text: "Worth considering", at: cue("beat-08", "promise") },
        right: {
          text: "While absorbing a migration",
          at: cue("beat-08", "while"),
        },
      },
    ],
  });

  assignVisual("beat-09", {
    kind: "comparison",
    start: 0,
    end: get("beat-09").duration,
    left: "Chasing improvements",
    right: "Finish the chosen change",
    rows: [
      {
        id: "choose",
        left: { text: "Adopt another idea", at: 30 },
        right: {
          text: "Say no for now",
          at: cue("beat-09", "no"),
          promoted: true,
        },
      },
      {
        id: "attention",
        left: { text: "Split attention", at: cue("beat-09", "Work") },
        right: {
          text: "Work on your best idea",
          at: cue("beat-09", "Work"),
          promoted: true,
        },
      },
      {
        id: "quest",
        left: { text: "Add side quests", at: cue("beat-09", "Give") },
        right: {
          text: "Help finish the main quest",
          at: cue("beat-09", "Give"),
          promoted: true,
        },
      },
      {
        id: "lead",
        left: { text: "Become the bottleneck", at: cue("beat-09", "If") },
        right: {
          text: "Protect the team’s focus",
          at: cue("beat-09", "If"),
          promoted: true,
        },
      },
    ],
  });
}
