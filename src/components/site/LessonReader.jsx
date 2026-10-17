'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Info,
  Lightbulb,
  ListChecks,
  Route,
  Scale,
  Target,
  Quote as QuoteIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  TUTORIAL_CATEGORIES,
  LEVELS,
  getLessonNeighbors,
} from '@/content/basics/index.js';
import { useGuidesProgress } from '@/utils/guidesProgress.js';

const CALLOUTS = {
  info: { icon: Info, className: 'border-accent', iconClass: 'text-accent' },
  tip: {
    icon: Lightbulb,
    className: 'border-success',
    iconClass: 'text-success',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-danger',
    iconClass: 'text-danger',
  },
  legal: {
    icon: Scale,
    className: 'border-line-strong',
    iconClass: 'text-ink-2',
  },
};

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Reading-progress bar pinned under the sticky header. */
function ProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, doc.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

export default function LessonReader({ lesson }) {
  const category = TUTORIAL_CATEGORIES.find((c) =>
    c.lessonIds.includes(lesson.id),
  );
  const { prev, next } = getLessonNeighbors(lesson.id);
  const { isRead, toggle } = useGuidesProgress();
  const read = isRead(lesson.id);

  const [activeId, setActiveId] = useState(null);

  const headingIds = useMemo(() => {
    const map = {};
    const used = new Map();
    lesson.blocks.forEach((b, i) => {
      if (b.type !== 'h') return;
      const base = slugify(b.text) || `section-${i}`;
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      map[i] = n > 1 ? `${base}-${n}` : base;
    });
    return map;
  }, [lesson]);

  const sections = useMemo(
    () =>
      Object.keys(headingIds).map((i) => ({
        id: headingIds[i],
        text: lesson.blocks[i].text,
      })),
    [headingIds, lesson],
  );

  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <ProgressBar />
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 font-mono text-[13px] text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} />
          All field guides
        </Link>

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
          <article className="max-w-3xl">
            <header className="border-b border-line pb-8">
              {category && (
                <span className="font-mono text-[12px] tracking-eyebrow text-accent">
                  {category.label.toUpperCase()}
                </span>
              )}
              <h1 className="mt-3.5 font-serif text-4xl font-black leading-tight">
                {lesson.title}
              </h1>
              <p className="mt-5 text-base leading-[1.9] text-ink-1">
                {lesson.summary}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Badge variant="accent">
                  {LEVELS[lesson.level]?.label ?? lesson.level}
                </Badge>
                <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-2">
                  <Clock size={12} />
                  {lesson.minutes} min read
                </span>
                {lesson.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </header>

            <div className="mt-10 space-y-6">
              {lesson.blocks.map((block, i) => (
                <Block key={i} block={block} id={headingIds[i]} />
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
              <button
                type="button"
                onClick={() => toggle(lesson.id)}
                className={
                  'inline-flex items-center gap-2 rounded-md border px-4 py-2 font-mono text-[12px] transition-colors ' +
                  (read
                    ? 'border-success text-success'
                    : 'border-line text-ink-2 hover:text-ink')
                }
                aria-pressed={read}
              >
                <CheckCircle2 size={15} />
                {read ? 'Completed' : 'Mark as complete'}
              </button>
              <span className="font-mono text-[12px] text-ink-2">
                Progress is saved on this device only.
              </span>
            </div>

            <nav
              className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2"
              aria-label="Guide navigation"
            >
              {prev ? (
                <Link
                  href={`/guides/${prev.id}`}
                  className="group flex flex-col bg-bg1 p-5 transition-colors hover:bg-bg2"
                >
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-2">
                    <ArrowLeft size={13} />
                    Previous
                  </span>
                  <span className="mt-2 font-serif text-[16px] font-semibold">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span className="hidden bg-bg1 sm:block" />
              )}
              {next ? (
                <Link
                  href={`/guides/${next.id}`}
                  className="group flex flex-col bg-bg1 p-5 text-right transition-colors hover:bg-bg2"
                >
                  <span className="inline-flex items-center justify-end gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-2">
                    Next
                    <ArrowRight size={13} />
                  </span>
                  <span className="mt-2 font-serif text-[16px] font-semibold">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <span className="hidden bg-bg1 sm:block" />
              )}
            </nav>
          </article>

          {sections.length > 0 && (
            <aside className="mt-12 hidden lg:mt-0 lg:block">
              <nav className="sticky top-28" aria-label="On this page">
                <div className="font-mono text-[11px] uppercase tracking-wide text-ink-2">
                  On this page
                </div>
                <ul className="mt-4 space-y-2.5 border-l border-line">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={
                          'block border-l-2 py-0.5 pl-3 text-[13px] leading-snug transition-colors ' +
                          (activeId === s.id
                            ? 'border-accent text-accent'
                            : 'border-transparent text-ink-2 hover:text-ink')
                        }
                      >
                        {s.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}

function Block({ block, id }) {
  switch (block.type) {
    case 'h':
      return (
        <h2
          id={id}
          className="scroll-mt-28 pt-4 font-serif text-2xl font-black tracking-tight"
        >
          {block.text}
        </h2>
      );

    case 'p':
      return (
        <p className="text-[15px] leading-[1.9] text-ink-1">{block.text}</p>
      );

    case 'list':
      return (
        <ul className="space-y-2.5">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 text-[15px] leading-[1.9] text-ink-1"
            >
              <span className="mt-3 h-1.5 w-1.5 shrink-0 bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'steps':
      return (
        <ol className="space-y-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center border border-line font-mono text-[12px] text-accent">
                {i + 1}
              </span>
              <span className="text-[15px] leading-[1.9] text-ink-1">
                {item}
              </span>
            </li>
          ))}
        </ol>
      );

    case 'checklist':
      return <ChecklistBlock block={block} />;

    case 'callout': {
      const c = CALLOUTS[block.tone] ?? CALLOUTS.info;
      const Icon = c.icon;
      return (
        <div className={`flex gap-3 border-l-2 bg-bg1 p-5 ${c.className}`}>
          <Icon size={18} className={`mt-0.5 shrink-0 ${c.iconClass}`} />
          <div>
            {block.title && (
              <div className="font-serif text-[15px] font-semibold text-ink">
                {block.title}
              </div>
            )}
            <p className="mt-1 text-sm leading-[1.8] text-ink-1">
              {block.text}
            </p>
          </div>
        </div>
      );
    }

    case 'code':
      return <CodeBlock text={block.text} />;

    case 'table':
      return (
        <div className="overflow-x-auto border border-line">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-bg2 text-left font-mono text-[12px] uppercase tracking-wide text-ink-2">
                {block.head.map((h, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap px-4 py-3 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-t border-line">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 align-top text-ink-1">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'facts':
      return (
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
          {block.items.map((item, i) => (
            <div key={i} className="bg-bg1 p-4">
              <div className="font-mono text-[11px] uppercase tracking-wide text-ink-2">
                {item.label}
              </div>
              <div className="mt-1.5 text-[14px] leading-[1.7] text-ink-1">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      );

    case 'example':
      return (
        <div className="border border-line bg-bg1">
          <div className="flex items-center gap-2 border-b border-line px-5 py-3">
            <Target size={16} className="text-accent" />
            <span className="font-mono text-[11px] uppercase tracking-wide text-accent">
              Worked example
            </span>
            {block.title && (
              <span className="ml-auto font-serif text-[14px] font-semibold text-ink">
                {block.title}
              </span>
            )}
          </div>
          <div className="space-y-3 p-5">
            {block.scenario && (
              <p className="text-[14.5px] leading-[1.85] text-ink-1">
                {block.scenario}
              </p>
            )}
            {block.method && (
              <div className="flex gap-3">
                <Route size={15} className="mt-1 shrink-0 text-ink-2" />
                <p className="text-[14.5px] leading-[1.85] text-ink-1">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-ink-2">
                    Method ·{' '}
                  </span>
                  {block.method}
                </p>
              </div>
            )}
            {block.result && (
              <div className="flex gap-3 border-l-2 border-success bg-bg2 py-1 pl-3">
                <CheckCircle2
                  size={15}
                  className="mt-1 shrink-0 text-success"
                />
                <p className="text-[14.5px] leading-[1.85] text-ink-1">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-ink-2">
                    Result ·{' '}
                  </span>
                  {block.result}
                </p>
              </div>
            )}
          </div>
        </div>
      );

    case 'tools':
      return (
        <div className="border border-line">
          <div className="flex items-center gap-2 border-b border-line bg-bg2 px-5 py-2.5">
            <Target size={14} className="text-accent" />
            <span className="font-mono text-[11px] uppercase tracking-wide text-ink-2">
              {block.title ?? 'Toolkit'}
            </span>
          </div>
          <ul className="divide-y divide-line">
            {block.items.map((item, i) => (
              <li key={i}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-bg2"
                >
                  <ExternalLink
                    size={15}
                    className="mt-1 shrink-0 text-ink-2 group-hover:text-accent"
                  />
                  <span>
                    <span className="text-[14.5px] font-medium text-ink group-hover:text-accent">
                      {item.label}
                    </span>
                    {item.note && (
                      <span className="mt-0.5 block text-[13px] leading-[1.7] text-ink-2">
                        {item.note}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'quote':
      return (
        <blockquote className="flex gap-4 border-l-2 border-accent bg-bg1 py-4 pl-5 pr-4">
          <QuoteIcon size={18} className="mt-1 shrink-0 text-accent" />
          <div>
            <p className="font-serif text-[17px] italic leading-[1.7] text-ink">
              {block.text}
            </p>
            {block.cite && (
              <footer className="mt-2 font-mono text-[12px] text-ink-2">
                — {block.cite}
              </footer>
            )}
          </div>
        </blockquote>
      );

    default:
      return null;
  }
}

function ChecklistBlock({ block }) {
  const [checked, setChecked] = useState({});
  return (
    <div className="border border-line bg-bg1 p-5">
      <div className="flex items-center gap-2">
        <ListChecks size={16} className="text-accent" />
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-2">
          {block.title ?? 'Field checklist'}
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {block.items.map((item, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={!!checked[i]}
                onChange={(e) =>
                  setChecked((prev) => ({ ...prev, [i]: e.target.checked }))
                }
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
              />
              <span
                className={
                  'text-[14.5px] leading-[1.85] ' +
                  (checked[i] ? 'text-ink-2 line-through' : 'text-ink-1')
                }
              >
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CodeBlock({ text }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="relative border border-line bg-bg1">
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded border border-line bg-bg2 px-2 py-1 font-mono text-[11px] text-ink-2 transition-colors hover:text-ink"
        aria-label="Copy code"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.8] text-ink-1">
        <code>{text}</code>
      </pre>
    </div>
  );
}
