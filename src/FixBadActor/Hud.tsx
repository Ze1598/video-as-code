import { BEATS } from "./data.ts";
import { BEAT_ORDER, FPS, TIMELINE } from "./timeline.ts";
import { HIGHLIGHTS } from "./layout.ts";
import { Caption as SharedCaption } from "../lib/scenes/Caption.tsx";

// Beat 0 (Hook), Beat 5 (quote), Beats 9-11 (reflective LongFormScene),
// Beat 12 (list), Beat 13 (split) and Beat 15 (CTA) all render their own
// dedicated full-screen scenes (see index.tsx) instead of this generic
// caption.
const CAPTIONED_BEATS = new Set(["beat-01", "beat-02", "beat-03", "beat-04", "beat-06", "beat-07", "beat-08"]);

export const Caption: React.FC = () => (
  <SharedCaption
    beats={BEATS}
    timeline={TIMELINE}
    beatOrder={BEAT_ORDER}
    fps={FPS}
    captionedBeats={CAPTIONED_BEATS}
    highlights={HIGHLIGHTS}
  />
);
