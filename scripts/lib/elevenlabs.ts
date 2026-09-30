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

// Existing voice settings retained as a starting point. V4 tone is reviewed
// through the manual listening case; speed 0.92 is not a 92 BPM control.
export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.35,
  similarity_boost: 0.75,
  style: 0.45,
  speed: 0.92,
};

export const DEFAULT_MODEL_ID = "eleven_v4";

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

// Low-level request helper: one call per supplied entry. New essay production
// passes ONE complete narration entry through essay-audio.ts. Multiple entries
// remain available for manual comparisons and explicitly selected legacy runs.
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
