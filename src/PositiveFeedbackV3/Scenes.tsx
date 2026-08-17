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

  return <AbsoluteFill style={{ backgroundColor: ACCENT, transform: `translateX(${x}%)`, zIndex: 50 }} />;
};

// Beat 0 — "Hook": a cold open before the diagram exists. The setup lands
// as one bold statement, then the punchline settles in quieter beneath it —
// both pulled verbatim from the real words.
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-00"].words;

  const setupText = wordsToText(words.slice(0, 8));
  const punchlineText = wordsToText(words.slice(8, 21));

  const setupOpacity = interpolate(frame, [10, 38], [0, 1], { ...clamp, easing: EASE });
  const setupShift = interpolate(frame, [10, 42], [22, 0], { ...clamp, easing: EASE });

  const punchlineOpacity = interpolate(frame, [236, 266], [0, 1], { ...clamp, easing: EASE });

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

// Beat 7 — "Verdict split": preserves the legitimate action (praising her
// work to leadership) on one side, isolates the actual mistake on the other.
export const VerdictScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-07"].words;

  const introText = wordsToText(words.slice(0, 6));
  const rightText = wordsToText(words.slice(6, 15));
  const mistakeText = wordsToText(words.slice(15, 26));

  const introOpacity = interpolate(frame, [0, 20, 86, 106], [0, 1, 1, 0], { ...clamp, easing: EASE });

  const rightOpacity = interpolate(frame, [109, 136], [0, 1], clamp);
  const rightShift = interpolate(frame, [109, 139], [26, 0], { ...clamp, easing: EASE });

  const mistakeOpacity = interpolate(frame, [304, 331], [0, 1], clamp);
  const mistakeShift = interpolate(frame, [304, 334], [26, 0], { ...clamp, easing: EASE });

  const dividerHeight = interpolate(frame, [106, 146], [0, 220], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          maxWidth: 1200,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 40,
          lineHeight: 1.4,
          color: TEXT,
          opacity: introOpacity,
          padding: "0 120px",
        }}
      >
        {introText}
      </div>

      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 70, padding: "0 120px" }}
      >
        <div style={{ flex: 1, textAlign: "right", opacity: rightOpacity, translate: `${rightShift}px 0px` }}>
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
            The right call
          </div>
          <div style={{ fontFamily: FONT, fontSize: 32, lineHeight: 1.4, color: TEXT }}>{rightText}</div>
        </div>

        <div style={{ width: 2, height: dividerHeight, backgroundColor: LINE_INACTIVE }} />

        <div style={{ flex: 1, opacity: mistakeOpacity, translate: `${-mistakeShift}px 0px` }}>
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
            The mistake
          </div>
          <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 700, lineHeight: 1.4, color: ACCENT }}>
            {mistakeText}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LIST_ITEM_FRAMES = [265, 311, 362];

// Beat 8 — "Reinforcement": wipes to a dedicated scene and lists the three
// concrete things reinforcement says, one at a time on real timing, then
// wipes (internally) to the contrasting "without it" consequence.
export const ReinforcementScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-08"].words;

  const introText = wordsToText(words.slice(0, 5));
  const headerText = wordsToText(words.slice(5, 7)).replace(/,$/, "");
  const items = [
    normalizeListItem(wordsToText(words.slice(9, 11))),
    normalizeListItem(wordsToText(words.slice(11, 13))),
    normalizeListItem(wordsToText(words.slice(13, 16))),
  ];
  const withoutText = wordsToText(words.slice(16, 30));

  const introOpacity = interpolate(frame, [0, 20, 126, 146], [0, 1, 1, 0], { ...clamp, easing: EASE });

  const headerOpacity = interpolate(frame, [150, 176, 392, 412], [0, 1, 1, 0], { ...clamp, easing: EASE });
  const listOpacity = interpolate(frame, [392, 412], [1, 0], clamp);

  const withoutOpacity = interpolate(frame, [412, 437], [0, 1], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          maxWidth: 1000,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 44,
          color: TEXT,
          opacity: introOpacity,
        }}
      >
        {introText}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 30 }}>
        <div style={{ fontFamily: FONT, fontSize: 60, fontWeight: 700, color: ACCENT, opacity: headerOpacity }}>
          {headerText}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, opacity: listOpacity }}>
          {items.map((item, i) => (
            <ListRow key={item} text={item} revealFrame={LIST_ITEM_FRAMES[i]} frame={frame} />
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          maxWidth: 1200,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 42,
          lineHeight: 1.45,
          color: DIM_TEXT,
          opacity: withoutOpacity,
          padding: "0 160px",
        }}
      >
        {withoutText}
      </div>
    </AbsoluteFill>
  );
};

function normalizeListItem(raw: string): string {
  const withPeriod = raw.replace(/,$/, ".");
  return withPeriod.charAt(0).toUpperCase() + withPeriod.slice(1);
}

const ListRow: React.FC<{ text: string; revealFrame: number; frame: number }> = ({ text, revealFrame, frame }) => {
  const opacity = interpolate(frame, [revealFrame, revealFrame + 18], [0, 1], { ...clamp, easing: EASE });
  const tickWidth = interpolate(frame, [revealFrame, revealFrame + 18], [0, 40], { ...clamp, easing: EASE });
  const shift = interpolate(frame, [revealFrame, revealFrame + 22], [18, 0], { ...clamp, easing: EASE });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, opacity, translate: `${shift}px 0px` }}>
      <div style={{ width: tickWidth, height: 3, backgroundColor: ACCENT }} />
      <div style={{ fontFamily: FONT, fontSize: 40, color: TEXT }}>{text}</div>
    </div>
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
