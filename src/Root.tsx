import "./index.css";
import { ChangeBrightSpot, ChangeBrightSpotPreview } from "./ChangeBrightSpot/index.tsx";
import { movie as brightSpotMovie } from "./ChangeBrightSpot/production.ts";
import { previewMovie as brightSpotPreview } from "./ChangeBrightSpot/preview.ts";
import { ChangeUpfrontCostPreview, ChangeUpfrontCostProduction } from "./ChangeUpfrontCost/index.tsx";
import { movie as changeUpfrontCostMovie } from "./ChangeUpfrontCost/production.ts";
import { previewMovie } from "./ChangeUpfrontCost/preview.ts";
import { Composition } from "remotion";
import { HowToBeUnderstood, HOW_TO_BE_UNDERSTOOD_DURATION } from "./HowToBeUnderstood/index.tsx";
import { AvoidCommunicationSilos, AVOID_COMMUNICATION_SILOS_DURATION } from "./AvoidCommunicationSilos/index.tsx";
import { HoldYourStandards, HOLD_YOUR_STANDARDS_DURATION } from "./HoldYourStandards/index.tsx";
import { BuildSomethingPurposeful, BUILD_SOMETHING_PURPOSEFUL_DURATION } from "./BuildSomethingPurposeful/index.tsx";
import { FixBadActor, FIX_BAD_ACTOR_DURATION } from "./FixBadActor/index.tsx";
import { LeadWithWhatMatters, LEAD_WITH_WHAT_MATTERS_DURATION } from "./LeadWithWhatMatters/index.tsx";
import { WinningTheArgument, WINNING_THE_ARGUMENT_DURATION } from "./WinningTheArgument/index.tsx";
import { AddingMorePeople, ADDING_MORE_PEOPLE_DURATION } from "./AddingMorePeople/index.tsx";
import { DocumentProcesses, DOCUMENT_PROCESSES_DURATION } from "./DocumentProcesses/index.tsx";
import { StopSellingDiagram, STOP_SELLING_DIAGRAM_DURATION } from "./StopSellingDiagram/index.tsx";
import { DoNothing, DO_NOTHING_DURATION } from "./DoNothing/index.tsx";
import { ReversibleDecisions, REVERSIBLE_DECISIONS_DURATION } from "./ReversibleDecisions/index.tsx";
import { YesCosts, YES_COSTS_DURATION } from "./YesCosts/index.tsx";
import { LuckisNotTrend, LUCKIS_NOT_TREND_DURATION } from "./LuckisNotTrend/index.tsx";
import { ProveDecisionWrong, PROVE_DECISION_WRONG_DURATION } from "./ProveDecisionWrong/index.tsx";
import { FriendlyTeam, FRIENDLY_TEAM_DURATION } from "./FriendlyTeam/index.tsx";
import { AskingForThoughts, ASKING_FOR_THOUGHTS_DURATION } from "./AskingForThoughts/index.tsx";
import { DidntLearn, DIDNT_LEARN_DURATION } from "./DidntLearn/index.tsx";
import {
  PerformanceVsMotivation,
  PERFORMANCE_VS_MOTIVATION_DURATION,
} from "./PerformanceVsMotivation/index.tsx";
import {
  DontHelpAgainstWill,
  DONT_HELP_AGAINST_WILL_DURATION,
} from "./DontHelpAgainstWill/index.tsx";
import { ChangingTooMuch, CHANGING_TOO_MUCH_DURATION } from "./ChangingTooMuch/index.tsx";
import { ChangingTooMuchV2, CHANGING_TOO_MUCH_V2_DURATION } from "./ChangingTooMuchV2/index.tsx";
import { ChangingTooMuchV3, CHANGING_TOO_MUCH_V3_DURATION } from "./ChangingTooMuchV3/index.tsx";
import { ChangingTooMuchV4, CHANGING_TOO_MUCH_V4_DURATION } from "./ChangingTooMuchV4/index.tsx";
import { ChangingTooMuchV5, CHANGING_TOO_MUCH_V5_DURATION } from "./ChangingTooMuchV5/index.tsx";
import { ChangingTooMuchV6, CHANGING_TOO_MUCH_V6_DURATION } from "./ChangingTooMuchV6/index.tsx";
import { ChangingTooMuchV7, CHANGING_TOO_MUCH_V7_DURATION } from "./ChangingTooMuchV7/index.tsx";
import { ChangingTooMuchV8, CHANGING_TOO_MUCH_V8_DURATION } from "./ChangingTooMuchV8/index.tsx";
import { ChangingTooMuchV9, CHANGING_TOO_MUCH_V9_DURATION } from "./ChangingTooMuchV9/index.tsx";
import { ChangingTooMuchV10, CHANGING_TOO_MUCH_V10_DURATION } from "./ChangingTooMuchV10/index.tsx";
import { ChangingTooMuchV11, CHANGING_TOO_MUCH_V11_DURATION } from "./ChangingTooMuchV11/index.tsx";
import { LibDemo, LIB_DEMO_DURATION } from "./archive/lib/__demo__/index.tsx";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="ChangeBrightSpot" component={ChangeBrightSpot} durationInFrames={brightSpotMovie.duration} fps={brightSpotMovie.fps} width={1920} height={1080} />
      <Composition id="ChangeBrightSpotPreview" component={ChangeBrightSpotPreview} durationInFrames={brightSpotPreview.duration} fps={brightSpotPreview.fps} width={1920} height={1080} />
      <Composition id="ChangeUpfrontCost" component={ChangeUpfrontCostProduction} durationInFrames={changeUpfrontCostMovie.duration} fps={changeUpfrontCostMovie.fps} width={1920} height={1080} />
      <Composition id="ChangeUpfrontCostPreview" component={ChangeUpfrontCostPreview} durationInFrames={previewMovie.duration} fps={previewMovie.fps} width={1920} height={1080} />
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

      <Composition
        id="BuildSomethingPurposeful"
        component={BuildSomethingPurposeful}
        durationInFrames={BUILD_SOMETHING_PURPOSEFUL_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="FixBadActor"
        component={FixBadActor}
        durationInFrames={FIX_BAD_ACTOR_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="LeadWithWhatMatters"
        component={LeadWithWhatMatters}
        durationInFrames={LEAD_WITH_WHAT_MATTERS_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="WinningTheArgument"
        component={WinningTheArgument}
        durationInFrames={WINNING_THE_ARGUMENT_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="AddingMorePeople"
        component={AddingMorePeople}
        durationInFrames={ADDING_MORE_PEOPLE_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="DocumentProcesses"
        component={DocumentProcesses}
        durationInFrames={DOCUMENT_PROCESSES_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="StopSellingDiagram"
        component={StopSellingDiagram}
        durationInFrames={STOP_SELLING_DIAGRAM_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="DoNothing"
        component={DoNothing}
        durationInFrames={DO_NOTHING_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="ReversibleDecisions"
        component={ReversibleDecisions}
        durationInFrames={REVERSIBLE_DECISIONS_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="YesCosts"
        component={YesCosts}
        durationInFrames={YES_COSTS_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="LuckisNotTrend"
        component={LuckisNotTrend}
        durationInFrames={LUCKIS_NOT_TREND_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="ProveDecisionWrong"
        component={ProveDecisionWrong}
        durationInFrames={PROVE_DECISION_WRONG_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="FriendlyTeam"
        component={FriendlyTeam}
        durationInFrames={FRIENDLY_TEAM_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="AskingForThoughts"
        component={AskingForThoughts}
        durationInFrames={ASKING_FOR_THOUGHTS_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="DidntLearn"
        component={DidntLearn}
        durationInFrames={DIDNT_LEARN_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="PerformanceVsMotivation"
        component={PerformanceVsMotivation}
        durationInFrames={PERFORMANCE_VS_MOTIVATION_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="DontHelpAgainstWill"
        component={DontHelpAgainstWill}
        durationInFrames={DONT_HELP_AGAINST_WILL_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="ChangingTooMuch"
        component={ChangingTooMuch}
        durationInFrames={CHANGING_TOO_MUCH_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="ChangingTooMuchV2"
        component={ChangingTooMuchV2}
        durationInFrames={CHANGING_TOO_MUCH_V2_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="ChangingTooMuchV3"
        component={ChangingTooMuchV3}
        durationInFrames={CHANGING_TOO_MUCH_V3_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="ChangingTooMuchV4"
        component={ChangingTooMuchV4}
        durationInFrames={CHANGING_TOO_MUCH_V4_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Smoke test for src/lib — not a real video. See src/lib/__demo__/index.tsx. */}
      <Composition id="ChangingTooMuchV5" component={ChangingTooMuchV5} durationInFrames={CHANGING_TOO_MUCH_V5_DURATION} fps={60} width={1920} height={1080} />
      <Composition id="ChangingTooMuchV6" component={ChangingTooMuchV6} durationInFrames={CHANGING_TOO_MUCH_V6_DURATION} fps={60} width={1920} height={1080} />
      <Composition id="ChangingTooMuchV7" component={ChangingTooMuchV7} durationInFrames={CHANGING_TOO_MUCH_V7_DURATION} fps={60} width={1920} height={1080} />
      <Composition id="ChangingTooMuchV8" component={ChangingTooMuchV8} durationInFrames={CHANGING_TOO_MUCH_V8_DURATION} fps={60} width={1920} height={1080} />
      <Composition id="ChangingTooMuchV9" component={ChangingTooMuchV9} durationInFrames={CHANGING_TOO_MUCH_V9_DURATION} fps={60} width={1920} height={1080} />
      <Composition id="ChangingTooMuchV10" component={ChangingTooMuchV10} durationInFrames={CHANGING_TOO_MUCH_V10_DURATION} fps={60} width={1920} height={1080} />
      <Composition id="ChangingTooMuchV11" component={ChangingTooMuchV11} durationInFrames={CHANGING_TOO_MUCH_V11_DURATION} fps={60} width={1920} height={1080} />
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
