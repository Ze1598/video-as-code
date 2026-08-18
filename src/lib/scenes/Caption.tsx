import { useCurrentFrame } from "remotion";
import type { Beat, TimelineEntry } from "../timeline";
import { ACCENT, DIM_TEXT, FONT } from "../palette";
import { DEFAULT_CAPTION_TOP } from "../diagram/DiagramFrame";
import { HighlightedText, sentenceCycle } from "./useSentenceCycle";

export type CaptionProps = {
  beats: Record<string, Beat>;
  timeline: Record<string, TimelineEntry>;
  beatOrder: string[];
  fps: number;
  /** Beats that render this generic caption. Beats with a dedicated scene
   * (Hook, CTA, list, split-argument, LongFormScene, ...) should NOT be in
   * this set — see the skill's "Match technique to content". */
  captionedBeats: Set<string>;
  highlights?: Record<string, string>;
  captionTop?: number;
};

function currentBeatId(beatOrder: string[], timeline: Record<string, TimelineEntry>, frame: number): string | null {
  for (const id of beatOrder) {
    const t = timeline[id];
    if (frame >= t.from && frame < t.from + t.duration) return id;
  }
  return null;
}

// Screen-space caption: one real sentence at a time, timed to its own real
// word timestamps. Exactly one phrase per beat (when configured via
// `highlights`) gets accent emphasis; everything else stays dim. Render
// this once, unsequenced, at the composition root — it looks up the active
// beat from the global frame itself.
export const Caption: React.FC<CaptionProps> = ({
  beats,
  timeline,
  beatOrder,
  fps,
  captionedBeats,
  highlights = {},
  captionTop = DEFAULT_CAPTION_TOP,
}) => {
  const frame = useCurrentFrame();
  const beatId = currentBeatId(beatOrder, timeline, frame);
  if (!beatId || !captionedBeats.has(beatId)) return null;

  const t = timeline[beatId];
  const local = frame - t.from;
  const highlight = highlights[beatId];
  const result = sentenceCycle(beats[beatId].words, local, t.duration, fps, highlight);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: captionTop,
        display: "flex",
        justifyContent: "center",
        padding: "0 220px",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 34,
          lineHeight: 1.5,
          textAlign: "center",
          color: DIM_TEXT,
          opacity: result.opacity,
        }}
      >
        <HighlightedText result={result} highlight={highlight} accentColor={ACCENT} />
      </div>
    </div>
  );
};
