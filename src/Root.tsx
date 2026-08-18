import "./index.css";
import { Composition } from "remotion";
import { HowToBeUnderstood, HOW_TO_BE_UNDERSTOOD_DURATION } from "./HowToBeUnderstood/index.tsx";
import { AvoidCommunicationSilos, AVOID_COMMUNICATION_SILOS_DURATION } from "./AvoidCommunicationSilos/index.tsx";
import { HoldYourStandards, HOLD_YOUR_STANDARDS_DURATION } from "./HoldYourStandards/index.tsx";
import { LibDemo, LIB_DEMO_DURATION } from "./lib/__demo__/index.tsx";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HowToBeUnderstood"
        component={HowToBeUnderstood}
        durationInFrames={HOW_TO_BE_UNDERSTOOD_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="AvoidCommunicationSilos"
        component={AvoidCommunicationSilos}
        durationInFrames={AVOID_COMMUNICATION_SILOS_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="HoldYourStandards"
        component={HoldYourStandards}
        durationInFrames={HOLD_YOUR_STANDARDS_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Smoke test for src/lib — not a real video. See src/lib/__demo__/index.tsx. */}
      <Composition
        id="LibDemo"
        component={LibDemo}
        durationInFrames={LIB_DEMO_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
