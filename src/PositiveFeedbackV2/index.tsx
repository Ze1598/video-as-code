import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BEAT_ORDER, FPS, TIMELINE, TOTAL_DURATION } from "./timeline";
import { BG, TEXT, ACCENT } from "./layout";
import { World } from "./World";
import { Caption, MonthsBar } from "./Hud";
import { ReinforcementScene, VerdictScene, Wipe } from "./Scenes";
import { BEATS } from "./data";
import { wordsToText } from "./sentences";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const FPS_V2 = FPS;
export const POSITIVE_FEEDBACK_V2_DURATION = TOTAL_DURATION;

// No title card, no end card: the video opens directly on Beat 1's diagram
// and ends with the closing line held on screen for 2 seconds after the last
// word, per the "jump into the content" note. Beats 1-6 play out over the
// persistent diagram; Beats 7 and 8 wipe to dedicated full-screen scenes
// (see Scenes.tsx) because their content — a two-sided verdict, a list of
// three things — is better shown as itself than narrated over the graph.
export const PositiveFeedbackV2: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <MonthsBar />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/PositiveFeedbackV2/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-07"].from} durationInFrames={TIMELINE["beat-07"].duration} name="Verdict scene">
        <VerdictScene />
      </Sequence>

      <Sequence
        from={TIMELINE["beat-08"].from}
        durationInFrames={TIMELINE["beat-08"].duration}
        name="Reinforcement scene"
      >
        <ReinforcementScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-09"].from} durationInFrames={TIMELINE["beat-09"].duration} name="Closing text">
        <ClosingText />
      </Sequence>

      <Wipe atFrame={TIMELINE["beat-07"].from} />
      <Wipe atFrame={TIMELINE["beat-08"].from} />
    </AbsoluteFill>
  );
};

const CLOSING_SPEECH_FRAMES = 306;

// Line break derived from the real words (split right after the comma), not
// a hand-retyped copy — so this can never again quietly drop a word like
// "performance" the way a hand-typed version did.
const CLOSING_WORDS = BEATS["beat-09"].words;
const CLOSING_SPLIT = CLOSING_WORDS.findIndex((w) => w.text.endsWith(","));
const CLOSING_LINE_1 = wordsToText(CLOSING_WORDS.slice(0, CLOSING_SPLIT + 1));
const CLOSING_LINE_2 = wordsToText(CLOSING_WORDS.slice(CLOSING_SPLIT + 1));

const ClosingText: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [10, 30], [0, 1], { ...clamp, easing: EASE });
  const glow = interpolate(frame, [60, CLOSING_SPEECH_FRAMES], [0, 16], clamp);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "120px 220px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 58,
          fontWeight: 700,
          color: TEXT,
          textAlign: "center",
          lineHeight: 1.4,
          opacity,
          textShadow: `0 0 ${glow}px ${ACCENT}`,
        }}
      >
        {CLOSING_LINE_1}
        <br />
        <span style={{ color: ACCENT }}>{CLOSING_LINE_2}</span>
      </div>
    </AbsoluteFill>
  );
};
