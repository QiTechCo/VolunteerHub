export const CAMPAIGN_HOME = "https://www.dimpleajmera.com/";
export const CAMPAIGN_NAME = "Dimple Ajmera for Charlotte";
export const PRODUCT_NAME = "Volunteer Hub";
export const COMMITTEE_NAME = "The Committee to Elect Dimple Ajmera";
export const TIMEZONE = "America/New_York";
export const CONTACT_EMAIL = "Dimple@DimpleAjmera.com";
export const HQ_ADDRESS = "6528 Matlea Court, Charlotte, NC 28215";

export const SESSION_COOKIE = "vh_session";
export const BASE_PATH = "/volunteer";

export const DEMO_STAFF = {
  email: "coordinator@volunteerhub.local",
  password: "CharlotteHub!26",
  name: "Volunteer Director",
};

export const DEMO_VOLUNTEER = {
  email: "maya.chen@volunteerhub.local",
  password: "Volunteer!26",
};

export const ROLE_SLUGS = [
  "canvassing",
  "poll_greeting",
  "sign_posting",
  "event_hosting",
] as const;

export type RoleSlug = (typeof ROLE_SLUGS)[number];

export const ROLE_COPY: Record<
  RoleSlug,
  { title: string; description: string; trustLevel: "low" | "high" }
> = {
  canvassing: {
    title: "Canvassing",
    description:
      "Neighborhood walks and doors. Each shift lists the meeting point and hours.",
    trustLevel: "low",
  },
  poll_greeting: {
    title: "Poll greeting",
    description:
      "Greet voters at the polling location named on the shift. Times are on the shift card.",
    trustLevel: "low",
  },
  sign_posting: {
    title: "Sign posting",
    description:
      "Place or pick up yard signs at the locations staff publish on the shift.",
    trustLevel: "low",
  },
  event_hosting: {
    title: "Event hosting",
    description:
      "Host a house gathering. Mark that you are willing to host on your profile; staff publishes the host shift.",
    trustLevel: "high",
  },
};

export const OCCUPYING_STATUSES = [
  "registered",
  "confirmed",
  "pending_approval",
  "completed",
] as const;

export const OPEN_SIGNUP_STATUSES = [
  "registered",
  "confirmed",
  "pending_approval",
  "waitlisted",
] as const;

export const ASSIGNMENT_STATUSES = [
  "registered",
  "waitlisted",
  "confirmed",
  "pending_approval",
  "completed",
  "no_show",
  "canceled",
] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];
export type StaffRole = "owner" | "volunteer_director" | "scheduler" | "viewer";

export const STAFF_ROLES: StaffRole[] = [
  "owner",
  "volunteer_director",
  "scheduler",
  "viewer",
];

export const DOCUMENT_KINDS = ["resume", "cv", "bio"] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
