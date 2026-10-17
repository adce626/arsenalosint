'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE, NAV } from '@/site.config.js';
import ThemeToggle from '@/components/ThemeToggle.jsx';
import SocialLinks from './SocialLinks.jsx';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HREF = {
  home: '/',
  tools: '/tools',
  categories: '/#categories',
  basics: '/guides',
  playbooks: '/playbooks',
  glossary: '/glossary',
  mapping: '/mapping',
};

function Mark({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" stroke="var(--accent)" strokeWidth="1.5" />
      <path
        d="M21 21l-4.3-4.3"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="11" cy="11" r="2.4" fill="var(--accent)" />
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();

  const isActive = (id) => {
    if (id === 'home') return pathname === '/';
    if (id === 'tools' || id === 'categories')
      return pathname.startsWith('/tools');
    if (id === 'basics') return pathname.startsWith('/guides');
    if (id === 'playbooks') return pathname.startsWith('/playbooks');
    if (id === 'glossary') return pathname.startsWith('/glossary');
    if (id === 'mapping') return pathname.startsWith('/mapping');
    return false;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg0 print:hidden">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-16 lg:py-6">
        <Link
          href="/"
          className="flex items-center gap-3.5"
          aria-label={`${SITE.name} home`}
        >
          <Mark />
          <span className="flex flex-col">
            <span className="font-serif text-[19px] font-black leading-none tracking-wide">
              {SITE.brandFirst}{' '}
              <span className="text-accent">{SITE.brandAccent}</span>
            </span>
            <span className="mt-1 font-mono text-[10px] tracking-[0.2em] text-ink-2">
              {SITE.tagline}
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-9 text-[15px] text-ink-1 md:flex"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <Link
              key={item.id}
              href={HREF[item.id] ?? '/'}
              className={cn(
                'transition-colors hover:text-ink',
                isActive(item.id) && 'text-accent',
              )}
              aria-current={isActive(item.id) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ink"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new Event('open-command-palette'))
            }
            aria-label="Search (Ctrl+K)"
            className="hidden items-center gap-2 rounded-md border border-line bg-bg1 px-3 py-2 font-mono text-[12px] text-ink-2 transition-colors hover:text-ink sm:inline-flex"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span>Search</span>
            <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>
          <SocialLinks className="hidden md:flex" />
          <span
            className="hidden h-6 w-px bg-line md:block"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new Event('osint:show-shortcuts'))
            }
            aria-label="Keyboard shortcuts (?)"
            title="Keyboard shortcuts (?)"
            className="hidden text-ink-2 transition-colors hover:text-ink sm:block"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
            </svg>
          </button>
          <ThemeToggle />
          <Link
            href="/tools"
            className={cn(buttonVariants({}), 'hidden sm:inline-flex')}
          >
            Start Searching
          </Link>
        </div>
      </div>
    </header>
  );
}
