const LAPSED_AFTER_DAYS = 30;
const NEW_WITHIN_DAYS = 14;

export type Segment = "new" | "hot_lead" | "active" | "lapsed" | "paused" | "blocked";

export function classifyVolunteer(input: {
  status: string;
  createdAt: Date;
  lastCompletedAt: Date | null;
  everShifted: boolean;
  now?: Date;
}): Segment {
  if (input.status === "blocked") return "blocked";
  if (input.status === "paused") return "paused";
  const now = input.now ?? new Date();
  if (input.lastCompletedAt) {
    const ageDays =
      (now.getTime() - input.lastCompletedAt.getTime()) / (1000 * 60 * 60 * 24);
    return ageDays <= LAPSED_AFTER_DAYS ? "active" : "lapsed";
  }
  const createdDays = (now.getTime() - input.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (!input.everShifted && createdDays <= NEW_WITHIN_DAYS) return "new";
  return "hot_lead";
}

export const SEGMENT_COPY: Record<Segment, { title: string; blurb: string }> = {
  new: {
    title: "New",
    blurb: "Registered in the last 14 days and has not completed a shift.",
  },
  hot_lead: {
    title: "Hot leads",
    blurb: "Has an account and has never taken a shift.",
  },
  active: {
    title: "Active",
    blurb: "Completed a shift in the last 30 days.",
  },
  lapsed: {
    title: "Lapsed",
    blurb: "Completed a shift before, none in the last 30 days.",
  },
  paused: { title: "Paused", blurb: "Volunteer asked to pause outreach." },
  blocked: { title: "Blocked", blurb: "Staff blocked this account." },
};
