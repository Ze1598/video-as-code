import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { BEAT_ORDER, FPS, TIMELINE, TOTAL_DURATION, frameOfWord } from "./timeline.ts";
import { BG, HIGHLIGHTS } from "./layout.ts";
import { World } from "./World.tsx";
import { Caption } from "./Hud.tsx";
import { ProblemsListScene, LessonListScene, QuoteScene } from "./Scenes.tsx";
import { BEATS } from "./data.ts";
import { Wipe } from "../lib/Wipe.tsx";
import { HookScene } from "../lib/scenes/HookScene.tsx";
import { CtaScene } from "../lib/scenes/CtaScene.tsx";
import { SplitArgumentScene } from "../lib/scenes/SplitArgumentScene.tsx";
import { LongFormScene } from "../lib/scenes/LongFormScene.tsx";

export const HOLD_YOUR_STANDARDS_DURATION = TOTAL_DURATION;

// No title card — the video opens on a dedicated Hook scene (Beat 0)
// before the diagram exists, and ends on a closing engagement question
// (Beat 13, CTA) held for its full hold after the last word. Beats 1, 2,
// 4, 5, 6 and 8 play out over the persistent diagram (Team Lead <->
// Other Managers, Team Lead <-> Team, and Team <-> Operations). Beats 3,
// 7 and 9 wipe to dedicated full-screen scenes — two enumerations and a
// standalone quote — because that content is better shown as itself than
// narrated over the diagram. The diagram reappears for Beats 4-6 and for
// Beat 8's Mechanism Reveal, then goes fully invisible once Beat 9 takes
// over and stays that way through Beat 10 (the split), Beats 11-12
// (LongFormScene, pure reflective narration) and the CTA.
export const HoldYourStandards: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/HoldYourStandards/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-00"].from} durationInFrames={TIMELINE["beat-00"].duration} name="Hook scene">
        <HookScene
          beatId="beat-00"
          beats={BEATS}
          setupRange={[0, 10]}
          punchlineRange={[10, 18]}
          punchlineStartFrame={frameOfWord("beat-00", "His") - TIMELINE["beat-00"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-03"].from} durationInFrames={TIMELINE["beat-03"].duration} name="Problems list scene">
        <ProblemsListScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-07"].from} durationInFrames={TIMELINE["beat-07"].duration} name="Quote scene">
        <QuoteScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-09"].from} durationInFrames={TIMELINE["beat-09"].duration} name="Lesson list scene">
        <LessonListScene />
      </Sequence>

      <Sequence
        from={TIMELINE["beat-10"].from}
        durationInFrames={TIMELINE["beat-10"].duration}
        name="Counterweight scene"
      >
        <SplitArgumentScene
          beatId="beat-10"
          beats={BEATS}
          leftLabel="Done right"
          leftRange={[0, 57]}
          rightLabel="The mistake"
          rightRange={[57, 71]}
          rightStartFrame={frameOfWord("beat-10", "Otherwise,") - TIMELINE["beat-10"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-11"].from} durationInFrames={TIMELINE["beat-11"].duration} name="Reframe scene">
        <LongFormScene beatId="beat-11" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-11"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-12"].from} durationInFrames={TIMELINE["beat-12"].duration} name="Close scene">
        <LongFormScene beatId="beat-12" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-12"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-13"].from} durationInFrames={TIMELINE["beat-13"].duration} name="CTA scene">
        <CtaScene beatId="beat-13" beats={BEATS} />
      </Sequence>

      <Wipe atFrame={TIMELINE["beat-03"].from} />
      <Wipe atFrame={TIMELINE["beat-04"].from} />
      <Wipe atFrame={TIMELINE["beat-07"].from} />
      <Wipe atFrame={TIMELINE["beat-08"].from} />
      <Wipe atFrame={TIMELINE["beat-09"].from} />
    </AbsoluteFill>
  );
};
