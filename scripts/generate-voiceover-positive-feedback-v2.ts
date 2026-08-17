import { mkdirSync, writeFileSync } from "fs";

const OUT_DIR = "public/voiceover/PositiveFeedbackV2";

const SLIDES = [
  {
    id: "beat-01",
    text: "In February, a data engineer built a validation system that caught data issues before they reached the client.",
  },
  {
    id: "beat-02",
    text: "Her manager praised the work, during a leadership call.",
  },
  {
    id: "beat-03",
    text: "But he never told her. He assumed she already knew.",
  },
  {
    id: "beat-04",
    text: "The months after: corrections, task assignments, deadline reminders. No one told her which parts of her work actually mattered. Meetings celebrated finished tickets, preventive work went unnoticed.",
  },
  {
    id: "beat-05",
    text: "So she asked her manager directly: was she focusing on the right things? You're doing fine. That gave her nothing to work with. She followed the only signals she could see.",
  },
  {
    id: "beat-06",
    text: "Ten months later, in her performance review, he brought up February, called it one of her strongest contributions. She'd waited ten months for something everyone else already knew.",
  },
  {
    id: "beat-07",
    text: "None of this makes him careless. Praising her work to leadership was the right call, the mistake was assuming that was the same as telling her.",
  },
  {
    id: "beat-08",
    text: "Positive feedback isn't just praise. It's reinforcement, it says: this worked, this mattered, do it again. Without it, people start guessing, and optimizing for whatever gets noticed instead.",
  },
  {
    id: "beat-09",
    text: "If it's worth mentioning at the performance review, it's worth mentioning when it happens.",
  },
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
