import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BEATS } from "./data";
import { wordsToText } from "./sentences";
import { ACCENT, DIM_TEXT, LINE_INACTIVE, TEXT } from "./layout";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const FONT = '"Helvetica Neue", Arial, sans-serif';

// A full-screen color sweep used only when the video switches OUT of the
// diagram into a dedicated typographic scene — a deliberate "the screen
// changes" cue. `atFrame` is a GLOBAL frame number (renders unsequenced, at
// the composition root).
export const Wipe: React.FC<{ atFrame: number }> = ({ atFrame }) => {
  const frame = useCurrentFrame();
  const span = 30;
  if (frame < atFrame - span / 2 - 2 || frame > atFrame + span / 2 + 2) return null;

  const x = interpolate(
    frame,
    [atFrame - span / 2, atFrame, atFrame + span / 2],
    [-100, 0, 100],
    { ...clamp, easing: Easing.inOut(Easing.ease) },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: ACCENT, transform: `translateX(${x}%)`, zIndex: 50 }} />
  );
};

// Beat 7 — "Verdict split": this essay states its own counterweight
// verbatim, so both sides are pulled directly from the real words, no
// original line needed. Left: different words/same decisions is fine.
// Right: different words/different outcomes is the actual problem.
export const VerdictScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-07"].words;

  const introText = wordsToText(words.slice(0, 28));
  const fineText = wordsToText(words.slice(28, 43));
  const problemText = wordsToText(words.slice(43, 55));

  const introOpacity = interpolate(frame, [0, 20, 574, 594], [0, 1, 1, 0], { ...clamp, easing: EASE });

  const fineOpacity = interpolate(frame, [597, 624], [0, 1], clamp);
  const fineShift = interpolate(frame, [597, 627], [26, 0], { ...clamp, easing: EASE });

  const problemOpacity = interpolate(frame, [945, 972], [0, 1], clamp);
  const problemShift = interpolate(frame, [945, 975], [26, 0], { ...clamp, easing: EASE });

  const dividerHeight = interpolate(frame, [594, 634], [0, 220], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          maxWidth: 1300,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 38,
          lineHeight: 1.4,
          color: TEXT,
          opacity: introOpacity,
          padding: "0 120px",
        }}
      >
        {introText}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 70,
          padding: "0 120px",
        }}
      >
        <div style={{ flex: 1, textAlign: "right", opacity: fineOpacity, translate: `${fineShift}px 0px` }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: DIM_TEXT,
              marginBottom: 14,
            }}
          >
            That part is fine
          </div>
          <div style={{ fontFamily: FONT, fontSize: 30, lineHeight: 1.4, color: TEXT }}>{fineText}</div>
        </div>

        <div style={{ width: 2, height: dividerHeight, backgroundColor: LINE_INACTIVE }} />

        <div style={{ flex: 1, opacity: problemOpacity, translate: `${-problemShift}px 0px` }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: ACCENT,
              marginBottom: 14,
            }}
          >
            This is the problem
          </div>
          <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, lineHeight: 1.4, color: ACCENT }}>
            {problemText}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LIST_ITEM_FRAMES = [348, 421, 497, 600];

// Beat 9 — "Checklist": the essay's own clarifying questions, revealed one
// at a time on their own real timing, then the resolving statement.
export const ChecklistScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-09"].words;

  const introText = wordsToText(words.slice(0, 14));
  const items = [
    wordsToText(words.slice(14, 18)),
    wordsToText(words.slice(18, 22)),
    wordsToText(words.slice(22, 28)),
    wordsToText(words.slice(28, 40)),
  ];
  const resolveText = wordsToText(words.slice(40, 50));

  const introOpacity = interpolate(frame, [0, 20, 324, 344], [0, 1, 1, 0], { ...clamp, easing: EASE });

  const listOpacity = interpolate(frame, [344, 364, 861, 881], [0, 1, 1, 0], { ...clamp, easing: EASE });

  const resolveOpacity = interpolate(frame, [881, 906], [0, 1], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          maxWidth: 1100,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 38,
          lineHeight: 1.4,
          color: TEXT,
          opacity: introOpacity,
          padding: "0 150px",
        }}
      >
        {introText}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 26, opacity: listOpacity }}>
        {items.map((item, i) => (
          <ListRow key={item} text={item} revealFrame={LIST_ITEM_FRAMES[i]} frame={frame} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          maxWidth: 1100,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.4,
          color: ACCENT,
          opacity: resolveOpacity,
          padding: "0 150px",
        }}
      >
        {resolveText}
      </div>
    </AbsoluteFill>
  );
};

// Beat 0 — "Hook": a cold open before the diagram exists. The setup lands
// as one bold statement, then the punchline settles in quieter beneath it —
// both pulled verbatim from the real words.
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-00"].words;

  const setupText = wordsToText(words.slice(0, 14));
  const punchlineText = wordsToText(words.slice(14, 20));

  const setupOpacity = interpolate(frame, [10, 38], [0, 1], { ...clamp, easing: EASE });
  const setupShift = interpolate(frame, [10, 42], [22, 0], { ...clamp, easing: EASE });

  const punchlineOpacity = interpolate(frame, [332, 362], [0, 1], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
        padding: "0 200px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 52,
          fontWeight: 700,
          lineHeight: 1.35,
          color: TEXT,
          opacity: setupOpacity,
          translate: `0px ${setupShift}px`,
        }}
      >
        {setupText}
      </div>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 34,
          lineHeight: 1.4,
          color: ACCENT,
          opacity: punchlineOpacity,
        }}
      >
        {punchlineText}
      </div>
    </AbsoluteFill>
  );
};

// CTA — a quieter, reflective closing question (not "like and subscribe"):
// the diagram has already receded, and this is the last thing on screen
// before the video ends.
export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-11"].words;
  const questionText = wordsToText(words);

  const opacity = interpolate(frame, [15, 45], [0, 1], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 220px" }}>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 42,
          fontStyle: "italic",
          lineHeight: 1.5,
          color: DIM_TEXT,
          opacity,
        }}
      >
        {questionText}
      </div>
    </AbsoluteFill>
  );
};

const ListRow: React.FC<{ text: string; revealFrame: number; frame: number }> = ({
  text,
  revealFrame,
  frame,
}) => {
  const opacity = interpolate(frame, [revealFrame, revealFrame + 18], [0, 1], { ...clamp, easing: EASE });
  const tickWidth = interpolate(frame, [revealFrame, revealFrame + 18], [0, 40], { ...clamp, easing: EASE });
  const shift = interpolate(frame, [revealFrame, revealFrame + 22], [18, 0], { ...clamp, easing: EASE });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, opacity, translate: `${shift}px 0px` }}>
      <div style={{ width: tickWidth, height: 3, backgroundColor: ACCENT }} />
      <div style={{ fontFamily: FONT, fontSize: 36, color: TEXT }}>{text}</div>
    </div>
  );
};
