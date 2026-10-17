import Link from 'next/link';
import { Clock } from 'lucide-react';
import {
  PLAYBOOKS,
  PLAYBOOK_CATEGORIES,
  DIFFICULTY_LABELS,
} from '@/content/playbooks/index.js';

export const metadata = {
  title: 'Playbooks',
  description:
    'End-to-end OSINT workflows with the exact tool chain for each step: trace a username, geolocate a photo, profile a domain, verify a video, check email exposure, and map a case.',
};

const CONTAINER = 'mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16';

export default function PlaybooksPage() {
  return (
    <div className={`${CONTAINER} py-14`}>
      <header className="max-w-3xl">
        <div className="font-mono text-[12px] tracking-eyebrow text-accent">
          WORKFLOWS
        </div>
        <h1 className="mt-3.5 font-serif text-4xl font-black sm:text-5xl">
          Playbooks
        </h1>
        <p className="mt-4 text-sm leading-[1.9] text-ink-1">
          A question in, an answer out. Each playbook is a repeatable workflow
          that names the tool for every step and says what to record. Share any
          one by its URL — the link is stable.
        </p>
      </header>

      <div className="mt-14 space-y-14">
        {PLAYBOOK_CATEGORIES.map((cat) => {
          const items = PLAYBOOKS.filter((p) => p.category === cat.id);
          if (items.length === 0) return null;
          return (
            <section key={cat.id}>
              <h2 className="font-mono text-[12px] uppercase tracking-eyebrow text-accent">
                {cat.label}
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/playbooks/${p.slug}`}
                    className="group flex flex-col bg-bg1 p-7 transition-colors hover:bg-bg2"
                  >
                    <h3 className="font-serif text-[18px] font-black leading-snug group-hover:text-accent">
                      {p.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-[1.8] text-ink-1">
                      {p.summary}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-ink-2">
                      <span className="rounded-full border border-line px-2.5 py-0.5 uppercase tracking-wide">
                        {DIFFICULTY_LABELS[p.difficulty] ?? p.difficulty}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={12} />
                        {p.minutes} min
                      </span>
                      <span>{p.steps.length} steps</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
