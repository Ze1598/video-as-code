import { BEATS } from "./data.ts";
import { BEAT_ORDER, FPS, TIMELINE } from "./timeline.ts";
import { HIGHLIGHTS } from "./layout.ts";
import { Caption as SharedCaption } from "../lib/scenes/Caption.tsx";

// Beat 0 (Hook), Beat 7 (right-call/mistake split), Beat 8 (Reframe,
// LongFormScene), Beat 9 (three-questions scene) and Beat 10 (CTA) all
// render their own dedicated full-screen scenes (see index.tsx) instead of
// this generic caption.
const CAPTIONED_BEATS = new Set(["beat-01", "beat-02", "beat-03", "beat-04", "beat-05", "beat-06"]);

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
