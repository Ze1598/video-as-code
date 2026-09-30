import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { generateVoiceover, type VoiceSettings, type WordTiming } from "./elevenlabs.ts";
import { addPausesToTiming, renderPausedAudio } from "../add-voiceover-pauses.ts";

export type NarrationSegment = { id: string; sentences: string[]; direction?: string };
export type EssayNarration = {
  modelId: "eleven_v4";
  voiceSettings: VoiceSettings;
  segments: NarrationSegment[];
  pausePlan: {
    internalSentenceMs: number;
    laterSceneLeadMs: number;
    sceneHoldMs: number;
    finalHoldMs: number;
    phrasingBpm: number;
  };
};

// Preserve the existing additional-silence policy; do not substitute native
// model pauses or a BPM target for these production insertions.
export const ESSAY_PAUSES = { laterBeatLeadMs: 500, internalSentenceMs: 250 };

export function buildEssayAudioRequest(narration: EssayNarration) {
  if (narration.modelId !== "eleven_v4") throw new Error("Essay narration requires eleven_v4");
  if (!narration.segments.length) throw new Error("Narration requires segments");
  const ids = new Set<string>();
  const pauses = narration.pausePlan;
  if (!pauses || [pauses.internalSentenceMs, pauses.laterSceneLeadMs, pauses.sceneHoldMs, pauses.finalHoldMs].some((ms) => !Number.isFinite(ms) || ms < 0) || !Number.isFinite(pauses.phrasingBpm) || pauses.phrasingBpm <= 0) {
    throw new Error("An explicit complete pause plan is required before generation, including scene and final holds");
  }
  const pauseTag = (ms: number) => ms > 0 ? `[pause for ${ms / 1000} seconds]` : "";
  const paragraphs = narration.segments.map((segment) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(segment.id)) throw new Error("Invalid segment id");
    if (ids.has(segment.id)) throw new Error(`Duplicate segment id: ${segment.id}`);
    ids.add(segment.id);
    if (!segment.sentences.length || segment.sentences.some((text) => !text.trim() || /[[\]<>]/.test(text))) {
      throw new Error("Each segment requires plain spoken sentences without tags");
    }
    if (segment.direction && /[[\]<>\n]/.test(segment.direction)) throw new Error("Invalid delivery direction");
    if (segment.sentences.some((text, index) => /[.?!]\s+\S/.test(text.trim()) || (index < segment.sentences.length - 1 && !/[.?!]$/.test(text.trim())))) {
      throw new Error("Use one complete sentence per entry, ending internal sentences with punctuation");
    }
    return `${segment.direction ? `[${segment.direction}] ` : ""}${segment.sentences.map((sentence) => sentence.trim()).join(` ${pauseTag(pauses.internalSentenceMs)} `).replace(/ +/g, " ")}`;
  });
  for (const value of Object.values(narration.voiceSettings)) {
    if (!Number.isFinite(value)) throw new Error("Invalid voice setting");
  }
  return {
    text: paragraphs.join(`\n\n${pauseTag(pauses.sceneHoldMs + pauses.laterSceneLeadMs)}\n\n`) + (pauses.finalHoldMs ? ` ${pauseTag(pauses.finalHoldMs)}` : ""),
    model_id: narration.modelId,
    voice_settings: { ...narration.voiceSettings },
  };
}

export async function generateEssayAudio(narration: EssayNarration, outDir: string): Promise<void> {
  const body = buildEssayAudioRequest(narration);
  if (existsSync(outDir)) throw new Error(`Output directory already exists: ${outDir}`);
  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) throw new Error("ElevenLabs credentials are required");
  mkdirSync(outDir, { recursive: true });
  // Store the exact request before the paid call; never serialize auth headers.
  const record = {
    createdAt: new Date().toISOString(),
    method: "POST",
    url: `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}/with-timestamps`,
    body, narration,
    pauseBudget: { ...narration.pausePlan, betweenScenesMs: narration.pausePlan.sceneHoldMs + narration.pausePlan.laterSceneLeadMs, playbackPaddingMs: 0 },
    status: "requested",
  };
  const recordPath = join(outDir, "request.json");
  writeFileSync(recordPath, JSON.stringify(record, null, 2));
  try {
    // One entry, one request for the full essay. No retries or chunk fallback.
    await generateVoiceover({ outDir, slides: [{ id: "narration", text: body.text }], modelId: narration.modelId, voiceSettings: narration.voiceSettings });
    record.status = "completed";
  } catch (error) {
    record.status = "failed";
    throw error;
  } finally {
    writeFileSync(recordPath, JSON.stringify(record, null, 2));
  }
}

function removeDirectionWords(words: WordTiming[]): WordTiming[] {
  let inTag = false;
  const spoken: WordTiming[] = [];
  for (const word of words) {
    if (word.text.startsWith("[")) {
      if (inTag) throw new Error("Malformed alignment tag");
      inTag = true;
    }
    if (inTag) {
      if (word.text.endsWith("]")) inTag = false;
      continue;
    }
    if (/[[\]]/.test(word.text)) throw new Error("Ambiguous alignment tag; review source audio");
    spoken.push(word);
  }
  if (inTag) throw new Error("Unclosed alignment tag");
  return spoken;
}

