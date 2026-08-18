import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { BEAT_ORDER, FPS, TIMELINE, TOTAL_DURATION, frameOfWord } from "./timeline.ts";
import { BG, HIGHLIGHTS } from "./layout.ts";
import { World } from "./World.tsx";
import { Caption } from "./Hud.tsx";
import { ListScene, QuoteScene } from "./Scenes.tsx";
import { BEATS } from "./data.ts";
import { Wipe } from "../lib/Wipe.tsx";
import { HookScene } from "../lib/scenes/HookScene.tsx";
import { CtaScene } from "../lib/scenes/CtaScene.tsx";
import { SplitArgumentScene } from "../lib/scenes/SplitArgumentScene.tsx";
import { LongFormScene } from "../lib/scenes/LongFormScene.tsx";

export const AVOID_COMMUNICATION_SILOS_DURATION = TOTAL_DURATION;

// No title card — the video opens on a dedicated Hook scene (Beat 0) before
// the diagram exists, and ends on a closing engagement question (Beat 11,
// CTA) held for its full hold after the last word. Beats 1-3, 5 and 7 play
// out over the persistent diagram (design<->operations, design<->
// engineering, and — only from the Reveal onward — operations<->
// engineering). Beats 4, 6 and 8 wipe to dedicated full-screen scenes
// because their content — an enumeration, a standalone quote, a two-sided
// argument — is better shown as itself than narrated over the diagram. The
// diagram reappears for Beat 5 (context loss) and Beat 7 (the Mechanism
// Reveal), then goes fully invisible once Beat 8 takes over and stays that
// way through Beats 9-10 (LongFormScene, pure reflective narration with
// nothing else on screen) and the CTA — no wipe needed between 8/9/10/11
// since the diagram's mode doesn't change again, only the text does.
export const AvoidCommunicationSilos: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/AvoidCommunicationSilos/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-00"].from} durationInFrames={TIMELINE["beat-00"].duration} name="Hook scene">
        <HookScene
          beatId="beat-00"
          beats={BEATS}
          setupRange={[0, 4]}
          punchlineRange={[4, 20]}
          punchlineStartFrame={frameOfWord("beat-00", "And") - TIMELINE["beat-00"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-04"].from} durationInFrames={TIMELINE["beat-04"].duration} name="List scene">
        <ListScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-06"].from} durationInFrames={TIMELINE["beat-06"].duration} name="Quote scene">
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
          leftLabel="The right call"
          leftRange={[0, 17]}
          rightLabel="The mistake"
          rightRange={[17, 51]}
          rightStartFrame={frameOfWord("beat-08", "The") - TIMELINE["beat-08"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-09"].from} durationInFrames={TIMELINE["beat-09"].duration} name="Close scene">
        <LongFormScene beatId="beat-09" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-09"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-10"].from} durationInFrames={TIMELINE["beat-10"].duration} name="Thesis scene">
        <LongFormScene beatId="beat-10" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-10"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-11"].from} durationInFrames={TIMELINE["beat-11"].duration} name="CTA scene">
        <CtaScene beatId="beat-11" beats={BEATS} />
      </Sequence>

      <Wipe atFrame={TIMELINE["beat-04"].from} />
      <Wipe atFrame={TIMELINE["beat-05"].from} />
      <Wipe atFrame={TIMELINE["beat-06"].from} />
      <Wipe atFrame={TIMELINE["beat-07"].from} />
      <Wipe atFrame={TIMELINE["beat-08"].from} />
    </AbsoluteFill>
  );
};
