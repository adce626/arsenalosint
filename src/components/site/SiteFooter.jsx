import Link from 'next/link';
import { SITE } from '@/site.config.js';
import SocialLinks from './SocialLinks.jsx';

export default function SiteFooter() {
  return (
    <footer className="border-t border-line print:hidden">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-8 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-serif text-xl font-black tracking-wide">
              {SITE.brandFirst}{' '}
              <span className="text-accent">{SITE.brandAccent}</span>
            </div>
            <p className="mt-3 max-w-md text-[13px] leading-[1.8] text-ink-2">
              {SITE.description}
            </p>
          </div>

          <div className="shrink-0 sm:text-right">
            <div className="font-mono text-[11px] uppercase tracking-wide text-ink-2">
              Built &amp; maintained by{' '}
              <span className="text-ink">{SITE.author}</span>
            </div>
            <SocialLinks variant="solid" className="mt-4 sm:justify-end" />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-6 text-[13px] text-ink-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {SITE.name} © 2026 — reference directory, for educational and lawful
            use only. Local-first: nothing you enter leaves your browser.
          </p>
          <nav
            className="flex flex-wrap items-center gap-x-7 gap-y-2 font-mono"
            aria-label="Footer"
          >
            <Link href="/tools" className="transition-colors hover:text-ink">
              Tools
            </Link>
            <Link href="/guides" className="transition-colors hover:text-ink">
              Methodology
            </Link>
            <Link
              href="/playbooks"
              className="transition-colors hover:text-ink"
            >
              Playbooks
            </Link>
            <Link href="/glossary" className="transition-colors hover:text-ink">
              Glossary
            </Link>
            <Link
              href="/reference"
              className="transition-colors hover:text-ink"
            >
              Reference
            </Link>
            <Link
              href="/#categories"
              className="transition-colors hover:text-ink"
            >
              Categories
            </Link>
            <Link href="/mapping" className="transition-colors hover:text-ink">
              Mapping Tool
            </Link>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-ink"
            >
              Source
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
