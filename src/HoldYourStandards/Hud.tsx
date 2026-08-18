import { BEATS } from "./data.ts";
import { BEAT_ORDER, FPS, TIMELINE } from "./timeline.ts";
import { HIGHLIGHTS } from "./layout.ts";
import { Caption as SharedCaption } from "../lib/scenes/Caption.tsx";

// Beat 0 (Hook), Beat 3 (list scene), Beat 7 (quote), Beat 9 (second list),
// Beat 10 (split), Beats 11-12 (pure reflective narration, LongFormScene)
// and Beat 13 (CTA) all render their own dedicated full-screen scenes (see
// index.tsx) instead of this generic caption.
const CAPTIONED_BEATS = new Set(["beat-01", "beat-02", "beat-04", "beat-05", "beat-06", "beat-08"]);

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
