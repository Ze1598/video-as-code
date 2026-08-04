import { mkdirSync, writeFileSync } from "fs";

const OUT_DIR = "public/voiceover/CompetenceMovementVertical";

const SLIDES = [
  { id: "slide-01", text: "Competence creates potential." },
  { id: "slide-02", text: "Influence creates movement." },
  { id: "slide-03", text: "Consistency creates momentum." },
  { id: "slide-04", text: "Clarity creates confidence." },
  { id: "slide-05", text: "Ideas only matter when they change something." },
];

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

type WordTiming = { text: string; startMs: number; endMs: number };

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

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  throw new Error("ELEVENLABS_API_KEY is not set");
}

const voiceId = process.env.ELEVENLABS_VOICE_ID;
if (!voiceId) {
  throw new Error("ELEVENLABS_VOICE_ID is not set");
}

mkdirSync(OUT_DIR, { recursive: true });

for (const slide of SLIDES) {
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
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
        },
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
  const audioPath = `${OUT_DIR}/${slide.id}.mp3`;
  writeFileSync(audioPath, audioBuffer);

  const words = deriveWordTimings(data.alignment);
  const durationMs = words.length > 0 ? words[words.length - 1].endMs : 0;
  const timingPath = `${OUT_DIR}/${slide.id}.json`;
  writeFileSync(
    timingPath,
    JSON.stringify({ text: slide.text, durationMs, words }, null, 2),
  );

  console.log(
    `Wrote ${audioPath} (${audioBuffer.byteLength} bytes) and ${timingPath} ` +
      `(${words.length} words, ${durationMs.toFixed(0)}ms)`,
  );
}
