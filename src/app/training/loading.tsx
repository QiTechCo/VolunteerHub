import { Skeleton } from "@/components/ui/skeleton";

export default function TrainingLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
      <Skeleton className="h-4 w-24 rounded-none" />
      <Skeleton className="h-10 w-64 rounded-none" />
      <Skeleton className="h-16 w-full rounded-none" />
      <Skeleton className="h-64 w-full rounded-none" />
    </div>
  );
}
