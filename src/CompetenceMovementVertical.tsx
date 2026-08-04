import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Word entrance frames below are derived from real ElevenLabs word-level
// timestamps (public/voiceover/CompetenceMovementVertical/slide-0N.json),
// not a fixed stagger, so each word rises when it's actually spoken.

export const CompetenceMovementVertical: React.FC = () => {
  return (
    <AbsoluteFill name="Background" style={{ backgroundColor: "#FFF7ED" }}>
      <Sequence from={0} durationInFrames={98} name="Slide 1 - Competence">
        <SceneOne />
      </Sequence>
      <Sequence from={78} durationInFrames={97} name="Slide 2 - Influence">
        <SceneTwo />
      </Sequence>
      <Sequence from={155} durationInFrames={101} name="Slide 3 - Consistency">
        <SceneThree />
      </Sequence>
      <Sequence from={236} durationInFrames={90} name="Slide 4 - Clarity">
        <SceneFour />
      </Sequence>
      <Sequence from={306} durationInFrames={114} name="Slide 5 - Ideas">
        <SceneFive />
      </Sequence>
    </AbsoluteFill>
  );
};

// Slide 1: word-by-word upward swipe, timed to speech
const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Slide 1 layout"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "140px 80px",
        boxSizing: "border-box",
      }}
    >
      <Audio src={staticFile("voiceover/CompetenceMovementVertical/slide-01.mp3")} />
      <Interactive.Div
        name="Competence sentence"
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 64,
          fontWeight: 400,
          color: "#8A02B2",
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [0, 14, 78, 98], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [0, 14], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Competence
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [23, 37, 78, 98], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [23, 37], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          creates
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            fontSize: 108,
            fontWeight: 700,
            opacity: interpolate(frame, [38, 52, 78, 98], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [38, 52], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          potential.
        </span>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// Slide 2: a different movement animation per word, timed to speech
const SceneTwo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Slide 2 layout"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "140px 80px",
        boxSizing: "border-box",
      }}
    >
      <Audio src={staticFile("voiceover/CompetenceMovementVertical/slide-02.mp3")} />
      <Interactive.Div
        name="Influence sentence"
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 64,
          fontWeight: 400,
          color: "#8A02B2",
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [0, 22, 77, 97], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(
              frame,
              [0, 22],
              ["-160px 0px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
            rotate: interpolate(frame, [0, 22], ["-12deg", "0deg"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Influence
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [24, 48, 77, 97], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            scale: interpolate(frame, [24, 48], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 8 }),
              output: "perceptual-scale",
            }),
          }}
        >
          creates
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            fontSize: 108,
            fontWeight: 700,
            opacity: interpolate(frame, [36, 62, 77, 97], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(
              frame,
              [36, 62],
              ["0px -190px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({ damping: 9 }),
              },
            ),
          }}
        >
          movement.
        </span>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// Slide 3: word-by-word upward swipe, timed to speech
const SceneThree: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Slide 3 layout"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "140px 80px",
        boxSizing: "border-box",
      }}
    >
      <Audio src={staticFile("voiceover/CompetenceMovementVertical/slide-03.mp3")} />
      <Interactive.Div
        name="Consistency sentence"
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 64,
          fontWeight: 400,
          color: "#8A02B2",
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [0, 14, 81, 101], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [0, 14], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Consistency
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [30, 44, 81, 101], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [30, 44], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          creates
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            fontSize: 108,
            fontWeight: 700,
            opacity: interpolate(frame, [42, 56, 81, 101], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [42, 56], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          momentum.
        </span>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// Slide 4: word-by-word upward swipe, timed to speech
const SceneFour: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Slide 4 layout"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "140px 80px",
        boxSizing: "border-box",
      }}
    >
      <Audio src={staticFile("voiceover/CompetenceMovementVertical/slide-04.mp3")} />
      <Interactive.Div
        name="Clarity sentence"
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 64,
          fontWeight: 400,
          color: "#8A02B2",
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [0, 14, 70, 90], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [0, 14], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Clarity
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [17, 31, 70, 90], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [17, 31], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          creates
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            fontSize: 108,
            fontWeight: 700,
            opacity: interpolate(frame, [30, 44, 70, 90], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [30, 44], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          confidence.
        </span>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// Slide 5: closing line, word-by-word upward swipe timed to speech, holds to the end
const SceneFive: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Slide 5 layout"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "140px 80px",
        boxSizing: "border-box",
      }}
    >
      <Audio src={staticFile("voiceover/CompetenceMovementVertical/slide-05.mp3")} />
      <Interactive.Div
        name="Closing sentence"
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 56,
          fontWeight: 400,
          color: "#8A02B2",
          textAlign: "center",
          maxWidth: 860,
          lineHeight: 1.4,
        }}
      >
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [0, 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [0, 14], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Ideas
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [20, 34], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [20, 34], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          only
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [29, 43], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [29, 43], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          matter
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [40, 54], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [40, 54], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          when
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [45, 59], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [45, 59], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          they
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [50, 64], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [50, 64], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          change
        </span>{" "}
        <span
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [62, 76], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [62, 76], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          something.
        </span>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
