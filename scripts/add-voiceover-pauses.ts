import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { spawnSync } from "child_process";
import { pathToFileURL } from "url";

type WordTiming = { text: string; startMs: number; endMs: number };
type TimingFile = { text: string; durationMs: number; words: WordTiming[] };

export function sentenceBoundaryIndexes(words: WordTiming[]): number[] {
  return words
    .map((word, index) => ({ word, index }))
    .filter(({ word, index }) => index < words.length - 1 && /[.?!]$/.test(word.text))
    .map(({ index }) => index);
}

export function addPausesToTiming(
  timing: TimingFile,
  leadMs: number,
  sentencePauseMs: number,
): TimingFile {
  const boundaries = new Set(sentenceBoundaryIndexes(timing.words));
  let accumulatedPauseMs = leadMs;
  const words = timing.words.map((word, index) => {
    const shifted = {
      text: word.text,
      startMs: word.startMs + accumulatedPauseMs,
      endMs: word.endMs + accumulatedPauseMs,
    };
    if (boundaries.has(index)) accumulatedPauseMs += sentencePauseMs;
    return shifted;
  });

  return {
    text: timing.text,
    durationMs: timing.durationMs + accumulatedPauseMs,
    words,
  };
}

function audioFormat(path: string): { sampleRate: number; channelLayout: string } {
  const result = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_entries",
      "stream=sample_rate,channels,channel_layout",
      "-of",
      "json",
      path,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(result.stderr || `ffprobe failed for ${path}`);
  const stream = JSON.parse(result.stdout).streams?.[0];
  if (!stream) throw new Error(`No audio stream found in ${path}`);
  const channelLayout = stream.channel_layout || (stream.channels === 1 ? "mono" : "stereo");
  return { sampleRate: Number(stream.sample_rate), channelLayout };
}

function renderPausedAudio(
  sourcePath: string,
  targetPath: string,
  timing: TimingFile,
  leadSeconds: number,
  sentencePauseSeconds: number,
): void {
  const boundaries = sentenceBoundaryIndexes(timing.words);
  const cutSeconds = boundaries.map((index) => timing.words[index].endMs / 1000);
  const { sampleRate, channelLayout } = audioFormat(sourcePath);
  const segmentCount = cutSeconds.length + 1;
  const filters: string[] = [];
  const segmentInputs = Array.from({ length: segmentCount }, (_, index) => `[src${index}]`).join("");

  if (segmentCount > 1) {
    filters.push(`[0:a]asplit=${segmentCount}${segmentInputs}`);
  }

  const parts: string[] = [];
  if (leadSeconds > 0) {
    filters.push(`anullsrc=r=${sampleRate}:cl=${channelLayout}:d=${leadSeconds}[lead]`);
    parts.push("[lead]");
  }

  for (let index = 0; index < segmentCount; index++) {
    const sourceLabel = segmentCount > 1 ? `[src${index}]` : "[0:a]";
    const start = index === 0 ? 0 : cutSeconds[index - 1];
    const end = index < cutSeconds.length ? `:end=${cutSeconds[index]}` : "";
    filters.push(`${sourceLabel}atrim=start=${start}${end},asetpts=PTS-STARTPTS[a${index}]`);
    parts.push(`[a${index}]`);

    if (index < cutSeconds.length) {
      filters.push(
        `anullsrc=r=${sampleRate}:cl=${channelLayout}:d=${sentencePauseSeconds}[pause${index}]`,
      );
      parts.push(`[pause${index}]`);
    }
  }

  filters.push(`${parts.join("")}concat=n=${parts.length}:v=0:a=1[out]`);
  const result = spawnSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      sourcePath,
      "-filter_complex",
      filters.join(";"),
      "-map",
      "[out]",
      "-c:a",
      "libmp3lame",
      "-q:a",
      "2",
      targetPath,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(result.stderr || `ffmpeg failed for ${sourcePath}`);
}

export function addVoiceoverPauses(
  sourceName: string,
  targetName: string,
  leadSeconds = 0.5,
  sentencePauseSeconds = 0.25,
): void {
  const sourceDir = `public/voiceover/${sourceName}`;
  const targetDir = `public/voiceover/${targetName}`;
  if (!existsSync(sourceDir)) throw new Error(`Source voiceover directory does not exist: ${sourceDir}`);
  if (existsSync(targetDir)) throw new Error(`Target voiceover directory already exists: ${targetDir}`);

  const jsonFiles = readdirSync(sourceDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
  if (jsonFiles.length === 0) throw new Error(`No timing JSON files found in ${sourceDir}`);

  mkdirSync(targetDir, { recursive: true });
  for (let index = 0; index < jsonFiles.length; index++) {
    const jsonFile = jsonFiles[index];
    const beatId = jsonFile.replace(/\.json$/, "");
    const sourceAudio = `${sourceDir}/${beatId}.mp3`;
    const targetAudio = `${targetDir}/${beatId}.mp3`;
    const timing = JSON.parse(readFileSync(`${sourceDir}/${jsonFile}`, "utf8")) as TimingFile;
    const lead = index === 0 ? 0 : leadSeconds;

    renderPausedAudio(sourceAudio, targetAudio, timing, lead, sentencePauseSeconds);
    const shifted = addPausesToTiming(timing, lead * 1000, sentencePauseSeconds * 1000);
    writeFileSync(`${targetDir}/${jsonFile}`, JSON.stringify(shifted, null, 2));
    console.log(
      `Wrote ${targetAudio} and ${targetDir}/${jsonFile} ` +
        `(lead ${lead.toFixed(2)}s, ${sentenceBoundaryIndexes(timing.words).length} sentence pauses)`,
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sourceName = process.argv[2];
  const targetName = process.argv[3];
  if (!sourceName || !targetName) {
    throw new Error(
      "Usage: add-voiceover-pauses.ts <SourceVideoName> <TargetVideoName> [leadSeconds] [sentencePauseSeconds]",
    );
  }
  addVoiceoverPauses(
    sourceName,
    targetName,
    Number(process.argv[4] ?? 0.5),
    Number(process.argv[5] ?? 0.25),
  );
}
