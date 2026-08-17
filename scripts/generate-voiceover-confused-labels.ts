import { mkdirSync, writeFileSync } from "fs";

const OUT_DIR = "public/voiceover/ConfusedLabels";

const SLIDES = [
  {
    id: "beat-00",
    text: "Somewhere along the way, this team stopped building one project, and started building four. Nobody decided that. It just happened.",
  },
  {
    id: "beat-01",
    text: "It started simply. A product team needed a new customer reporting capability. The architect called it a module inside the existing application. The product manager called it a platform other departments could eventually use. The delivery manager called it a component required for the current project. The engineers just called it the new reporting thing.",
  },
  {
    id: "beat-02",
    text: "Nobody stopped the conversation. Everyone understood the problem well enough, and debating terminology felt like a waste of time. They had requirements to gather, estimates to give, and a deadline already approaching.",
  },
  {
    id: "beat-03",
    text: "So they kept talking.",
  },
  {
    id: "beat-04",
    text: "Slowly, each of them started building on their own definition. The architect proposed reusing the application's existing permissions, a module should inherit the system around it. The product manager requested separate user management, a platform should support multiple products. Delivery estimated the work as one part of the current implementation. And engineering started asking whether it needed its own deployment pipeline.",
  },
  {
    id: "beat-05",
    text: "The project moved forward, until those doubts could no longer coexist. Nobody had changed the project halfway through. They'd started with four different projects, and used the same meetings to discuss all of them.",
  },
  {
    id: "beat-06",
    text: "The warning had been there in every conversation. Calling it a module, a platform, or a component gave each person enough certainty to keep talking, without ever resolving what the thing included, who would use it, who would own it, or whether it could exist on its own.",
  },
  {
    id: "beat-07",
    text: "This is not the usual problem of someone throwing around jargon to sound smart. It's what happens when people are lost, but still need the conversation to continue. If two people use different words but make the same decisions, the vocabulary doesn't matter. The problem begins when the names generate different understandings, and different outcomes.",
  },
  {
    id: "beat-08",
    text: "When competent people repeatedly use different names for the same new thing, don't assume they disagree about vocabulary, check whether they're talking about different things.",
  },
  {
    id: "beat-09",
    text: "When that happens, stop the conversation and define the object before discussing the work. What does it include? What does it exclude? Who uses it? Who owns it? Does it live inside an existing system, or stand on its own? Then give it one provisional name, and use it consistently.",
  },
  {
    id: "beat-10",
    text: "The name doesn't need to be perfect, but the shared definition does.",
  },
  {
    id: "beat-11",
    text: "Have you ever been months into a project, before realizing you and your team were never actually describing the same thing?",
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
          stability: 0.35,
          similarity_boost: 0.75,
          style: 0.45,
          speed: 0.92,
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
