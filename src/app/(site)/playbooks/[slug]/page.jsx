import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock } from 'lucide-react';
import {
  PLAYBOOKS,
  PLAYBOOK_CATEGORIES,
  DIFFICULTY_LABELS,
  getPlaybook,
} from '@/content/playbooks/index.js';
import CopyLinkButton from '@/components/site/CopyLinkButton.jsx';

const CONTAINER = 'mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16';

export function generateStaticParams() {
  return PLAYBOOKS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  if (!playbook) return { title: 'Playbook not found' };
  return { title: playbook.title, description: playbook.summary };
}

export default async function PlaybookPage({ params }) {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  if (!playbook) notFound();

  const category = PLAYBOOK_CATEGORIES.find((c) => c.id === playbook.category);
  const index = PLAYBOOKS.findIndex((p) => p.slug === playbook.slug);
  const prev = index > 0 ? PLAYBOOKS[index - 1] : null;
  const next = index < PLAYBOOKS.length - 1 ? PLAYBOOKS[index + 1] : null;

  return (
    <div className={`${CONTAINER} py-14`}>
      <nav className="font-mono text-[11px] text-ink-2" aria-label="Breadcrumb">
        <Link href="/playbooks" className="hover:text-ink">
          Playbooks
        </Link>
        <span className="mx-2">/</span>
        <span>{category?.label}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <h1 className="font-serif text-4xl font-black sm:text-5xl">
          {playbook.title}
        </h1>
        <p className="mt-4 text-[15px] leading-[1.9] text-ink-1">
          {playbook.summary}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-ink-2">
          <span className="rounded-full border border-line px-2.5 py-0.5 uppercase tracking-wide">
            {DIFFICULTY_LABELS[playbook.difficulty] ?? playbook.difficulty}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} />
            {playbook.minutes} min
          </span>
          <span>{playbook.steps.length} steps</span>
        </div>
        <div className="mt-6">
          <CopyLinkButton />
        </div>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <ol className="space-y-8">
            {playbook.steps.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[13px] text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h2 className="font-serif text-[19px] font-black">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm leading-[1.85] text-ink-1">
                    {step.detail}
                  </p>
                  {step.output && (
                    <p className="mt-3 border-l-2 border-accent bg-bg1 px-3 py-2 font-mono text-[12px] text-ink-1">
                      Output: {step.output}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {playbook.tips?.length > 0 && (
            <section className="mt-12">
              <h2 className="font-mono text-[12px] uppercase tracking-eyebrow text-accent">
                Field notes
              </h2>
              <ul className="mt-4 space-y-3">
                {playbook.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex gap-3 border-t border-line pt-3 text-sm leading-[1.8] text-ink-1"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-line bg-bg1 p-6">
            <h2 className="font-mono text-[11px] uppercase tracking-wide text-ink-2">
              Tools for this playbook
            </h2>
            <ul className="mt-4 space-y-3">
              {playbook.tools.map((tool) => (
                <li key={tool.label}>
                  <Link
                    href={tool.href}
                    className="text-[14px] text-accent hover:underline"
                  >
                    {tool.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border border-line bg-bg1 p-6">
            <h2 className="font-mono text-[11px] uppercase tracking-wide text-ink-2">
              Keep going
            </h2>
            <ul className="mt-4 space-y-3 text-[14px]">
              {prev && (
                <li>
                  <Link
                    href={`/playbooks/${prev.slug}`}
                    className="text-ink-1 hover:text-accent"
                  >
                    ← {prev.title}
                  </Link>
                </li>
              )}
              {next && (
                <li>
                  <Link
                    href={`/playbooks/${next.slug}`}
                    className="text-ink-1 hover:text-accent"
                  >
                    {next.title} →
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/reference"
                  className="text-ink-1 hover:text-accent"
                >
                  Reference sheet →
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
