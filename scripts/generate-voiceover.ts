import { generateVoiceover } from "./lib/elevenlabs.ts";
import { buildEssayAudioRequest, generateEssayAudio, prepareEssayAudio, type EssayNarration } from "./lib/essay-audio.ts";

// New essays keep their reviewed request code in src/<VideoName>/audio.ts.
// --preview is free; --prepare is offline. Generation is one paid request.
// Existing per-beat scripts are available only through --legacy-beats.

const videoName = process.argv[2];
const mode = process.argv[3];
if (!videoName || !/^[a-zA-Z0-9_-]+$/.test(videoName) || (mode && !["--preview", "--prepare", "--prepare-native", "--legacy-beats"].includes(mode))) {
  throw new Error("Usage: generate-voiceover.ts <VideoName> [--preview|--prepare|--prepare-native|--legacy-beats]");
}

if (mode === "--legacy-beats") {
  const { SLIDES } = await import(`../src/${videoName}/script.ts`);
  await generateVoiceover({ outDir: `public/voiceover/${videoName}`, slides: SLIDES });
} else {
  const { NARRATION } = await import(`../src/${videoName}/audio.ts`) as { NARRATION: EssayNarration };
  if (mode === "--preview") {
    console.log(JSON.stringify(buildEssayAudioRequest(NARRATION), null, 2));
  } else if (mode === "--prepare" || mode === "--prepare-native") {
    prepareEssayAudio(NARRATION, `public/voiceover/${videoName}-raw/narration.mp3`, `public/voiceover/${videoName}-raw/narration.json`, `public/voiceover/${videoName}`, mode === "--prepare-native" ? "model" : "preserve");
  } else {
    await generateEssayAudio(NARRATION, `public/voiceover/${videoName}-raw`);
  }
}
