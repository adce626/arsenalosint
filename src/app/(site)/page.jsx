import Link from 'next/link';
import {
  ArrowRight,
  Wrench,
  GraduationCap,
  MapPinned,
  ShieldCheck,
} from 'lucide-react';
import HeroSearch from '@/components/site/HeroSearch.jsx';
import { getIcon } from '@/components/site/icons.js';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CATEGORY_LIST,
  TOOL_COUNT,
  CATEGORY_COUNT,
} from '@/content/tools/catalog';
import { LESSONS, TUTORIAL_CATEGORIES } from '@/content/basics/index.js';

const CONTAINER = 'mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16';

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-mono text-3xl font-medium text-accent">{value}</div>
      <div className="mt-1.5 font-mono text-[12px] text-ink-2">{label}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <div className={`${CONTAINER} py-20 text-center sm:py-28`}>
          <div className="mb-7 font-mono text-[12px] tracking-eyebrow text-accent">
            OPEN SOURCE INTELLIGENCE
          </div>
          <h1 className="mx-auto max-w-[980px] font-serif text-4xl font-black leading-[1.15] sm:text-5xl lg:text-[68px]">
            The complete field guide
            <br />
            to <span className="text-accent">OSINT tooling</span>
          </h1>
          <p className="mx-auto mt-7 max-w-[620px] text-base leading-[1.9] text-ink-1 sm:text-[19px]">
            {TOOL_COUNT}+ documented, categorized tools for information
            gathering, digital tracing and investigation — one arsenal, one
            identity.
          </p>

          <HeroSearch />

          <div className="mt-16 flex flex-wrap justify-center gap-x-16 gap-y-8">
            <Stat value={TOOL_COUNT} label="documented tools" />
            <Stat value={CATEGORY_COUNT} label="categories" />
            <Stat value={LESSONS.length} label="field guides" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="scroll-mt-24 border-b border-line">
        <div className={`${CONTAINER} py-20`}>
          <div className="mb-12 text-center">
            <div className="font-mono text-[12px] tracking-eyebrow text-success">
              CATEGORIES
            </div>
            <h2 className="mt-3.5 font-serif text-4xl font-black">
              Browse by category
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_LIST.slice(0, 6).map((cat) => {
              const Icon = getIcon(cat.icon);
              return (
                <Link
                  key={cat.id}
                  href="/tools"
                  className="group flex flex-col gap-4 bg-bg1 p-9 transition-colors hover:bg-bg2"
                >
                  <Icon size={26} className="text-accent" strokeWidth={1.5} />
                  <h3 className="font-serif text-[19px] font-semibold">
                    {cat.label}
                  </h3>
                  <p className="text-sm leading-[1.8] text-ink-1">
                    {cat.count} documented {cat.count === 1 ? 'tool' : 'tools'}{' '}
                    in this discipline.
                  </p>
                  <span className="font-mono text-[12px] text-ink-2">
                    {cat.count} tools
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/tools"
              className={cn(buttonVariants({ variant: 'secondary' }))}
            >
              View all {CATEGORY_COUNT} categories
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Methodology + Mapping Tool */}
      <section className="border-b border-line">
        <div
          className={`${CONTAINER} grid gap-px border-x border-b border-line bg-line lg:grid-cols-2`}
        >
          <Link
            href="/guides"
            className="group flex flex-col items-start gap-4 bg-bg0 p-10 transition-colors hover:bg-bg1 lg:p-14"
          >
            <GraduationCap
              size={28}
              className="text-accent"
              strokeWidth={1.5}
            />
            <div className="font-mono text-[12px] tracking-[0.2em] text-accent">
              METHODOLOGY
            </div>
            <h2 className="font-serif text-3xl font-black">
              Learn the tradecraft
            </h2>
            <p className="max-w-md text-sm leading-[1.9] text-ink-1">
              {LESSONS.length} concise field guides across{' '}
              {TUTORIAL_CATEGORIES.length} tracks — the OSINT cycle, SOCMINT,
              GEOINT, dorking, verification, and OPSEC.
            </p>
            <span className="mt-2 inline-flex items-center gap-2 font-mono text-[13px] text-accent">
              Open the field guides
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>

          <Link
            href="/mapping"
            className="group flex flex-col items-start gap-4 bg-bg0 p-10 text-left transition-colors hover:bg-bg1 lg:p-14"
          >
            <MapPinned size={28} className="text-accent" strokeWidth={1.5} />
            <div className="font-mono text-[12px] tracking-[0.2em] text-accent">
              MAPPING TOOL
            </div>
            <h2 className="font-serif text-3xl font-black">
              Map a case end to end
            </h2>
            <p className="max-w-md text-sm leading-[1.9] text-ink-1">
              Turn identifiers into a node graph, pin locations on Google Maps
              or OpenStreetMap, and link the two. Saved to a single file — never
              uploaded.
            </p>
            <span className="mt-2 inline-flex items-center gap-2 font-mono text-[13px] text-accent">
              Open the mapping tool
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>
        </div>
      </section>

      {/* Values band */}
      <section className="border-b border-line">
        <div className={`${CONTAINER} grid gap-10 py-16 lg:grid-cols-3`}>
          <div className="flex flex-col gap-3">
            <Wrench size={24} className="text-accent" strokeWidth={1.5} />
            <h3 className="font-serif text-xl font-semibold">A real arsenal</h3>
            <p className="text-sm leading-[1.9] text-ink-1">
              {TOOL_COUNT} tools vendored from the awesome-osint-arsenal
              directory, filterable by discipline and install method. Every
              entry links to its original project.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <GraduationCap
              size={24}
              className="text-accent"
              strokeWidth={1.5}
            />
            <h3 className="font-serif text-xl font-semibold">
              Organized by methodology
            </h3>
            <p className="text-sm leading-[1.9] text-ink-1">
              Not just a list. Guides walk you through the intelligence cycle
              and the techniques that turn raw hits into verified findings.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <ShieldCheck size={24} className="text-accent" strokeWidth={1.5} />
            <h3 className="font-serif text-xl font-semibold">
              Private by design
            </h3>
            <p className="text-sm leading-[1.9] text-ink-1">
              No backend and no analytics. Projects save to plain{' '}
              <code className="rounded-sm bg-bg2 px-1.5 py-0.5 font-mono text-xs">
                .osint.json
              </code>{' '}
              files you control.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className={`${CONTAINER} py-20 text-center`}>
          <h2 className="mx-auto max-w-[720px] font-serif text-3xl font-black sm:text-[40px]">
            One arsenal. One identity.
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-sm leading-[1.9] text-ink-1">
            Start with a search, or open the mapping tool and build your first
            case.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tools" className={cn(buttonVariants({ size: 'lg' }))}>
              Browse the tools
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/mapping"
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'lg' }),
              )}
            >
              <MapPinned size={17} />
              Start mapping
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
