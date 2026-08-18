import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { BEAT_ORDER, FPS, frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { BG, HIGHLIGHTS } from "./layout.ts";
import { World } from "./World.tsx";
import { Caption } from "./Hud.tsx";
import { ThreeQuestionsScene } from "./Scenes.tsx";
import { BEATS } from "./data.ts";
import { Wipe } from "../lib/Wipe.tsx";
import { HookScene } from "../lib/scenes/HookScene.tsx";
import { CtaScene } from "../lib/scenes/CtaScene.tsx";
import { SplitArgumentScene } from "../lib/scenes/SplitArgumentScene.tsx";
import { LongFormScene } from "../lib/scenes/LongFormScene.tsx";

export const FPS_BSP = FPS;
export const BUILD_SOMETHING_PURPOSEFUL_DURATION = TOTAL_DURATION;

const b7 = TIMELINE["beat-07"];

// No title card — the video opens on a dedicated Hook scene (Beat 0) before
// the diagram exists, and ends on a closing engagement question (Beat 10,
// CTA) held for its full hold after the last word. Beats 1-6 play out over
// the persistent diagram (fading in at Beat 1, reaching its widest framing
// for Beat 6's Mechanism Reveal). Beat 7 wipes to a dedicated split scene —
// the Balanced Counterweight, execution vs. purpose — and the diagram stays
// invisible through Beats 8-9 (pure reflective narration / the
// three-questions close) and the CTA, since the diagram's mode never
// changes again after Beat 7.
export const BuildSomethingPurposeful: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/BuildSomethingPurposeful/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-00"].from} durationInFrames={TIMELINE["beat-00"].duration} name="Hook scene">
        <HookScene
          beatId="beat-00"
          beats={BEATS}
          setupRange={[0, 25]}
          punchlineRange={[25, 49]}
          punchlineStartFrame={frameOfWord("beat-00", "Then") - TIMELINE["beat-00"].from}
        />
      </Sequence>

      <Sequence from={b7.from} durationInFrames={b7.duration} name="Counterweight scene">
        <SplitArgumentScene
          beatId="beat-07"
          beats={BEATS}
          introRange={[0, 15]}
          introEndFrame={frameOfWord("beat-07", "The", "start", 0) - b7.from}
          leftLabel="The right call"
          leftRange={[15, 27]}
          rightLabel="The mistake"
          rightRange={[27, 33]}
          leftStartFrame={frameOfWord("beat-07", "The", "start", 0) - b7.from}
          rightStartFrame={frameOfWord("beat-07", "None") - b7.from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-08"].from} durationInFrames={TIMELINE["beat-08"].duration} name="Reframe scene">
        <LongFormScene beatId="beat-08" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-08"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-09"].from} durationInFrames={TIMELINE["beat-09"].duration} name="Three questions scene">
        <ThreeQuestionsScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-10"].from} durationInFrames={TIMELINE["beat-10"].duration} name="CTA scene">
        <CtaScene beatId="beat-10" beats={BEATS} />
      </Sequence>

      <Wipe atFrame={b7.from} />
    </AbsoluteFill>
  );
};
