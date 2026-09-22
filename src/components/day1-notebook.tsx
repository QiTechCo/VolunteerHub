import { DAY1_MODULES, DAY1_SOURCE_NOTE, type TrainingModule } from "@/lib/training-day1";

function ModuleCard({ module }: { module: TrainingModule }) {
  return (
    <article
      id={module.id}
      className="scroll-mt-24 border border-[#d7d0c2] bg-white p-5 min-[641px]:p-8"
    >
      <p className="hub-kicker text-navy">Module</p>
      <h2 className="mt-2 text-2xl">{module.title}</h2>
      <p className="mt-4">{module.leaveWith}</p>

      <h3 className="mt-8 text-lg">Sit with these</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        {module.prompts.map((prompt) => (
          <li key={prompt}>{prompt}</li>
        ))}
      </ul>

      <h3 className="mt-8 text-lg">Short excerpts</h3>
      <div className="mt-3 space-y-5">
        {module.excerpts.map((excerpt) => (
          <blockquote
            key={excerpt.quote.slice(0, 40)}
            className="border-l-2 border-[#1e3a6e] pl-4 text-[17px] leading-7"
          >
            <p>“{excerpt.quote}”</p>
            <p className="mt-2 text-sm text-[#5c574c]">
              {excerpt.location}. {module.source}
            </p>
          </blockquote>
        ))}
      </div>
    </article>
  );
}

export function Day1Notebook() {
  return (
    <div className="grid gap-6 min-[900px]:grid-cols-[13rem_1fr]">
      <nav className="min-[900px]:sticky min-[900px]:top-4 min-[900px]:self-start">
        <p className="hub-kicker text-navy">Day 1</p>
        <ul className="mt-3 flex flex-wrap gap-2 min-[900px]:flex-col">
          {DAY1_MODULES.map((module) => (
            <li key={module.id}>
              <a
                href={`#${module.id}`}
                className="hub-kicker inline-flex border border-[#d7d0c2] bg-white px-3 py-2 text-[#222] hover:border-[#222]"
              >
                {module.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-6">
        <p className="text-sm leading-6 text-[#5c574c]">{DAY1_SOURCE_NOTE}</p>
        {DAY1_MODULES.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
}
