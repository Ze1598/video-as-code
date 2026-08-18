import { Sequence, useCurrentFrame } from "remotion";
import { BG } from "../palette";
import { Caption } from "../scenes/Caption";
import { CtaScene } from "../scenes/CtaScene";
import { HookScene } from "../scenes/HookScene";
import { ListRow } from "../scenes/ListRow";
import { LongFormScene } from "../scenes/LongFormScene";
import { SplitArgumentScene } from "../scenes/SplitArgumentScene";
import { Wipe } from "../Wipe";
import { DEMO_BEATS } from "./data";
import { BEAT_ORDER, FPS, TIMELINE, TOTAL_DURATION, frameOfWord } from "./timeline";
import { DemoWorld } from "./World";

export const FPS_LIB_DEMO = FPS;
export const LIB_DEMO_DURATION = TOTAL_DURATION;

const local = (beatId: string, word: string, occurrence = 0) =>
  frameOfWord(beatId, word, "start", occurrence) - TIMELINE[beatId].from;

// A standing smoke test for src/lib — every shared primitive rendered with
// synthetic placeholder data. Not a real video: run `npx remotion still
// LibDemo out.png --frame=N` after touching anything under src/lib to
// confirm nothing broke, before trusting it in an actual video build.
export const LibDemo: React.FC = () => {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: BG }}>
      <DemoWorld />
      <Caption
        beats={DEMO_BEATS}
        timeline={TIMELINE}
        beatOrder={BEAT_ORDER}
        fps={FPS}
        captionedBeats={new Set(["diagram"])}
      />

      <Sequence from={TIMELINE.hook.from} durationInFrames={TIMELINE.hook.duration} name="Hook">
        <HookScene
          beatId="hook"
          beats={DEMO_BEATS}
          setupRange={[0, 6]}
          punchlineRange={[6, 14]}
          punchlineStartFrame={local("hook", "It")}
        />
      </Sequence>

      <Sequence from={TIMELINE.list.from} durationInFrames={TIMELINE.list.duration} name="List">
        <DemoListScene />
      </Sequence>

      <Sequence from={TIMELINE.split.from} durationInFrames={TIMELINE.split.duration} name="Split">
        <SplitArgumentScene
          beatId="split"
          beats={DEMO_BEATS}
          leftLabel="The right call"
          leftRange={[0, 6]}
          rightLabel="The mistake"
          rightRange={[6, 12]}
          rightStartFrame={local("split", "the", 1)}
          footnoteRange={[12, 19]}
          footnoteStartFrame={local("split", "and")}
        />
      </Sequence>

      <Sequence from={TIMELINE.longform.from} durationInFrames={TIMELINE.longform.duration} name="LongForm">
        <LongFormScene beatId="longform" beats={DEMO_BEATS} timeline={TIMELINE} fps={FPS} />
      </Sequence>

      <Sequence from={TIMELINE.cta.from} durationInFrames={TIMELINE.cta.duration} name="Cta">
        <CtaScene beatId="cta" beats={DEMO_BEATS} />
      </Sequence>

      <Wipe atFrame={TIMELINE.list.from} />
      <Wipe atFrame={TIMELINE.split.from} />
    </div>
  );
};

const LIST_ITEM_FRAMES = [local("list", "One"), local("list", "Another"), local("list", "A")];

const DemoListScene: React.FC = () => {
  const words = DEMO_BEATS.list.words;
  const items = [
    words.slice(4, 8).map((w) => w.text).join(" "),
    words.slice(8, 12).map((w) => w.text).join(" "),
    words.slice(12, 17).map((w) => w.text).join(" "),
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
      }}
    >
      {items.map((text, i) => (
        <ListRowWithFrame key={text} text={text} revealFrame={LIST_ITEM_FRAMES[i]} />
      ))}
    </div>
  );
};

const ListRowWithFrame: React.FC<{ text: string; revealFrame: number }> = ({ text, revealFrame }) => {
  const frame = useCurrentFrame();
  return <ListRow text={text} revealFrame={revealFrame} frame={frame} />;
};
