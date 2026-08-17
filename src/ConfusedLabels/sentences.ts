import type { WordTiming } from "./data";

export type Sentence = { words: WordTiming[]; text: string; startMs: number; endMs: number };

// Splits a beat's real word list into sentences at real sentence-ending
// punctuation. This exists so on-screen text is always DERIVED from the
// actual ElevenLabs words — never a separately hand-typed caption that can
// silently drift from what's spoken (e.g. dropping "performance" from
// "performance review").
export function splitSentences(words: WordTiming[]): Sentence[] {
  const sentences: Sentence[] = [];
  let current: WordTiming[] = [];

  for (const word of words) {
    current.push(word);
    if (/[.?!]$/.test(word.text)) {
      sentences.push(toSentence(current));
      current = [];
    }
  }
  if (current.length > 0) {
    sentences.push(toSentence(current));
  }

  return sentences;
}

function toSentence(words: WordTiming[]): Sentence {
  return {
    words,
    text: words.map((w) => w.text).join(" "),
    startMs: words[0].startMs,
    endMs: words[words.length - 1].endMs,
  };
}

export function wordsToText(words: WordTiming[]): string {
  return words.map((w) => w.text).join(" ");
}
