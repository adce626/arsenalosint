import Link from 'next/link';
import GlossaryList from '@/components/site/GlossaryList.jsx';

export const metadata = {
  title: 'Glossary',
  description:
    'The working vocabulary of open-source intelligence: OSINT, SOCMINT, GEOINT, OPSEC, attribution, EXIF, WHOIS, and the terms that sit between them.',
};

export default function GlossaryPage() {
  return (
    <>
      <GlossaryList />
      <div className="mx-auto max-w-[1440px] px-6 pb-16 sm:px-10 lg:px-16">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-ink-1">
          <span>Want the one-page version?</span>
          <Link
            href="/reference"
            className="font-mono text-[12px] text-accent hover:underline"
          >
            Printable cheat sheet →
          </Link>
        </div>
      </div>
    </>
  );
}
