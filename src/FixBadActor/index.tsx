import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { BEAT_ORDER, FPS, TIMELINE, TOTAL_DURATION, frameOfWord } from "./timeline.ts";
import { BG, HIGHLIGHTS } from "./layout.ts";
import { World } from "./World.tsx";
import { Caption } from "./Hud.tsx";
import { QuoteScene, ScorecardListScene } from "./Scenes.tsx";
import { BEATS } from "./data.ts";
import { Wipe } from "../lib/Wipe.tsx";
import { HookScene } from "../lib/scenes/HookScene.tsx";
import { CtaScene } from "../lib/scenes/CtaScene.tsx";
import { SplitArgumentScene } from "../lib/scenes/SplitArgumentScene.tsx";
import { LongFormScene } from "../lib/scenes/LongFormScene.tsx";

export const FIX_BAD_ACTOR_DURATION = TOTAL_DURATION;

// No title card — the video opens on a dedicated Hook scene (Beat 0) before
// the diagram exists, and ends on a closing engagement question (Beat 15,
// CTA) held for its full hold after the last word. Beats 1, 2, 3, 4, 6, 7
// and 8 play out over the persistent diagram (Developer <-> Manager,
// Developer <-> Colleagues, Developer <-> Leadership). Beat 5 wipes to a
// dedicated quote scene and back. Beat 8's Mechanism Reveal is the diagram's
// last appearance: Beats 9-14 (accountability, reframe, the correction, the
// scorecard list, the diagnostic split, the final thesis) are pure
// reflective/dedicated scenes with the diagram fully gone, and the CTA never
// needs it back.
export const FixBadActor: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/FixBadActor/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-00"].from} durationInFrames={TIMELINE["beat-00"].duration} name="Hook scene">
        <HookScene
          beatId="beat-00"
          beats={BEATS}
          setupRange={[0, 12]}
          punchlineRange={[12, 26]}
          punchlineStartFrame={frameOfWord("beat-00", "Whatever") - TIMELINE["beat-00"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-05"].from} durationInFrames={TIMELINE["beat-05"].duration} name="Quote scene">
        <QuoteScene />
      </Sequence>

      <Sequence
        from={TIMELINE["beat-09"].from}
        durationInFrames={TIMELINE["beat-09"].duration}
        name="Accountability scene"
      >
        <LongFormScene beatId="beat-09" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-09"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-10"].from} durationInFrames={TIMELINE["beat-10"].duration} name="Reframe scene">
        <LongFormScene beatId="beat-10" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-10"]} />
      </Sequence>

      <Sequence
        from={TIMELINE["beat-11"].from}
        durationInFrames={TIMELINE["beat-11"].duration}
        name="Correction scene"
      >
        <LongFormScene beatId="beat-11" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-11"]} />
      </Sequence>

      <Sequence
        from={TIMELINE["beat-12"].from}
        durationInFrames={TIMELINE["beat-12"].duration}
        name="Scorecard list scene"
      >
        <ScorecardListScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-13"].from} durationInFrames={TIMELINE["beat-13"].duration} name="Diagnostic scene">
        <SplitArgumentScene
          beatId="beat-13"
          beats={BEATS}
          introRange={[0, 7]}
          introEndFrame={frameOfWord("beat-13", "He") - TIMELINE["beat-13"].from}
          leftLabel="If it worked"
          leftRange={[7, 18]}
          leftStartFrame={frameOfWord("beat-13", "He") - TIMELINE["beat-13"].from}
          rightLabel="If it didn't"
          rightRange={[18, 44]}
          rightStartFrame={frameOfWord("beat-13", "Or") - TIMELINE["beat-13"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-14"].from} durationInFrames={TIMELINE["beat-14"].duration} name="Thesis scene">
        <LongFormScene beatId="beat-14" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-14"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-15"].from} durationInFrames={TIMELINE["beat-15"].duration} name="CTA scene">
        <CtaScene beatId="beat-15" beats={BEATS} />
      </Sequence>

      <Wipe atFrame={TIMELINE["beat-05"].from} />
      <Wipe atFrame={TIMELINE["beat-06"].from} />
      <Wipe atFrame={TIMELINE["beat-09"].from} />
    </AbsoluteFill>
  );
};
