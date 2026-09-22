import { cn } from "@/lib/utils";

export const inputClass =
  "h-11 w-full rounded-none border border-[#d7d0c2] bg-white px-3 text-[17px] text-[#222] outline-none focus:border-[#222]";

export const textareaClass =
  "min-h-28 w-full rounded-none border border-[#d7d0c2] bg-white px-3 py-2 text-[17px] text-[#222] outline-none focus:border-[#222]";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-[#d7d0c2] bg-white px-6 py-12 text-center">
      <h2 className="text-base">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-[#5c574c]">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function PageShell({
  kicker,
  title,
  description,
  children,
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-6xl px-4 py-10", className)}>
      {kicker ? <p className="hub-kicker text-navy">{kicker}</p> : null}
      <h1 className="mt-3 max-w-3xl text-2xl min-[641px]:text-3xl">{title}</h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-[#222]">{description}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="hub-kicker text-[#222]">{label}</span>
      {children}
      {hint ? <span className="block text-sm leading-6 text-[#5c574c]">{hint}</span> : null}
    </label>
  );
}
