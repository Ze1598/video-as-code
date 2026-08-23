import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { BEAT_ORDER, FPS, TIMELINE, TOTAL_DURATION, frameOfWord } from "./timeline.ts";
import { BG, HIGHLIGHTS } from "./layout.ts";
import { World } from "./World.tsx";
import { Caption } from "./Hud.tsx";
import { WasteListScene } from "./Scenes.tsx";
import { BEATS } from "./data.ts";
import { Wipe } from "../lib/Wipe.tsx";
import { HookScene } from "../lib/scenes/HookScene.tsx";
import { CtaScene } from "../lib/scenes/CtaScene.tsx";
import { SplitArgumentScene } from "../lib/scenes/SplitArgumentScene.tsx";
import { LongFormScene } from "../lib/scenes/LongFormScene.tsx";

export const ADDING_MORE_PEOPLE_DURATION = TOTAL_DURATION;

// No title card — the video opens on a dedicated Hook scene (Beat 0) before
// the diagram exists, and ends on a closing engagement question (Beat 10,
// CTA) held for its full hold after the last word. Beats 1, 2, 3, 5, 6 and
// 7 play out over the persistent diagram (Management -> New Engineers,
// Senior Engineers -> New Engineers, Stakeholders -> Senior Engineers, and
// the Delivery Lead -> Stakeholders fix). Beat 4 wipes to a dedicated list
// scene (the enumeration of where the team's time was going) and Beat 8
// wipes to a dedicated split scene (the right call versus the mistake) —
// content better shown as itself than narrated over the diagram. The
// diagram reappears for Beats 5-7 (the entangled system, the Mechanism
// Reveal, and the fix), then goes fully invisible once Beat 8 takes over
// and stays that way through Beat 9 (LongFormScene, pure reflective
// narration) and the CTA.
export const AddingMorePeople: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/AddingMorePeople/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-00"].from} durationInFrames={TIMELINE["beat-00"].duration} name="Hook scene">
        <HookScene
          beatId="beat-00"
          beats={BEATS}
          setupRange={[0, 18]}
          punchlineRange={[18, 30]}
          punchlineStartFrame={frameOfWord("beat-00", "A") - TIMELINE["beat-00"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-04"].from} durationInFrames={TIMELINE["beat-04"].duration} name="Waste list scene">
        <WasteListScene />
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
          leftRange={[0, 27]}
          rightLabel="The mistake"
          rightRange={[27, 54]}
          rightStartFrame={frameOfWord("beat-08", "Management") - TIMELINE["beat-08"].from}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-09"].from} durationInFrames={TIMELINE["beat-09"].duration} name="Close scene">
        <LongFormScene beatId="beat-09" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-09"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-10"].from} durationInFrames={TIMELINE["beat-10"].duration} name="CTA scene">
        <CtaScene beatId="beat-10" beats={BEATS} />
      </Sequence>

      <Wipe atFrame={TIMELINE["beat-04"].from} />
      <Wipe atFrame={TIMELINE["beat-05"].from} />
      <Wipe atFrame={TIMELINE["beat-08"].from} />
    </AbsoluteFill>
  );
};
