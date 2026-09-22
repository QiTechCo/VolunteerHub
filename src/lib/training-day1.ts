export type TrainingExcerpt = {
  quote: string;
  location: string;
};

export type TrainingModule = {
  id: "power" | "purpose" | "people";
  title: string;
  leaveWith: string;
  source: string;
  excerpts: TrainingExcerpt[];
  prompts: string[];
};

/** Day 1 notebook copy. Excerpts only — not the full packets. */
export const DAY1_SOURCE_NOTE =
  "Organize NC Fellowship Training Intensive, People, Power, Purpose participant resource packets (Franklinton Center at Bricks, August 2023). Short excerpts for new-volunteer Day 1; not the full packets.";

export const DAY1_MODULES: TrainingModule[] = [
  {
    id: "power",
    title: "Power",
    leaveWith:
      "Power is the ability to mobilize resources to meet needs — to achieve a purpose. Day 1 asks you to notice power-over, power-under, and power-with, and to see that campaigns also fight over what even gets on the table.",
    source:
      "Week 2 packet — Power (15–18 Aug 2023), Organize NC Fellowship Training Intensive.",
    excerpts: [
      {
        quote:
          "At its core, power means the ability to mobilize resources to attend to needs. Or as Martin Luther King put it, “power is the ability to achieve purpose.”",
        location: "Dominant and Liberatory Power",
      },
      {
        quote:
          "Dominant power produces negative patterns of domination (power-over) and victimhood (power-under). Liberatory power operates through power-within and power-with.",
        location: "Dominant and Liberatory Power",
      },
      {
        quote:
          "The first dimension of power is the one most clearly displayed in moments of explicit conflict… We build power on this dimension by organizing and mobilizing people to exert pressure on targets and win demands. The second dimension of power is about the ability to shape the political agenda, to define what is and what is not up for debate.",
        location: "3 Dimensions of Power",
      },
    ],
    prompts: [
      "What have been my experiences with power?",
      "How can I stand more fully in my power — and help others stand in theirs?",
      "What power do our people have, what power do we oppose, and what power will we need to build?",
    ],
  },
  {
    id: "purpose",
    title: "Purpose",
    leaveWith:
      "Purpose is the why — individual and shared. A campaign plan names a goal, reads the current ground, then chooses strategy and tactics. Cutting a large problem into a winnable issue is how volunteers spend time on something that can actually move.",
    source:
      "Week 3 packet — Purpose (22–25 Aug 2023), Organize NC Fellowship Training Intensive.",
    excerpts: [
      {
        quote:
          "Broadly, we can define purpose as an intention or aim that motivates us to take action. Our purpose is our “why” or our North Star—what causes us to get out of bed in the morning, to keep going when the going gets tough, and to reorient ourselves when we get off track.",
        location: "Purpose",
      },
      {
        quote:
          "A plan is a sequence of actions that we carry out in order to achieve an intended purpose. Consciously or unconsciously, our plans are often composed of: Goal — where do we want to go? Analysis — where are we at right now? Strategy — what overall approach will best get us from here to there? Tactics — how will we carry it out?",
        location: "Purpose",
      },
      {
        quote:
          "First, we cut the issue by turning a larger problem into a smaller more manageable issue. Breaking down bigger-picture problems into more manageable parts allows us to build and win campaigns around focused issues. In this way, the larger problem gets addressed piece by piece.",
        location: "Campaign Goals: Where Do We Want to Go?",
      },
    ],
    prompts: [
      "How can I support people in using their power to accomplish real change?",
      "When you are 100, what will allow you to look back and feel that you have lived into your purpose?",
      "What is one issue-sized piece of a bigger problem this campaign can actually work this week?",
    ],
  },
  {
    id: "people",
    title: "People",
    leaveWith:
      "Organizing turns voluntary effort into shared power by finding people, telling a public story, and building relationships on shared interest — not on pretending you have no self-interest.",
    source:
      "Week 1 packet — People (8–11 Aug 2023), Organize NC Fellowship Training Intensive.",
    excerpts: [
      {
        quote:
          "Organizing is when people combine the individual resources they have into the shared power that they need to achieve a common purpose.",
        location: "Workshop Goals and Why We’re Here",
      },
      {
        quote:
          "Self-interest is a relational concept, a medium for exchange in the public arena. Where selfishness puts self before others, and selflessness puts others before self, self-interest is about understanding “self with others” — the basis of relationality and acting together.",
        location: "Issues, Interests & Values",
      },
      {
        quote:
          "Each of us can learn to tell a story that can move others to action. We each have stories of challenge, or we wouldn’t think the world needed changing. And we each have stories of hope, or we wouldn’t think we could change it. You will learn to tell a story about yourself (story of self), the community whom you are organizing (story of us), and the action required to create change (story of now).",
        location: "Story of Self: Communicating My Values to Others",
      },
    ],
    prompts: [
      "Who am I? Who are my people?",
      "How can I build public relationships rooted in shared interest?",
      "What is one story of challenge and one story of hope I could tell in a 1:1?",
    ],
  },
];
