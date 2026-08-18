import "./index.css";
import { Composition } from "remotion";
import { HowToBeUnderstood, HOW_TO_BE_UNDERSTOOD_DURATION } from "./HowToBeUnderstood";
import { LibDemo, LIB_DEMO_DURATION } from "./lib/__demo__";

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
