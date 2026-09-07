import "./index.css";
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
