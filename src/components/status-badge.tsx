import { Badge } from "@/components/ui/badge";
import type { AssignmentStatus } from "@/lib/constants";
import type { Segment } from "@/lib/segments";

const assignmentLabel: Record<AssignmentStatus, string> = {
  registered: "Registered",
  waitlisted: "Waitlisted",
  confirmed: "Confirmed",
  pending_approval: "Pending approval",
  completed: "Completed",
  no_show: "No-show",
  canceled: "Canceled",
};

export function AssignmentBadge({ status }: { status: string }) {
  const label = assignmentLabel[status as AssignmentStatus] ?? status;
  const tone =
    status === "waitlisted"
      ? "bg-[#efe8d8] text-[#222]"
      : status === "no_show" || status === "canceled"
        ? "bg-destructive/10 text-destructive"
        : status === "completed" || status === "confirmed"
          ? "bg-[#1e3a6e]/10 text-navy"
          : "bg-[#222] text-white";
  return (
    <Badge className={`rounded-none font-display tracking-[0.14em] uppercase ${tone}`}>
      {label}
    </Badge>
  );
}

export function SegmentBadge({ segment }: { segment: Segment }) {
  const label =
    segment === "hot_lead"
      ? "Hot lead"
      : segment.replace("_", " ");
  return (
    <Badge className="rounded-none bg-[#efe8d8] font-display tracking-[0.14em] text-[#222] uppercase">
      {label}
    </Badge>
  );
}
