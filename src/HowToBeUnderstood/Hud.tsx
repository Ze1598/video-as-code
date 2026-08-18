import { BEATS } from "./data";
import { BEAT_ORDER, FPS, TIMELINE } from "./timeline";
import { HIGHLIGHTS } from "./layout";
import { Caption as SharedCaption } from "../lib/scenes/Caption";

// Beat 0 (Hook), Beat 5 (list scene), Beat 7 (right-call/mistake split),
// Beats 8-9 (pure reflective narration, LongFormScene) and Beat 10 (CTA)
// all render their own dedicated full-screen scenes (see index.tsx) instead
// of this generic caption.
const CAPTIONED_BEATS = new Set(["beat-01", "beat-02", "beat-03", "beat-04", "beat-06"]);

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
