import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BEAT_ORDER, FPS, TIMELINE, TOTAL_DURATION } from "./timeline";
import { BG, TEXT, ACCENT } from "./layout";
import { World } from "./World";
import { Caption } from "./Hud";
import { ChecklistScene, CtaScene, HookScene, VerdictScene, Wipe } from "./Scenes";
import { BEATS } from "./data";
import { wordsToText } from "./sentences";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const FPS_CL = FPS;
export const CONFUSED_LABELS_DURATION = TOTAL_DURATION;

// No title card in the diagram sense — the video opens on a dedicated Hook
// scene (Beat 0) before the diagram exists, and ends on a closing engagement
// question (Beat 11, CTA) held for 2.5 seconds after its last word. Beats
// 1-6 and 8 play out over the persistent diagram; Beats 7 and 9 wipe to
// dedicated full-screen scenes because their content — a two-sided argument,
// a checklist — is better shown as itself than narrated over the diagram.
export const ConfusedLabels: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <World />
      <Caption />

      {BEAT_ORDER.map((id) => (
        <Sequence key={id} from={TIMELINE[id].from} durationInFrames={TIMELINE[id].duration} name={id}>
          <Audio src={staticFile(`voiceover/ConfusedLabels/${id}.mp3`)} />
        </Sequence>
      ))}

      <Sequence from={TIMELINE["beat-00"].from} durationInFrames={TIMELINE["beat-00"].duration} name="Hook scene">
        <HookScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-07"].from} durationInFrames={TIMELINE["beat-07"].duration} name="Verdict scene">
        <VerdictScene />
      </Sequence>

      <Sequence
        from={TIMELINE["beat-09"].from}
        durationInFrames={TIMELINE["beat-09"].duration}
        name="Checklist scene"
      >
        <ChecklistScene />
      </Sequence>

      <Sequence from={TIMELINE["beat-10"].from} durationInFrames={TIMELINE["beat-10"].duration} name="Closing text">
        <ClosingText />
      </Sequence>

      <Sequence from={TIMELINE["beat-11"].from} durationInFrames={TIMELINE["beat-11"].duration} name="CTA scene">
        <CtaScene />
      </Sequence>

      <Wipe atFrame={TIMELINE["beat-07"].from} />
      <Wipe atFrame={TIMELINE["beat-09"].from} />
    </AbsoluteFill>
  );
};

const CLOSING_WORDS = BEATS["beat-10"].words;
const CLOSING_SPLIT = CLOSING_WORDS.findIndex((w) => w.text.endsWith(","));
const CLOSING_LINE_1 = wordsToText(CLOSING_WORDS.slice(0, CLOSING_SPLIT + 1));
const CLOSING_LINE_2 = wordsToText(CLOSING_WORDS.slice(CLOSING_SPLIT + 1));
const CLOSING_SPEECH_FRAMES = Math.round((CLOSING_WORDS[CLOSING_WORDS.length - 1].endMs * FPS) / 1000);

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
