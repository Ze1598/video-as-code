import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { CompetenceMovement } from "./CompetenceMovement";
import { CompetenceMovementVertical } from "./CompetenceMovementVertical";
import { PositiveFeedback, POSITIVE_FEEDBACK_DURATION } from "./PositiveFeedback";
import { PositiveFeedbackV2, POSITIVE_FEEDBACK_V2_DURATION } from "./PositiveFeedbackV2";
import { ConfusedLabels, CONFUSED_LABELS_DURATION } from "./ConfusedLabels";
import { PositiveFeedbackV3, POSITIVE_FEEDBACK_V3_DURATION } from "./PositiveFeedbackV3";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CompetenceMovement"
        component={CompetenceMovement}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="CompetenceMovementVertical"
        component={CompetenceMovementVertical}
        durationInFrames={420}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="PositiveFeedback"
        component={PositiveFeedback}
        durationInFrames={POSITIVE_FEEDBACK_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="PositiveFeedbackV2"
        component={PositiveFeedbackV2}
        durationInFrames={POSITIVE_FEEDBACK_V2_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="ConfusedLabels"
        component={ConfusedLabels}
        durationInFrames={CONFUSED_LABELS_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="PositiveFeedbackV3"
        component={PositiveFeedbackV3}
        durationInFrames={POSITIVE_FEEDBACK_V3_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
