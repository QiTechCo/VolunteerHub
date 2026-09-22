import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
      <Skeleton className="h-4 w-32 rounded-none" />
      <Skeleton className="h-10 w-80 rounded-none" />
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="grid gap-4 min-[641px]:grid-cols-2">
        <Skeleton className="h-40 rounded-none" />
        <Skeleton className="h-40 rounded-none" />
      </div>
    </div>
  );
}
