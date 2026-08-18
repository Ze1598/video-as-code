import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { BEAT_ORDER, FPS, TIMELINE, TOTAL_DURATION } from "./timeline";
import { BG, HIGHLIGHTS } from "./layout";
import { World } from "./World";
import { Caption } from "./Hud";
import { ListScene } from "./Scenes";
import { BEATS } from "./data";
import { Wipe } from "../lib/Wipe";
import { HookScene } from "../lib/scenes/HookScene";
import { CtaScene } from "../lib/scenes/CtaScene";
import { SplitArgumentScene } from "../lib/scenes/SplitArgumentScene";
import { LongFormScene } from "../lib/scenes/LongFormScene";

export const FPS_HTBU = FPS;
export const HOW_TO_BE_UNDERSTOOD_DURATION = TOTAL_DURATION;

// No title card — the video opens on a dedicated Hook scene (Beat 0) before
// the diagram exists, and ends on a closing engagement question (Beat 10,
// CTA) held for its full hold after the last word. Beats 1-4 and 6 play out
// over the persistent diagram; Beats 5 and 7 wipe to dedicated full-screen
// scenes because their content — an enumeration, a two-sided argument — is
// better shown as itself than narrated over the diagram. The diagram
// reappears for Beat 6 (the Mechanism Reveal) between those two dedicated
// scenes, then goes fully invisible once Beat 7 takes over and stays that
// way through Beats 8-9 (LongFormScene, pure reflective narration with
// nothing else on screen) and the CTA — no wipe needed between 7/8/9/10
// since the diagram's mode doesn't change again, only the text does.
export const HowToBeUnderstood: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/HowToBeUnderstood/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-00"].from} durationInFrames={TIMELINE["beat-00"].duration} name="Hook scene">
        <HookScene
          beatId="beat-00"
          beats={BEATS}
          setupRange={[0, 9]}
          punchlineRange={[9, 20]}
          punchlineStartFrame={172}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-05"].from} durationInFrames={TIMELINE["beat-05"].duration} name="List scene">
        <ListScene />
      </Sequence>

      <Sequence
        from={TIMELINE["beat-07"].from}
        durationInFrames={TIMELINE["beat-07"].duration}
        name="Counterweight scene"
      >
        <SplitArgumentScene
          beatId="beat-07"
          beats={BEATS}
          leftLabel="The right call"
          leftRange={[0, 9]}
          rightLabel="The mistake"
          rightRange={[9, 27]}
          rightStartFrame={192}
          footnoteRange={[27, 61]}
          footnoteStartFrame={656}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-08"].from} durationInFrames={TIMELINE["beat-08"].duration} name="Reframe scene">
        <LongFormScene beatId="beat-08" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-08"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-09"].from} durationInFrames={TIMELINE["beat-09"].duration} name="Close scene">
        <LongFormScene beatId="beat-09" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-09"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-10"].from} durationInFrames={TIMELINE["beat-10"].duration} name="CTA scene">
        <CtaScene beatId="beat-10" beats={BEATS} />
      </Sequence>

      <Wipe atFrame={TIMELINE["beat-05"].from} />
      <Wipe atFrame={TIMELINE["beat-06"].from} />
      <Wipe atFrame={TIMELINE["beat-07"].from} />
    </AbsoluteFill>
  );
};
