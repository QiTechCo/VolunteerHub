export type TrainingExcerpt = {
  quote: string;
  location: string;
};

export type TrainingModule = {
  id: "people" | "power" | "purpose";
  title: string;
  leaveWith: string;
  source: string;
  excerpts: TrainingExcerpt[];
  prompts: string[];
};

/** Day 1 notebook copy. Excerpts only — not the full intensive deck. */
export const DAY1_PLAYBOOK =
  "People, Power, Purpose: Your Playbook for a Brighter Charlotte";

export const DAY1_INTENSIVE = "Volunteer Organizing Intensive";

export const DAY1_SOURCE_NOTE =
  "Day 1 follows the Dimple Ajmera for Mayor Volunteer Organizing Intensive — Field Guide & Strategy Blueprint, Vol. 1. Short excerpts for new volunteers; not the full deck. Later days are not in Hub yet.";

export const DAY1_MODULES: TrainingModule[] = [
  {
    id: "people",
    title: "People",
    leaveWith:
      "People is who we are fighting for, and how we talk with them. Day 1 starts with Dimple’s path, the four-pillar mandate, and an empathy loop you can use at the door without blame or criticism.",
    source: "Volunteer Organizing Intensive, Ajmera Campaign Blueprint.",
    excerpts: [
      {
        quote:
          "Age 16: Immigrated to the US; overcame language barriers at Southern High School in Durham. The Hustle: Cleaned hotel rooms to pay for college at USC. The Professional: Became a CPA; managed multi-million dollar budgets working with TIAA. The Pivot: Re-evaluated her path after her father's sudden passing at 55; committed to public service. The Leader: Four-term Charlotte City Councilwoman At Large; 2018 Global Service Award winner. Working Mother. Accountant. Fighter.",
        location: "The North Star: Who We Are Fighting For",
      },
      {
        quote:
          "It's not what we say, but it's really what we do that matters. Safe Charlotte: Safety regardless of your zip code. Sustainable Infrastructure: Building a resilient future and environmental protection. Affordable Housing: Expanding access for all residents. Economic Opportunities: Creating growth in all parts of our city.",
        location: "The Platform: Our Mandate for Charlotte",
      },
      {
        quote:
          "Having authentic conversations at the door. Expressing (without blame): Observations — “When I see/hear…” Feelings — “I feel…” (joyous, concerned, hopeful). Needs — “…because I value…” (community, safety, integrity). Requests — “Would you be willing to support Dimple?” Receiving (without criticism): hearing, empathizing, identifying needs, accepting requests or feedback gracefully.",
        location: "Voter Connection: The Empathy Loop",
      },
    ],
    prompts: [
      "What part of Dimple’s path would you actually say at a door this week?",
      "Which of the four pillars is the one you can speak from without notes?",
      "Can you run the empathy loop — observe, feel, name a need, then ask — without blame?",
    ],
  },
  {
    id: "power",
    title: "Power",
    leaveWith:
      "Power on this campaign is three jobs at once: win the seat, build volunteer leadership, and change what Charlotte treats as common sense. A shift is never only doors — it is how we grow all three dimensions.",
    source: "Volunteer Organizing Intensive, Ajmera Campaign Blueprint.",
    excerpts: [
      {
        quote:
          "1st Dimension (External): Power to Win Demands. Organizing people and resources for direct political action. Goal: Win the Mayoral Seat.",
        location: "The 3 Dimensions of Campaign Power",
      },
      {
        quote:
          "2nd Dimension (Internal): Power to Drive the Agenda. Building movement infrastructure and volunteer leadership. Goal: Build our grassroots capacity.",
        location: "The 3 Dimensions of Campaign Power",
      },
      {
        quote:
          "3rd Dimension (Narrative): Power to Shape Common Sense. Making meaning on the terrain of ideology. Goal: Change what Charlotte believes is politically possible.",
        location: "The 3 Dimensions of Campaign Power",
      },
    ],
    prompts: [
      "Which dimension of power is the shift you are taking this week actually building?",
      "What would “drive the agenda” look like among volunteers this month — not just turnout math?",
      "What does Charlotte currently treat as common sense that this campaign is trying to move?",
    ],
  },
  {
    id: "purpose",
    title: "Purpose",
    leaveWith:
      "Purpose is the architecture: where we are going, how we cut a winnable issue, and which work is a big rock. Goal, analysis, strategy, then tactics — tactics without that stack is noise. Direct voter contact and leadership come before inbox sand.",
    source: "Volunteer Organizing Intensive, Ajmera Campaign Blueprint.",
    excerpts: [
      {
        quote:
          "Goal: Where do we want to go? (Defining external, internal, and narrative objectives). Analysis: Where are we right now? (Evaluating resources, opposition, and support). Strategy: What approach gets us there? (Identifying targets and our rationale for success). Tactics: How will we carry it out? (The specific actions on the ground).",
        location: "Campaign Architecture: The 4-Part Strategy",
      },
      {
        quote:
          "Breaking big-picture problems into manageable, winnable parts. Is it winnable with a clear timeframe? Does it have a clear decision-maker (target)? Does it result in a real improvement to people's lives? Does it unite/strengthen our supporters? Does it align with Dimple's 4-pillar platform? Takeaway: High-scoring issues isolate opponents, persuade the middle, and develop volunteer leadership.",
        location: "Cutting the Issue: Scoring Our Focus",
      },
      {
        quote:
          "If you fill your day with sand (busywork), the big rocks (what matters) won't fit. Big Rocks (High-Impact): Direct voter contact, organizing house meetings, building community leadership. Sand & Pebbles (Maintenance): Responding to endless emails, routine errands, administrative busywork. The Golden Rule: Schedule your Big Rocks first. You are now grounded in Dimple’s story, equipped with the 3 Dimensions of Power, and prepared to manage your time and voice on the campaign trail. Let your work speak for you.",
        location: "The Organizer’s Capacity / Conclusion: Our Collective Purpose",
      },
    ],
    prompts: [
      "Goal, analysis, strategy, or tactics — which one is still fuzzy for you?",
      "Score one Charlotte issue against the five cutting questions. Is it actually winnable this season?",
      "What is your big rock this week, and what sand are you going to leave in the dish?",
    ],
  },
];
