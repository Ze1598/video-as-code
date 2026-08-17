import "./index.css";
import { Composition } from "remotion";
import { PositiveFeedbackV2, POSITIVE_FEEDBACK_V2_DURATION } from "./PositiveFeedbackV2";
import { ConfusedLabels, CONFUSED_LABELS_DURATION } from "./ConfusedLabels";
import { PositiveFeedbackV3, POSITIVE_FEEDBACK_V3_DURATION } from "./PositiveFeedbackV3";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
    </>
  );
};
