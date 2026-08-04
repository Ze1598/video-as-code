import {
  AbsoluteFill,
  Easing,
  Interactive,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";

export const CompetenceMovement: React.FC = () => {
  return (
    <AbsoluteFill
      name="Background"
      style={{ backgroundColor: "#F6F1E7" }}
    >
      <Sequence from={0} durationInFrames={100} name="Scene 1 - Competence">
        <SceneOne />
      </Sequence>
      <Sequence from={80} durationInFrames={140} name="Scene 2 - Influence">
        <SceneTwo />
      </Sequence>
      <Sequence from={200} durationInFrames={100} name="Scene 3 - Ideas">
        <SceneThree />
      </Sequence>
    </AbsoluteFill>
  );
};

const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Scene 1 layout"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "100px 80px",
        boxSizing: "border-box",
      }}
    >
      <Interactive.Div
        name="Competence line"
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 80,
          fontWeight: 400,
          color: "#2B241E",
          textAlign: "center",
          maxWidth: 1600,
          opacity: interpolate(frame, [0, 20, 80, 100], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 20], ["0px 30px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Competence creates{" "}
        <span style={{ fontSize: 130, fontWeight: 700 }}>potential.</span>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const SceneTwo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Scene 2 layout"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "100px 80px",
        boxSizing: "border-box",
      }}
    >
      <Interactive.Div
        name="Influence line"
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 80,
          fontWeight: 400,
          color: "#2B241E",
          textAlign: "center",
          maxWidth: 1600,
          opacity: interpolate(frame, [0, 20, 120, 140], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 20], ["0px 30px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Influence creates{" "}
        <span style={{ fontSize: 130, fontWeight: 700 }}>movement.</span>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const SceneThree: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Scene 3 layout"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "100px 80px",
        boxSizing: "border-box",
      }}
    >
      <Interactive.Div
        name="Closing line"
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 72,
          fontWeight: 400,
          color: "#2B241E",
          textAlign: "center",
          maxWidth: 1500,
          lineHeight: 1.35,
          opacity: interpolate(frame, [0, 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 25], ["0px 30px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Ideas only matter when they change something.
      </Interactive.Div>
    </AbsoluteFill>
  );
};
