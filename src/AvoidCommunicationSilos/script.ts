import type { Slide } from "../../scripts/lib/elevenlabs.ts";

export const SLIDES: Slide[] = [
  {
    id: "beat-00",
    text: "One question. Three teams. And weeks spent passing it between them — before anyone thought to just ask it directly.",
  },
  {
    id: "beat-01",
    text: "A solution design team met with operations to define a new customer reporting process, due in six weeks. The engineers who'd build it weren't in the room — technical design would come later. The designers documented the workflow, the reporting rules, the data it would need. They sent the requirements to engineering, and booked a playback to walk them through it.",
  },
  {
    id: "beat-02",
    text: "Engineering asked a direct question: what happens when operations corrects a record after the reporting period closes? The designers didn't know. They wrote the question down and scheduled a follow-up with operations. Operations explained the correction process. The designers updated the requirements — and booked another playback.",
  },
  {
    id: "beat-03",
    text: "This time, an engineer asked two things: which system stored the corrected value, and whether the report needed to update immediately. The designers could answer the first question. Not the second. Another follow-up went on the calendar.",
  },
  {
    id: "beat-04",
    text: "Soon the project had requirement sessions. Technical playbacks. Follow-ups. Alignment calls. Every team was attending meetings about the work. Nobody had started building it.",
  },
  {
    id: "beat-05",
    text: "The company had separated the people who understood the problem from the people who had to solve it — then tried to repair that separation with more meetings. Each handoff removed context. Operations answered the question the designers carried back, but couldn't hear why engineering had asked it. Engineering got the answer, but not the discussion that shaped it. New information created new questions — and those traveled back through the same route.",
  },
  {
    id: "beat-06",
    text: "The meetings became the machinery that kept the communication silos thriving.",
  },
  {
    id: "beat-07",
    text: "Eventually, operations, design, and engineering joined the same call. An engineer asked an operator to show how a correction worked. The operator opened the system and walked through it. The corrected value came from a different source than the designers had assumed. The report didn't need an immediate update. A question that had traveled through several meetings took minutes to resolve — once the people involved could speak directly.",
  },
  {
    id: "beat-08",
    text: "Specialized teams aren't the problem. Designers should design. Engineers should build. Operations shouldn't attend every technical discussion. The problem begins when specialization controls who is allowed to exchange information. If the builder can only question the requirement through a designer, the designer becomes a courier. Every missing detail creates another trip.",
  },
  {
    id: "beat-09",
    text: "For work that depends on several disciplines, bring the smallest complete group into the first working conversation: someone who understands the problem, someone who can shape the solution, and someone who must build it. Let them test assumptions while the source is present. Record the decisions — then let everyone leave and do the work.",
  },
  {
    id: "beat-10",
    text: "Don't invite everyone to everything. But when the same topic needs a playback, a follow-up, and another alignment call — stop improving the handoff. Simply stop designing calendars around the handoff.",
  },
  {
    id: "beat-11",
    text: "How many of your meetings exist to repair a conversation that should have just happened directly?",
  },
];
