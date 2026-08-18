import { mkdirSync, writeFileSync } from "fs";

export type Slide = { id: string; text: string };

export type WordTiming = { text: string; startMs: number; endMs: number };

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

type WithTimestampsResponse = {
  audio_base64: string;
  alignment: Alignment;
  normalized_alignment: Alignment;
};

export type VoiceSettings = {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
};

// Validated for this format's narration (see leadership-visual-essay SKILL.md
// "Voice settings"): stability 0.35 gives natural prosodic variation instead
// of a flat/monotone read, style 0.45 leans into the voice's own
// expressiveness, speed 0.92 reads as measured rather than rushed.
export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.35,
  similarity_boost: 0.75,
  style: 0.45,
  speed: 0.92,
};

// eleven_multilingual_v2, not eleven_v3: v3 is a preview feature and was
// found, on direct listening after a full-script regeneration, to measurably
// degrade voice fidelity/character compared to v2 — confirmed directly on
// this voice, not a guess. Don't switch models without re-verifying fidelity,
// not just whether a feature (e.g. <break> tag pause support) works.
export const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

function deriveWordTimings(alignment: Alignment): WordTiming[] {
  const words: WordTiming[] = [];
  let current: WordTiming | null = null;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    if (/\s/.test(char)) {
      current = null;
      continue;
    }

    const startMs = alignment.character_start_times_seconds[i] * 1000;
    const endMs = alignment.character_end_times_seconds[i] * 1000;

    if (current === null) {
      current = { text: char, startMs, endMs };
      words.push(current);
    } else {
      current.text += char;
      current.endMs = endMs;
    }
  }

  return words;
}

export type GenerateVoiceoverOptions = {
  outDir: string;
  slides: Slide[];
  voiceSettings?: VoiceSettings;
  modelId?: string;
};

// One ElevenLabs `with-timestamps` call per slide (a beat's script can be a
// full paragraph — never split per sentence, see the skill's audio pipeline
// section), writing `<outDir>/<slide.id>.mp3` and `.json` (real word-level
// timings, never hand-transcribed). Shared across every video's
// generate-voiceover-<name>.ts so the ElevenLabs call shape, env var checks,
// and word-timing derivation live in exactly one place.
export async function generateVoiceover({
  outDir,
  slides,
  voiceSettings = DEFAULT_VOICE_SETTINGS,
  modelId = DEFAULT_MODEL_ID,
}: GenerateVoiceoverOptions): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!voiceId) {
    throw new Error("ELEVENLABS_VOICE_ID is not set");
  }

  mkdirSync(outDir, { recursive: true });

  for (const slide of slides) {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: slide.text,
          model_id: modelId,
          voice_settings: voiceSettings,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `ElevenLabs request failed for ${slide.id}: ${response.status} ${errorBody}`,
      );
    }

    const data = (await response.json()) as WithTimestampsResponse;

    const audioBuffer = Buffer.from(data.audio_base64, "base64");
    const audioPath = `${outDir}/${slide.id}.mp3`;
    writeFileSync(audioPath, audioBuffer);

    const words = deriveWordTimings(data.alignment);
    const durationMs = words.length > 0 ? words[words.length - 1].endMs : 0;
    const timingPath = `${outDir}/${slide.id}.json`;
    writeFileSync(
      timingPath,
      JSON.stringify({ text: slide.text, durationMs, words }, null, 2),
    );

    console.log(
      `Wrote ${audioPath} (${audioBuffer.byteLength} bytes) and ${timingPath} ` +
        `(${words.length} words, ${durationMs.toFixed(0)}ms)`,
    );
  }
}
