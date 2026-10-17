'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // ⌘K / Ctrl+K focuses the arsenal search.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/tools?q=${encodeURIComponent(q)}` : '/tools');
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-11 flex max-w-[640px] items-center gap-3.5 border border-line-strong bg-bg2 px-5 py-4 text-left"
      role="search"
    >
      <span className="font-mono text-success" aria-hidden="true">
        ›
      </span>
      <label htmlFor="arsenal-search" className="sr-only">
        Search for a tool
      </label>
      <input
        id="arsenal-search"
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search: username, domain, ip, email…"
        className="flex-1 border-none bg-transparent font-mono text-[15px] text-ink placeholder:text-ink-2 focus:outline-none"
      />
      <kbd className="hidden rounded-sm border border-line px-2 py-0.5 font-mono text-[11px] text-ink-2 sm:block">
        ⌘K
      </kbd>
    </form>
  );
}
