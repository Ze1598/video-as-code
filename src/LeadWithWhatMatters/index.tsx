import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { BEAT_ORDER, FPS, TIMELINE, TOTAL_DURATION, frameOfWord } from "./timeline.ts";
import { BG } from "./layout.ts";
import { World } from "./World.tsx";
import { Caption } from "./Hud.tsx";
import { ListScene, QuoteScene } from "./Scenes.tsx";
import { BEATS } from "./data.ts";
import { Wipe } from "../lib/Wipe.tsx";
import { HookScene } from "../lib/scenes/HookScene.tsx";
import { CtaScene } from "../lib/scenes/CtaScene.tsx";
import { SplitArgumentScene } from "../lib/scenes/SplitArgumentScene.tsx";
import { LongFormScene } from "../lib/scenes/LongFormScene.tsx";

export const FPS_LWWM = FPS;
export const LEAD_WITH_WHAT_MATTERS_DURATION = TOTAL_DURATION;

const b8 = TIMELINE["beat-08"];
const leftStartFrame = frameOfWord("beat-08", "Context") - b8.from;
const rightStartFrame = frameOfWord("beat-08", "mistake") - b8.from;
const footnoteStartFrame = frameOfWord("beat-08", "Niceness") - b8.from;
const punchlineStartFrame = frameOfWord("beat-00", "Almost") - TIMELINE["beat-00"].from;

// No title card — the video opens on a dedicated Hook scene (Beat 0) before
// the diagram exists, and ends on a closing engagement question (Beat 11,
// CTA) held for its full hold after the last word. Beats 1-6 play out over
// the persistent diagram; Beat 7 (the fix, a quote), Beat 8 (the
// counterweight, a split), Beat 9 (the reframe, long-form), and Beat 10
// (the operational close, a list) all wipe to dedicated full-screen scenes
// once the diagram's mode flips off after the Reveal — no further wipes are
// needed between 7/8/9/10/11 since the diagram doesn't come back, only the
// text changes.
export const LeadWithWhatMatters: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/LeadWithWhatMatters/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-00"].from} durationInFrames={TIMELINE["beat-00"].duration} name="Hook scene">
        <HookScene
          beatId="beat-00"
          beats={BEATS}
          setupRange={[0, 17]}
          punchlineRange={[17, 29]}
          punchlineStartFrame={punchlineStartFrame}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-07"].from} durationInFrames={TIMELINE["beat-07"].duration} name="Quote scene">
        <QuoteScene />
      </Sequence>

      <Sequence
        from={TIMELINE["beat-08"].from}
        durationInFrames={TIMELINE["beat-08"].duration}
        name="Counterweight scene"
      >
        <SplitArgumentScene
          beatId="beat-08"
          beats={BEATS}
          introRange={[0, 23]}
          introEndFrame={leftStartFrame}
          leftLabel="What still matters"
          leftRange={[23, 40]}
          leftStartFrame={leftStartFrame}
          rightLabel="What broke it"
          rightRange={[51, 61]}
          rightStartFrame={rightStartFrame}
          footnoteRange={[40, 51]}
          footnoteStartFrame={footnoteStartFrame}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-09"].from} durationInFrames={TIMELINE["beat-09"].duration} name="Reframe scene">
        <LongFormScene beatId="beat-09" beats={BEATS} timeline={TIMELINE} fps={FPS} />
      </Sequence>

      <Sequence from={TIMELINE["beat-10"].from} durationInFrames={TIMELINE["beat-10"].duration} name="Close scene">
        <ListScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-11"].from} durationInFrames={TIMELINE["beat-11"].duration} name="CTA scene">
        <CtaScene beatId="beat-11" beats={BEATS} />
      </Sequence>

      <Wipe atFrame={TIMELINE["beat-01"].from} />
      <Wipe atFrame={TIMELINE["beat-07"].from} />
    </AbsoluteFill>
  );
};
