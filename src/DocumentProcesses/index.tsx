import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { BEAT_ORDER, FPS, frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { BG, HIGHLIGHTS } from "./layout.ts";
import { World } from "./World.tsx";
import { Caption } from "./Hud.tsx";
import { ListScene } from "./Scenes.tsx";
import { BEATS } from "./data.ts";
import { Wipe } from "../lib/Wipe.tsx";
import { HookScene } from "../lib/scenes/HookScene.tsx";
import { CtaScene } from "../lib/scenes/CtaScene.tsx";
import { SplitArgumentScene } from "../lib/scenes/SplitArgumentScene.tsx";
import { LongFormScene } from "../lib/scenes/LongFormScene.tsx";

export const DOCUMENT_PROCESSES_DURATION = TOTAL_DURATION;

const punchlineStartFrame = frameOfWord("beat-00", "Nobody") - TIMELINE["beat-00"].from;
const rightStartFrame = frameOfWord("beat-08", "mistake") - TIMELINE["beat-08"].from;

// No title card — the video opens on a dedicated Hook scene (Beat 0) before
// the diagram exists, and ends on the closing engagement question (Beat 12,
// CTA) held for its full hold after the last word. Beats 1-7 play out over
// the persistent diagram (Beat 4's rejection and Beat 7's Mechanism Reveal
// both hold on the diagram rather than cutting away). Beat 8 (the
// right-call/mistake split) is where the essay moves from the mechanism
// into pure reflection, so that's the one real mode switch — the diagram
// fades out there and stays gone through Beats 9-12 (two LongFormScenes, the
// checklist's ListScene, and the CTA), so only one Wipe is needed for the
// whole video.
export const DocumentProcesses: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/DocumentProcesses/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-00"].from} durationInFrames={TIMELINE["beat-00"].duration} name="Hook scene">
        <HookScene
          beatId="beat-00"
          beats={BEATS}
          setupRange={[0, 14]}
          punchlineRange={[14, 22]}
          punchlineStartFrame={punchlineStartFrame}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-08"].from} durationInFrames={TIMELINE["beat-08"].duration} name="Counterweight scene">
        <SplitArgumentScene
          beatId="beat-08"
          beats={BEATS}
          leftLabel="The right call"
          leftRange={[0, 24]}
          rightLabel="The mistake"
          rightRange={[24, 42]}
          rightStartFrame={rightStartFrame}
        />
      </Sequence>

      <Sequence from={TIMELINE["beat-09"].from} durationInFrames={TIMELINE["beat-09"].duration} name="Reframe scene">
        <LongFormScene beatId="beat-09" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-09"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-10"].from} durationInFrames={TIMELINE["beat-10"].duration} name="Checklist scene">
        <ListScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-11"].from} durationInFrames={TIMELINE["beat-11"].duration} name="Close scene">
        <LongFormScene beatId="beat-11" beats={BEATS} timeline={TIMELINE} fps={FPS} highlight={HIGHLIGHTS["beat-11"]} />
      </Sequence>

      <Sequence from={TIMELINE["beat-12"].from} durationInFrames={TIMELINE["beat-12"].duration} name="CTA scene">
        <CtaScene beatId="beat-12" beats={BEATS} />
      </Sequence>

      <Wipe atFrame={TIMELINE["beat-08"].from} />
    </AbsoluteFill>
  );
};
