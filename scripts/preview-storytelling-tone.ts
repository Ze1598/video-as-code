import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { generateVoiceover, DEFAULT_VOICE_SETTINGS } from "./lib/elevenlabs.ts";

// Manual listening experiment; two paid calls. Run only with user approval.
// No automated tone verdict or change to production voice settings.
const opening = "On Monday morning, the team arrived with a plan. By lunchtime, everything had changed.";
const middle = "One engineer asked a simple question. What if we finished the work already in front of us?";
const ending = "The room went quiet. Then someone closed their laptop and listened. That was where the change began.";
const samples = [
  { id: "baseline", text: `${opening}\n\n${middle}\n\n${ending}` },
  {
    id: "storytelling",
    text: `[Warm, conversational voice, measured delivery] ${opening}\n\n[short pause] [Thoughtful, gently curious] ${middle}\n\n[short pause] [Softening, reflective] ${ending}`,
  },
];

const root = resolve("out/voice-tone");
mkdirSync(root, { recursive: true });
const outDir = mkdtempSync(join(root, "manual-"));
writeFileSync(join(outDir, "request.json"), JSON.stringify({
  modelId: "eleven_v4",
  voiceSettings: DEFAULT_VOICE_SETTINGS,
  samples,
  status: "awaiting-manual-listening",
  phrasingReference: { bpm: 92, beatMs: 60000 / 92, note: "Listening reference, not words per minute or a guaranteed API timing control. Evaluate natural phrasing before adding precise timing adjustments." },
  guidance: "https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices#prompting-eleven-v4",
  listeningQuestions: [
    "Does the directed sample feel calmer without becoming flat?",
    "Does the question invite curiosity, and does the ending feel reflective?",
    "Is the cloned voice still natural and recognizable?",
    "Are any delivery directions spoken aloud, or are there unwanted sounds?",
  ],
}, null, 2));
console.log(`Manual comparison: ${outDir}`);
await generateVoiceover({ outDir, slides: samples, modelId: "eleven_v4" });
