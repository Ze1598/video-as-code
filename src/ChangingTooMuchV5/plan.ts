import { BEATS } from '../ChangingTooMuchV2/data.ts';
import { compileEssay, type Scene, type Group, type Item } from '../lib/essay-sdk/index.ts';

const fps = 60;
const head: Group = { id: 'head', label: 'Department Head', members: 1 };
const team: Group = { id: 'team', label: 'Engineering Team', members: 3 };
const migration: Item = { id: 'migration', label: 'Cloud Migration', kind: 'work', owner: 'team' };
const bugs: Item = { id: 'bugs', label: 'Cloud Provider Bugs', kind: 'issue', owner: 'team' };
const meetings: Item = { id: 'meetings', label: 'Meeting Restructure', kind: 'process', owner: 'team' };
const cue = (id: string, word: string, occurrence = 0) => {
  const match = BEATS[id].words.filter(w => w.text === word)[occurrence];
  if (!match) throw new Error(`Missing cue ${id}: ${word}`);
  return Math.round(match.startMs * fps / 1000);
};
const scenes: Scene[] = Object.values(BEATS).map(beat => {
  const words = beat.id === 'beat-00' ? beat.words.slice(0, 17) : beat.words;
  const audioDuration = Math.ceil(words[words.length - 1].endMs * fps / 1000);
  const hold = beat.id === 'beat-00' ? 30 : 90;
  return {
    id: beat.id, duration: audioDuration + hold, narration: words,
    audio: { src: `voiceover/ChangingTooMuchV2/${beat.id}.mp3`, duration: audioDuration },
    groups: [], items: [], transfers: [], topics: [], takeaways: [],
  };
});
const scene = (id: string) => scenes.find(s => s.id === id)!;

// Scene 1: establish the existing responsibility and work beneath the team.
Object.assign(scene('beat-01'), { groups: [head, team], items: [migration, bugs] });
scene('beat-01').topics = [
  { group: 'team', item: 'migration', start: cue('beat-01', 'cloud'), end: cue('beat-01', 'surprise') },
  { group: 'team', item: 'bugs', start: cue('beat-01', 'surprise'), end: scene('beat-01').duration },
];

// Scene 2: physically assign the additional work; existing migration stays put.
Object.assign(scene('beat-02'), { groups: [head, team], items: [migration, { ...meetings, owner: 'head' }] });
const transferStart = cue('beat-02', 'asked');
const transferEnd = cue('beat-02', 'rebuild') + 60;
scene('beat-02').transfers = [{ item: 'meetings', to: 'team', start: transferStart, end: transferEnd }];

// Scenes 3–7: replace the handoff composition with the team's competing demands.
for (const id of ['beat-03', 'beat-04', 'beat-05', 'beat-06', 'beat-07']) {
  Object.assign(scene(id), { groups: [team], items: [migration, bugs, meetings] });
}
for (const id of ['beat-03', 'beat-04']) {
  scene(id).topics = [{ group: 'team', item: 'meetings', start: 30, end: scene(id).duration }];
}
scene('beat-05').topics = [
  { group: 'team', item: 'bugs', start: 30, end: cue('beat-05', 'But') },
  { group: 'team', item: 'meetings', start: cue('beat-05', 'But'), end: cue('beat-05', 'The', 1) },
  { group: 'team', item: 'migration', start: cue('beat-05', 'The', 1), end: scene('beat-05').duration },
];
scene('beat-06').topics = [{ group: 'team', item: 'migration', start: 30, end: scene('beat-06').duration }];
scene('beat-07').topics = [
  { group: 'team', item: 'migration', start: cue('beat-07', 'The'), end: cue('beat-07', 'The', 1) },
  { group: 'team', item: 'meetings', start: cue('beat-07', 'The', 1), end: scene('beat-07').duration },
];
// Dedicated takeaway text enters with its retained phrase already gold.
scene('beat-09').takeaways = [{ phrase: 'main quest', start: 0, end: scene('beat-09').duration }];

export const movie = compileEssay({ fps, scenes });
