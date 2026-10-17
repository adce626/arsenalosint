'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getIcon } from './icons.js';
import {
  LESSONS,
  TUTORIAL_CATEGORIES,
  TRACKS,
  LEVELS,
  TOTAL_MINUTES,
} from '@/content/basics/index.js';
import { useGuidesProgress } from '@/utils/guidesProgress.js';

const CONTAINER = 'mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16';
const LEVEL_FILTERS = [
  { id: 'all', label: 'All levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

function matches(lesson, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    lesson.title.toLowerCase().includes(q) ||
    lesson.summary.toLowerCase().includes(q) ||
    (lesson.tags ?? []).some((t) => t.toLowerCase().includes(q))
  );
}

export default function LessonIndex() {
  const { ids, isRead } = useGuidesProgress();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');

  const total = LESSONS.length;
  const done = ids.filter((id) => LESSONS.some((l) => l.id === id)).length;
  const filterActive = query.trim() !== '' || level !== 'all';

  const filtered = useMemo(
    () =>
      LESSONS.filter(
        (l) =>
          matches(l, query.trim()) && (level === 'all' || l.level === level),
      ),
    [query, level],
  );

  return (
    <div className={`${CONTAINER} py-14`}>
      <header className="max-w-3xl">
        <div className="font-mono text-[12px] tracking-eyebrow text-accent">
          METHODOLOGY
        </div>
        <h1 className="mt-3.5 font-serif text-4xl font-black sm:text-5xl">
          Field Guides
        </h1>
        <p className="mt-4 text-sm leading-[1.9] text-ink-1">
          A working manual for the digital investigator: {total} hands-on guides
          that walk the exact moves — dork the right query, verify the photo,
          pivot the handle, map the case — with worked examples, field
          checklists, and the tool for every step. Roughly {TOTAL_MINUTES}{' '}
          minutes end to end.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[12px] text-ink-2">
          <span>
            <span className="text-ink">{done}</span> / {total} completed
          </span>
          <span className="hidden h-1 w-40 overflow-hidden rounded-full bg-bg2 sm:block">
            <span
              className="block h-full bg-accent"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </span>
          <span>Progress saved on this device only</span>
        </div>
      </header>

      {!filterActive && <Tracks />}

      <div className="mt-12 flex flex-col gap-4 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex w-full items-center sm:max-w-xs">
          <Search size={15} className="absolute left-3 text-ink-2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides…"
            aria-label="Search guides"
            className="w-full rounded-md border border-line bg-bg1 py-2 pl-9 pr-8 text-[14px] text-ink placeholder:text-ink-2 focus:border-accent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 text-ink-2 hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </label>

        <div className="flex flex-wrap gap-1.5">
          {LEVEL_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setLevel(f.id)}
              aria-pressed={level === f.id}
              className={
                'rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ' +
                (level === f.id
                  ? 'border-accent text-accent'
                  : 'border-line text-ink-2 hover:text-ink')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 border border-line bg-bg1 p-12 text-center">
          <p className="font-serif text-xl font-black">No guides match</p>
          <p className="mt-2 text-sm text-ink-1">
            Try a broader term, or reset the level filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setLevel('all');
            }}
            className="mt-5 rounded-md border border-line px-4 py-2 font-mono text-[12px] text-ink-2 hover:text-ink"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-14 space-y-14">
          {TUTORIAL_CATEGORIES.map((cat) => {
            const CategoryIcon = getIcon(cat.icon);
            const lessons = cat.lessonIds
              .map((id) => filtered.find((l) => l.id === id))
              .filter(Boolean);
            if (lessons.length === 0) return null;

            return (
              <section key={cat.id}>
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-line text-accent">
                    <CategoryIcon size={20} strokeWidth={1.5} />
                  </span>
                  <div>
                    <h2 className="font-serif text-2xl font-black">
                      {cat.label}
                    </h2>
                    <p className="mt-1 text-sm text-ink-1">{cat.description}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                  {lessons.map((l) => (
                    <LessonCard key={l.id} lesson={l} read={isRead(l.id)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson, read }) {
  return (
    <Link
      href={`/guides/${lesson.id}`}
      className="group flex flex-col bg-bg1 p-7 transition-colors hover:bg-bg2"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-[17px] font-semibold leading-snug group-hover:text-accent">
          {lesson.title}
        </h3>
        {read && (
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-success"
            aria-label="Completed"
          />
        )}
      </div>
      <p className="mt-3 flex-1 text-sm leading-[1.8] text-ink-1">
        {lesson.summary}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Badge variant="accent">
          {LEVELS[lesson.level]?.label ?? lesson.level}
        </Badge>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-2">
          <Clock size={12} />
          {lesson.minutes} min
        </span>
      </div>
    </Link>
  );
}

function Tracks() {
  return (
    <section className="mt-14">
      <h2 className="font-serif text-2xl font-black">Investigation tracks</h2>
      <p className="mt-1 text-sm text-ink-1">
        Follow a path end to end, or dip into the guide you need right now.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
        {TRACKS.map((track) => {
          const TrackIcon = getIcon(track.icon);
          const lessons = track.lessonIds
            .map((id) => LESSONS.find((l) => l.id === id))
            .filter(Boolean);
          const minutes = lessons.reduce((s, l) => s + (l.minutes ?? 0), 0);
          return (
            <div key={track.id} className="flex flex-col bg-bg1 p-7">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-line text-accent">
                  <TrackIcon size={18} strokeWidth={1.5} />
                </span>
                <h3 className="font-serif text-[17px] font-black leading-tight">
                  {track.label}
                </h3>
              </div>
              <p className="mt-3 flex-1 text-sm leading-[1.8] text-ink-1">
                {track.description}
              </p>
              <ol className="mt-5 space-y-2">
                {lessons.map((l, i) => (
                  <li key={l.id}>
                    <Link
                      href={`/guides/${l.id}`}
                      className="group flex items-baseline gap-3 text-[14px] text-ink-1 hover:text-accent"
                    >
                      <span className="font-mono text-[11px] text-ink-2">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <div className="mt-5 font-mono text-[11px] uppercase tracking-wide text-ink-2">
                {lessons.length} guides · {minutes} min
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
