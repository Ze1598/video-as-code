import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { BEATS } from "./data";
import { KineticWords } from "./KineticWords";

const FPS = 30;
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

const BG = "#14110F";
const TEXT = "#F2EDE4";
const ACCENT = "#E8A33D";
const MUTED = "#8A8377";

// Timeline: `from`/`duration` in frames, `fadeOut` = how many trailing frames of
// each beat cross-fade into (or settle before a hard cut into) the next one.
// Derived from the real ElevenLabs speech duration of each slide plus a
// deliberate hold, not a fixed guess — see the calculation this was built from
// in scripts/generate-voiceover-positive-feedback.ts's output.
const TIMELINE: Record<string, { from: number; duration: number; fadeOut: number }> = {
  title: { from: 0, duration: 100, fadeOut: 20 },
  "slide-01": { from: 80, duration: 246, fadeOut: 15 },
  "slide-02": { from: 311, duration: 129, fadeOut: 15 },
  "slide-03": { from: 425, duration: 115, fadeOut: 15 },
  "slide-04": { from: 525, duration: 161, fadeOut: 15 },
  "slide-05": { from: 671, duration: 140, fadeOut: 15 },
  "slide-06": { from: 796, duration: 165, fadeOut: 12 },
  "slide-07": { from: 971, duration: 98, fadeOut: 15 },
  "slide-08": { from: 1054, duration: 95, fadeOut: 15 },
  "slide-09": { from: 1134, duration: 158, fadeOut: 15 },
  "slide-10": { from: 1277, duration: 109, fadeOut: 15 },
  "slide-11": { from: 1371, duration: 116, fadeOut: 15 },
  "slide-12": { from: 1472, duration: 150, fadeOut: 15 },
  "slide-13": { from: 1607, duration: 153, fadeOut: 15 },
  "slide-14": { from: 1745, duration: 105, fadeOut: 12 },
  "slide-15": { from: 1860, duration: 101, fadeOut: 15 },
  "slide-16": { from: 1946, duration: 122, fadeOut: 15 },
  "slide-17": { from: 2053, duration: 183, fadeOut: 15 },
  "slide-18": { from: 2221, duration: 123, fadeOut: 5 },
  "slide-19": { from: 2339, duration: 139, fadeOut: 25 },
  "end-card": { from: 2453, duration: 110, fadeOut: 0 },
};

export const POSITIVE_FEEDBACK_DURATION =
  TIMELINE["end-card"].from + TIMELINE["end-card"].duration;

export const PositiveFeedback: React.FC = () => {
  return (
    <AbsoluteFill name="Background" style={{ backgroundColor: BG }}>
      <Sequence from={TIMELINE.title.from} durationInFrames={TIMELINE.title.duration} name="Title">
        <TitleCard />
      </Sequence>

      <NarratedBeat id="slide-01" />
      <NarratedBeat id="slide-02" />
      <NarratedBeat id="slide-03" />
      <NarratedBeat id="slide-04" />
      <NarratedBeat id="slide-05" />
      <NarratedBeat id="slide-06" />

      <Sequence from={TIMELINE["slide-07"].from} durationInFrames={TIMELINE["slide-07"].duration} name="Slide 7 - Quote">
        <QuoteBeat />
      </Sequence>

      <NarratedBeat id="slide-08" />
      <NarratedBeat id="slide-09" highlight={(w) => w === "unnoticed."} />
      <NarratedBeat id="slide-10" />

      <Sequence from={TIMELINE["slide-11"].from} durationInFrames={TIMELINE["slide-11"].duration} name="Slide 11 - Counter">
        <CounterBeat />
      </Sequence>

      <NarratedBeat id="slide-12" highlight={(w) => w === "strongest"} />
      <NarratedBeat id="slide-13" highlight={(w) => w === "ten" || w === "months"} />
      <NarratedBeat id="slide-14" />

      <Sequence from={TIMELINE["slide-15"].from} durationInFrames={TIMELINE["slide-15"].duration} name="Slide 15 - Reinforcement pop">
        <ReinforcementBeat />
      </Sequence>

      <NarratedBeat id="slide-16" highlight={(w) => w === "worked." || w === "mattered." || w === "again."} />
      <NarratedBeat id="slide-17" highlight={(w) => w === "noticed"} />
      <NarratedBeat id="slide-18" fontSize={64} />
      <NarratedBeat id="slide-19" fontSize={64} highlight={(w) => w === "when" || w === "it" || w === "happens."} glow riseFrames={18} />

      <Sequence from={TIMELINE["end-card"].from} durationInFrames={TIMELINE["end-card"].duration} name="End card">
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

const NarratedBeat: React.FC<{
  id: string;
  fontSize?: number;
  highlight?: (word: string, index: number) => boolean;
  glow?: boolean;
  riseFrames?: number;
}> = ({ id, fontSize = 56, highlight, glow, riseFrames }) => {
  const timing = TIMELINE[id];
  const beat = BEATS[id];
  return (
    <Sequence from={timing.from} durationInFrames={timing.duration} name={`Slide ${id}`}>
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "120px 140px",
          boxSizing: "border-box",
        }}
      >
        <Audio src={staticFile(`voiceover/PositiveFeedback/${id}.mp3`)} />
        <KineticWords
          words={beat.words}
          fps={FPS}
          durationInFrames={timing.duration}
          fadeOutFrames={timing.fadeOut}
          fontSize={fontSize}
          color={TEXT}
          accentColor={ACCENT}
          isHighlighted={highlight}
          glow={glow}
          riseFrames={riseFrames}
        />
      </AbsoluteFill>
    </Sequence>
  );
};

