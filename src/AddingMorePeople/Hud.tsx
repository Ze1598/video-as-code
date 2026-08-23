import { BEATS } from "./data.ts";
import { BEAT_ORDER, FPS, TIMELINE } from "./timeline.ts";
import { HIGHLIGHTS } from "./layout.ts";
import { Caption as SharedCaption } from "../lib/scenes/Caption.tsx";

// Beat 0 (Hook), Beat 4 (list scene), Beat 8 (right-call/mistake split),
// Beat 9 (LongFormScene, pure reflective narration) and Beat 10 (CTA) all
// render their own dedicated full-screen scenes (see index.tsx) instead of
// this generic caption.
const CAPTIONED_BEATS = new Set(["beat-01", "beat-02", "beat-03", "beat-05", "beat-06", "beat-07"]);

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
