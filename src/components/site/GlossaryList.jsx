'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_TERMS,
  termSlug,
} from '@/content/glossary/index.js';

const CONTAINER = 'mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16';

function matches(term, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    term.term.toLowerCase().includes(q) ||
    (term.aka ?? '').toLowerCase().includes(q) ||
    term.definition.toLowerCase().includes(q)
  );
}

export default function GlossaryList() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(
    () =>
      GLOSSARY_TERMS.filter(
        (t) =>
          matches(t, query.trim()) &&
          (category === 'all' || t.category === category),
      ).sort((a, b) => a.term.localeCompare(b.term)),
    [query, category],
  );

  const active = query.trim() !== '' || category !== 'all';

  return (
    <div className={`${CONTAINER} py-14`}>
      <header className="max-w-3xl">
        <div className="font-mono text-[12px] tracking-eyebrow text-accent">
          REFERENCE
        </div>
        <h1 className="mt-3.5 font-serif text-4xl font-black sm:text-5xl">
          Glossary
        </h1>
        <p className="mt-4 text-sm leading-[1.9] text-ink-1">
          The working vocabulary of open-source intelligence —{' '}
          {GLOSSARY_TERMS.length} terms from foundations and SOCMINT to GEOINT,
          infrastructure, law, and tradecraft. Cross-references walk you from a
          term to the concept beside it.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-4 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex w-full items-center sm:max-w-xs">
          <Search size={15} className="absolute left-3 text-ink-2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms…"
            aria-label="Search glossary"
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
          <FilterChip
            label="All"
            active={category === 'all'}
            onClick={() => setCategory('all')}
          />
          {GLOSSARY_CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              label={c.label}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 border border-line bg-bg1 p-12 text-center">
          <p className="font-serif text-xl font-black">No matching terms</p>
          <p className="mt-2 text-sm text-ink-1">
            Try a different spelling, or clear the category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
            className="mt-5 rounded-md border border-line px-4 py-2 font-mono text-[12px] text-ink-2 hover:text-ink"
          >
            Reset
          </button>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
          {GLOSSARY_CATEGORIES.map((cat) => {
            const terms = filtered.filter((t) => t.category === cat.id);
            if (terms.length === 0) return null;
            return (
              <section key={cat.id} id={cat.id} className="scroll-mt-28">
                <h2 className="font-mono text-[12px] uppercase tracking-eyebrow text-accent">
                  {cat.label}
                </h2>
                <dl className="mt-4 divide-y divide-line border-t border-line">
                  {terms.map((t) => (
                    <div
                      key={t.term}
                      id={termSlug(t.term)}
                      className="scroll-mt-28 py-4"
                    >
                      <dt className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-serif text-[17px] font-semibold text-ink">
                          {t.term}
                        </span>
                        {t.aka && (
                          <span className="font-mono text-[11px] text-ink-2">
                            ({t.aka})
                          </span>
                        )}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-[1.8] text-ink-1">
                        {t.definition}
                        {t.see && (
                          <>
                            {' '}
                            <Link
                              href={`#${termSlug(t.see)}`}
                              className="text-accent hover:underline"
                            >
                              See: {t.see.replace(/-/g, ' ')}
                            </Link>
                          </>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      )}

      {active && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
            className="rounded-md border border-line px-4 py-2 font-mono text-[12px] text-ink-2 hover:text-ink"
          >
            Show all {GLOSSARY_TERMS.length} terms
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ' +
        (active
          ? 'border-accent text-accent'
          : 'border-line text-ink-2 hover:text-ink')
      }
    >
      {label}
    </button>
  );
}