const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const timing = TIMELINE.title;

  const opacity = interpolate(
    frame,
    [0, 25, timing.duration - timing.fadeOut, timing.duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
  );
  const scale = interpolate(frame, [0, 25], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const barWidth = interpolate(frame, [15, 40], [0, 140], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "120px 160px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 76,
          fontWeight: 700,
          color: TEXT,
          textAlign: "center",
          lineHeight: 1.25,
          opacity,
          scale,
        }}
      >
        When You Forget to Tell Them
        <br />
        They Did a Good Job
      </div>
      <div
        style={{
          marginTop: 32,
          height: 3,
          width: barWidth,
          backgroundColor: ACCENT,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

const QuoteBeat: React.FC = () => {
  const timing = TIMELINE["slide-07"];
  const raw = BEATS["slide-07"].words;
  const quoteWords = raw.map((w, i) => ({
    ...w,
    text:
      i === 0
        ? `“${w.text}`
        : i === raw.length - 1
          ? `${w.text}”`
          : w.text,
  }));

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "120px 200px",
        boxSizing: "border-box",
      }}
    >
      <Audio src={staticFile("voiceover/PositiveFeedback/slide-07.mp3")} />
      <KineticWords
        words={quoteWords}
        fps={FPS}
        durationInFrames={timing.duration}
        fadeOutFrames={timing.fadeOut}
        fontSize={72}
        color={MUTED}
        flat
        italic
        riseFrames={16}
      />
    </AbsoluteFill>
  );
};

const CounterBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const timing = TIMELINE["slide-11"];
  const beat = BEATS["slide-11"];
  const fadeStart = timing.duration - timing.fadeOut;

  const count = Math.round(
    interpolate(frame, [0, 18], [0, 10], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const counterOpacity = interpolate(
    frame,
    [0, 10, fadeStart, timing.duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
  );
  const pulse = interpolate(frame, [16, 22, 30], [1, 1.16, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 140px",
        boxSizing: "border-box",
      }}
    >
      <Audio src={staticFile("voiceover/PositiveFeedback/slide-11.mp3")} />
      <div
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 220,
          fontWeight: 700,
          color: ACCENT,
          opacity: counterOpacity,
          scale: pulse,
          lineHeight: 1,
        }}
      >
        {count}
      </div>
      <div style={{ marginTop: 8 }}>
        <KineticWords
          words={beat.words}
          fps={FPS}
          durationInFrames={timing.duration}
          fadeOutFrames={timing.fadeOut}
          fontSize={56}
          color={TEXT}
          accentColor={ACCENT}
        />
      </div>
    </AbsoluteFill>
  );
};

const ReinforcementBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const timing = TIMELINE["slide-15"];
  const fadeStart = timing.duration - timing.fadeOut;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "120px 140px",
        boxSizing: "border-box",
      }}
    >
      <Audio src={staticFile("voiceover/PositiveFeedback/slide-15.mp3")} />
      <div
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: 56,
            color: TEXT,
            opacity: interpolate(
              frame,
              [0, 14, fadeStart, timing.duration],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
            ),
            translate: interpolate(frame, [0, 14], ["0px 26px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE,
            }),
          }}
        >
          It&apos;s
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            fontSize: 140,
            fontWeight: 700,
            color: ACCENT,
            opacity: interpolate(
              frame,
              [13, 27, fadeStart, timing.duration],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
            ),
            scale: interpolate(frame, [13, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.elastic(1),
            }),
          }}
        >
          reinforcement.
        </span>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const creditOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "120px 160px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 52,
          fontWeight: 700,
          color: TEXT,
          textAlign: "center",
          lineHeight: 1.3,
          opacity: titleOpacity,
          maxWidth: 1200,
        }}
      >
        When You Forget to Tell Them They Did a Good Job
      </div>
      <div
        style={{
          marginTop: 28,
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 30,
          color: ACCENT,
          opacity: creditOpacity,
          letterSpacing: 1,
        }}
      >
        José Fernando Costa — Substack
      </div>
    </AbsoluteFill>
  );
};
