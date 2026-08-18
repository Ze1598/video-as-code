import { generateVoiceover } from "./lib/elevenlabs.ts";

// The ONE deterministic voiceover-generation script — replaces one
// hand-written scripts/generate-voiceover-<name>.ts per video (a script
// that varied per project) with a single script that takes a video name
// and reads its beat list from that video's own data (src/<VideoName>/
// script.ts's SLIDES export). What varies per video is data, not code.
//
// Run with:
//   node --env-file=.env --experimental-strip-types scripts/generate-voiceover.ts <VideoName>

const videoName = process.argv[2];
if (!videoName) {
  throw new Error("Usage: generate-voiceover.ts <VideoName>");
}

const { SLIDES } = await import(`../src/${videoName}/script.ts`);

await generateVoiceover({ outDir: `public/voiceover/${videoName}`, slides: SLIDES });
