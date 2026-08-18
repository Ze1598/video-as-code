import type { Slide } from "../../scripts/lib/elevenlabs.ts";

export const SLIDES: Slide[] = [
  {
    id: "beat-00",
    text: "A team finished a project. Every test passed. The forms worked, the notifications ran, the approval logic held under every check they threw at it. Then someone in the room asked one question nobody had asked before any of it was built — and the whole thing came apart.",
  },
  {
    id: "beat-01",
    text: "It started with an instruction: rebuild an old approval workflow, on a new internal platform. Management expected the new version to match the old one exactly, feature for feature. Nobody on the team could say who actually used the workflow, or what it was supposed to accomplish. That wasn't the assignment. The assignment was to rebuild it.",
  },
  {
    id: "beat-02",
    text: "So the team did what a good team does with an assignment like that — they got specific. Which fields were mandatory. Who could approve each stage. When the notifications should fire. What belonged in the final report. Every one of those was a fair question, and every one moved the build forward.",
  },
  {
    id: "beat-03",
    text: "One person asked a different question: why does this workflow still need to exist? Nobody in the project could answer it. Finding that answer meant tracing a decision back through several managers, reopening a scope that was supposed to be closed, maybe delaying the whole migration. Reproducing the workflow, exactly as it already existed, was the easier path. So that's what they did.",
  },
  {
    id: "beat-04",
    text: "They rebuilt the forms, the approval stages, the notifications, the permissions, the reports. Where the old logic looked strange, or made no obvious sense, they left it alone — changing it would have needed sign-off from an owner nobody could name. The gap between what they were building and why sat there, quietly, through the entire build.",
  },
  {
    id: "beat-05",
    text: "Development finished. The release was ready. Then someone asked a simple question: who needs access to this? Nobody had a user list.",
  },
  {
    id: "beat-06",
    text: "The next question was who would own it after launch. That answer was missing too. The project manager set up a meeting with operations. Operations brought in a department head. The department head pointed to product management. Product management pulled in an architect, who remembered part of the original system. Every conversation produced one more name, one more meeting. Senior people spent hours trying to reconstruct the business reason behind a product that was already finished and ready to ship.",
  },
  {
    id: "beat-07",
    text: "They didn't create value and fail to communicate it. All the team built was bloat. The forms worked. The notifications ran. The approval logic passed every test. None of it had a purpose.",
  },
  {
    id: "beat-08",
    text: "Building without a clear purpose doesn't avoid the requirements work. It pushes that work until after the organization pays for design, development, testing, deployment, security, and support. Once the product exists, people have to spend more time deciding whether to own it, maintain it, or remove it. We've always done it this way isn't a requirement. Management asked for it isn't one either. If management can't name the user, the problem, or the outcome, management hasn't provided a requirement. It's passed down an instruction without a purpose.",
  },
  {
    id: "beat-09",
    text: "Before work begins, ask three questions: Who is this for? What problem does it solve? What changes because it exists? The answers don't need to predict every implementation detail. They need to establish why the work deserves to exist. If nobody can answer them, stop. Don't build faster on a requirement nobody has questioned in years. Purpose isn't something an organization should discover after it's already paid for delivery.",
  },
  {
    id: "beat-10",
    text: "Somewhere on your team right now — is there a project moving forward that nobody has been able to name a user for?",
  },
];
