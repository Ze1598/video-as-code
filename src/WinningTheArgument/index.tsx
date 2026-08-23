import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { BEAT_ORDER, FPS, TIMELINE, TOTAL_DURATION, frameOfWord } from "./timeline.ts";
import { BG, HIGHLIGHTS } from "./layout.ts";
import { World } from "./World.tsx";
import { Caption } from "./Hud.tsx";
import { ArgumentDriftListScene, QuoteScene } from "./Scenes.tsx";
import { BEATS } from "./data.ts";
import { Wipe } from "../lib/Wipe.tsx";
import { HookScene } from "../lib/scenes/HookScene.tsx";
import { CtaScene } from "../lib/scenes/CtaScene.tsx";
import { SplitArgumentScene } from "../lib/scenes/SplitArgumentScene.tsx";
import { LongFormScene } from "../lib/scenes/LongFormScene.tsx";

export const WINNING_THE_ARGUMENT_DURATION = TOTAL_DURATION;

// No title card — the video opens on a dedicated Hook scene (Beat 0) before
// the diagram exists, and ends on a closing engagement question (Beat 13,
// CTA) held for its full hold after the last word. Beats 1, 2, 3, 5, 6 and
// 9 play out over the persistent diagram (Manager <-> First Lead, Manager
// <-> Second Lead, and the two contested-resource packets). Beats 4, 7, 8,
// 10, 11 and 12 wipe to dedicated full-screen scenes — an enumeration, two
// splits, a standalone quote, and two runs of pure reflective narration —
// because that content is better shown as itself than narrated over the
// diagram. The diagram reappears for Beats 5-6 and for Beat 9's Mechanism
// Reveal, then goes fully invisible once Beat 10 takes over and stays that
// way through Beats 11-12 and the CTA.
export const WinningTheArgument: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/WinningTheArgument/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-00"].from} durationInFrames={TIMELINE["beat-00"].duration} name="Hook scene">
        <HookScene
          beatId="beat-00"
          beats={BEATS}
          setupRange={[0, 17]}
          punchlineRange={[17, 34]}
          punchlineStartFrame={frameOfWord("beat-00", "By") - TIMELINE["beat-00"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-04"].from} durationInFrames={TIMELINE["beat-04"].duration} name="Argument drift list scene">
        <ArgumentDriftListScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-07"].from} durationInFrames={TIMELINE["beat-07"].duration} name="Counterweight scene">
        <SplitArgumentScene
          beatId="beat-07"
          beats={BEATS}
          leftLabel="What winning gets you"
          leftRange={[0, 31]}
          rightLabel="What it doesn't prove"
          rightRange={[31, 43]}
          rightStartFrame={frameOfWord("beat-07", "None") - TIMELINE["beat-07"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-08"].from} durationInFrames={TIMELINE["beat-08"].duration} name="Quote scene">
        <QuoteScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-10"].from} durationInFrames={TIMELINE["beat-10"].duration} name="Reframe scene 1">
        <LongFormScene beatId="beat-10" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-10"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-11"].from} durationInFrames={TIMELINE["beat-11"].duration} name="Reframe scene 2">
        <SplitArgumentScene
          beatId="beat-11"
          beats={BEATS}
          leftLabel="Win the argument"
          leftRange={[0, 18]}
          rightLabel="Expose the problem"
          rightRange={[18, 36]}
          rightStartFrame={frameOfWord("beat-11", "Expose") - TIMELINE["beat-11"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-12"].from} durationInFrames={TIMELINE["beat-12"].duration} name="Close scene">
        <LongFormScene beatId="beat-12" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-12"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-13"].from} durationInFrames={TIMELINE["beat-13"].duration} name="CTA scene">
        <CtaScene beatId="beat-13" beats={BEATS} />
      </Sequence>

      <Wipe atFrame={TIMELINE["beat-04"].from} />
      <Wipe atFrame={TIMELINE["beat-05"].from} />
      <Wipe atFrame={TIMELINE["beat-07"].from} />
      <Wipe atFrame={TIMELINE["beat-08"].from} />
      <Wipe atFrame={TIMELINE["beat-09"].from} />
      <Wipe atFrame={TIMELINE["beat-10"].from} />
    </AbsoluteFill>
  );
};
