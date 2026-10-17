import Link from 'next/link';
import PrintButton from '@/components/site/PrintButton.jsx';

export const metadata = {
  title: 'Reference sheet',
  description:
    'A one-page, printable field reference: search operators, reverse-image engines, metadata commands, geolocation helpers, network lookups, and an OPSEC checklist.',
};

const CONTAINER = 'mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16';

const DORKS = [
  {
    op: 'site:',
    ex: 'site:example.com "resume"',
    use: 'Restrict to one domain.',
  },
  {
    op: 'filetype:',
    ex: 'filetype:pdf "annual report"',
    use: 'Limit to a file type.',
  },
  { op: 'inurl:', ex: 'inurl:admin', use: 'Match text in the URL.' },
  { op: 'intitle:', ex: 'intitle:"index of"', use: 'Match the page title.' },
  { op: 'intext:', ex: 'intext:"api_key"', use: 'Match the body text.' },
  { op: 'cache:', ex: 'cache:example.com', use: 'View a cached copy.' },
  { op: '""', ex: '"exact phrase"', use: 'Force an exact match.' },
  { op: '-', ex: 'jaguar -car', use: 'Exclude a word.' },
  { op: 'OR', ex: 'linkedin OR github', use: 'Either term.' },
  { op: '..', ex: '2019..2022', use: 'A numeric range.' },
];

const IMAGE_ENGINES = [
  { name: 'Google Lens / Images', note: 'Broadest web coverage.' },
  { name: 'Yandex Images', note: 'Strong on faces and Eastern Europe.' },
  { name: 'Bing Visual Search', note: 'Different index; good for commerce.' },
  { name: 'TinEye', note: 'Find earliest appearance & edits.' },
  { name: 'PimEyes / face search', note: 'Face pivots — lawful use only.' },
];

const METADATA = [
  { cmd: 'exiftool image.jpg', use: 'Dump all embedded metadata.' },
  { cmd: 'exiftool -gps:all image.jpg', use: 'GPS coordinates only.' },
  {
    cmd: 'exiftool -all= -overwrite_original x',
    use: 'Strip metadata before sharing.',
  },
  { cmd: 'pdfinfo file.pdf', use: 'PDF author, producer, dates.' },
  { cmd: 'mediainfo video.mp4', use: 'Container, codecs, creation time.' },
];

const GEO = [
  { name: 'SunCalc / sun position', use: 'Shadow direction → time of day.' },
  { name: 'Shadow length + date', use: 'Estimate latitude and season.' },
  { name: 'Satellite + street view', use: 'Match terrain, roads, signage.' },
  { name: 'Overpass / OSM queries', use: 'Find features by tag.' },
  { name: 'What3words', use: 'Share an exact 3 m square.' },
];

const NETWORK = [
  { cmd: 'whois example.com', use: 'Registration and ownership.' },
  { cmd: 'dig example.com ANY', use: 'DNS records (A, MX, TXT, …).' },
  { cmd: 'dig +short -x 1.2.3.4', use: 'Reverse DNS for an IP.' },
  { cmd: 'nslookup / host', use: 'Quick resolver checks.' },
  { cmd: 'traceroute example.com', use: 'Network path and hops.' },
];

const USERNAME = [
  'Try the exact handle, then common variants (_, ., digits, no-digits).',
  'Enumerate across platforms; verify every hit by avatar, bio, and posts.',
  'Check Gravatar (email hash) and profile picture reuse.',
  'Search archived snapshots for deleted profiles.',
];

const OPSEC = [
  'Separate browser profile and, where warranted, a separate network.',
  'Never browse a target while logged into a personal account.',
  'Strip metadata from anything you publish.',
  'Vent findings only on a need-to-know basis.',
  'Log dates, sources, and confidence for every action.',
];

function Sheet({ title, children }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="font-mono text-[12px] uppercase tracking-eyebrow text-accent">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ left, mid, right }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-t border-line py-2.5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,1fr)] sm:gap-4">
      <code className="font-mono text-[12.5px] text-ink">{left}</code>
      {mid !== undefined && (
        <code className="font-mono text-[12.5px] text-accent">{mid}</code>
      )}
      <span className="text-[13px] text-ink-1">{right}</span>
    </div>
  );
}

export default function ReferencePage() {
  return (
    <div className={`${CONTAINER} py-14`}>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <div className="font-mono text-[12px] tracking-eyebrow text-accent">
            REFERENCE · PDF-READY
          </div>
          <h1 className="mt-3.5 font-serif text-4xl font-black sm:text-5xl">
            Field reference sheet
          </h1>
          <p className="mt-4 text-sm leading-[1.9] text-ink-1">
            The moves you reach for mid-investigation, on one printable page:
            search operators, reverse-image engines, metadata commands,
            geolocation helpers, network lookups, username pivots, and an OPSEC
            checklist. Print it, keep it beside the keyboard.
          </p>
        </div>
        <div className="print:hidden">
          <PrintButton />
        </div>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-2">
        <Sheet title="Search operators">
          <div>
            {DORKS.map((d) => (
              <Row key={d.op} left={d.op} mid={d.ex} right={d.use} />
            ))}
          </div>
        </Sheet>

        <div className="flex flex-col gap-12">
          <Sheet title="Reverse image search">
            <div>
              {IMAGE_ENGINES.map((e) => (
                <Row key={e.name} left={e.name} right={e.note} />
              ))}
            </div>
          </Sheet>

          <Sheet title="Metadata & forensics">
            <div>
              {METADATA.map((m) => (
                <Row key={m.cmd} left={m.cmd} right={m.use} />
              ))}
            </div>
          </Sheet>
        </div>

        <Sheet title="Geolocation & time">
          <div>
            {GEO.map((g) => (
              <Row key={g.name} left={g.name} right={g.use} />
            ))}
          </div>
        </Sheet>

        <Sheet title="Network & domains">
          <div>
            {NETWORK.map((n) => (
              <Row key={n.cmd} left={n.cmd} right={n.use} />
            ))}
          </div>
        </Sheet>

        <Sheet title="Username pivots">
          <ul className="space-y-2.5">
            {USERNAME.map((u) => (
              <li
                key={u}
                className="flex gap-3 border-t border-line pt-2.5 text-[13px] leading-[1.7] text-ink-1"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {u}
              </li>
            ))}
          </ul>
        </Sheet>

        <Sheet title="OPSEC checklist">
          <ul className="space-y-2.5">
            {OPSEC.map((o) => (
              <li
                key={o}
                className="flex gap-3 border-t border-line pt-2.5 text-[13px] leading-[1.7] text-ink-1"
              >
                <span className="mt-1 font-mono text-[12px] text-accent">
                  ☐
                </span>
                {o}
              </li>
            ))}
          </ul>
        </Sheet>
      </div>

      <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-ink-1 print:hidden">
        <span>Go deeper:</span>
        <Link
          href="/guides"
          className="font-mono text-[12px] text-accent hover:underline"
        >
          Field guides →
        </Link>
        <Link
          href="/playbooks"
          className="font-mono text-[12px] text-accent hover:underline"
        >
          Playbooks →
        </Link>
        <Link
          href="/glossary"
          className="font-mono text-[12px] text-accent hover:underline"
        >
          Glossary →
        </Link>
      </div>
    </div>
  );
}