export function partitionNarration(narration: EssayNarration, rawWords: WordTiming[], durationMs: number) {
  buildEssayAudioRequest(narration);
  const words = removeDirectionWords(rawWords);
  if (!words.length || !Number.isFinite(durationMs) || durationMs <= 0) throw new Error("Invalid narration timing");
  for (const [index, word] of words.entries()) {
    if (!Number.isFinite(word.startMs) || !Number.isFinite(word.endMs) || word.startMs < 0 || word.endMs <= word.startMs || word.endMs > durationMs || (index > 0 && word.startMs < words[index - 1].endMs)) {
      throw new Error("Invalid or overlapping narration timing; review source alignment");
    }
  }
  const expected = narration.segments.flatMap((segment) => segment.sentences.join(" ").trim().split(/\s+/));
  if (expected.length !== words.length || expected.some((text, i) => text !== words[i].text)) {
    throw new Error("Returned spoken words do not match the approved script; do not guess boundaries");
  }
  let cursor = 0;
  let startMs = 0;
  return narration.segments.map((segment, index) => {
    const count = segment.sentences.join(" ").trim().split(/\s+/).length;
    const selected = words.slice(cursor, cursor + count);
    cursor += count;
    const endMs = index === narration.segments.length - 1 ? durationMs : selected[selected.length - 1].endMs;
    const result = {
      id: segment.id, text: segment.sentences.join(" "), startMs, endMs,
      words: selected.map((word) => ({ ...word, startMs: word.startMs - startMs, endMs: word.endMs - startMs })),
    };
    startMs = endMs;
    return result;
  });
}

/** Map visual scene boundaries onto the original uninterrupted recording.
 * Quantize absolute boundaries once, so rounding cannot accumulate by scene.
 * Optional holds consume native pause time; they never insert playback gaps.
 */
export function continuousNarrationTimeline(narration: EssayNarration, words: WordTiming[], durationMs: number, fps: number, sceneHoldMs = 0) {
  if (!Number.isInteger(fps) || fps <= 0 || !Number.isFinite(sceneHoldMs) || sceneHoldMs < 0) throw new Error("Invalid timeline settings");
  const segments = partitionNarration(narration, words, durationMs);
  const endFrames = segments.map((segment, index) => {
    const next = segments[index + 1];
    const nextWordStart = next ? next.startMs + next.words[0].startMs : durationMs;
    const endMs = next ? Math.min(segment.endMs + sceneHoldMs, nextWordStart) : durationMs;
    return next ? Math.min(Math.ceil(endMs * fps / 1000), Math.floor(nextWordStart * fps / 1000)) : Math.ceil(endMs * fps / 1000);
  });
  const beats = Object.fromEntries(segments.map((segment, index) => {
    const from = index === 0 ? 0 : endFrames[index - 1];
    const originMs = from * 1000 / fps;
    return [segment.id, {
      id: segment.id, from, durationFrames: endFrames[index] - from,
      durationMs: (endFrames[index] - from) * 1000 / fps,
      words: segment.words.map((word) => ({ ...word, startMs: Math.max(0, word.startMs + segment.startMs - originMs), endMs: word.endMs + segment.startMs - originMs })),
    }];
  }));
  return { fps, duration: endFrames[endFrames.length - 1], beats };
}

function run(command: string, args: string[]): string {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`);
  return result.stdout;
}

export function prepareEssayAudio(narration: EssayNarration, sourceAudio: string, sourceTiming: string, outDir: string, pauseMode: "preserve" | "model" = "preserve"): void {
  if (existsSync(outDir)) throw new Error(`Output directory already exists: ${outDir}`);
  const recordPath = join(dirname(sourceTiming), "request.json");
  if (existsSync(recordPath)) {
    const record = JSON.parse(readFileSync(recordPath, "utf8"));
    if (JSON.stringify(record.body) !== JSON.stringify(buildEssayAudioRequest(narration))) {
      throw new Error("Narration has changed since generation; restore the recorded request before preparation");
    }
  }
  const timing = JSON.parse(readFileSync(sourceTiming, "utf8")) as { words: WordTiming[] };
  const durationMs = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", sourceAudio])) * 1000;
  const segments = partitionNarration(narration, timing.words, durationMs);
  // A missing media tool must fail before creating an incomplete output directory.
  run("ffmpeg", ["-version"]);
  mkdirSync(outDir, { recursive: true });
  const scratch = mkdtempSync(join(tmpdir(), "essay-audio-split-"));
  try {
    for (const [index, segment] of segments.entries()) {
      const source = join(scratch, `${segment.id}.wav`);
      run("ffmpeg", ["-v", "error", "-i", sourceAudio, "-af", `atrim=start=${segment.startMs / 1000}:end=${segment.endMs / 1000},asetpts=PTS-STARTPTS`, "-c:a", "pcm_s16le", source]);
      const local = { text: segment.text, durationMs: segment.endMs - segment.startMs, words: segment.words };
      const leadMs = index === 0 || pauseMode === "model" ? 0 : ESSAY_PAUSES.laterBeatLeadMs;
      const sentenceMs = pauseMode === "model" ? 0 : ESSAY_PAUSES.internalSentenceMs;
      if (pauseMode === "model") {
        run("ffmpeg", ["-v", "error", "-i", source, "-c:a", "libmp3lame", "-q:a", "2", join(outDir, `${segment.id}.mp3`)]);
      } else {
        renderPausedAudio(source, join(outDir, `${segment.id}.mp3`), local, leadMs / 1000, sentenceMs / 1000);
      }
      writeFileSync(join(outDir, `${segment.id}.json`), JSON.stringify(addPausesToTiming(local, leadMs, sentenceMs), null, 2));
    }
    // Keep provenance out of the timing directory: build-timing-data reads every JSON.
    writeFileSync(join(outDir, "source-manifest.txt"), JSON.stringify({ sourceAudio, sourceTiming, narration, pauseMode, insertedPauses: pauseMode === "model" ? { laterBeatLeadMs: 0, internalSentenceMs: 0 } : ESSAY_PAUSES, segments }, null, 2));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
