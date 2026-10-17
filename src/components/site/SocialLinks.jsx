import { SITE } from '@/site.config.js';

function GithubIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function XIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

const ICONS = { github: GithubIcon, x: XIcon };

/**
 * Personal social links (GitHub, X). `variant="solid"` gives the gold-filled
 * treatment used in the footer band; the default is the bordered icon button
 * used in the header.
 */
export default function SocialLinks({ variant = 'outline', className = '' }) {
  const items = SITE.social ?? [];
  if (items.length === 0) return null;

  const base =
    variant === 'solid'
      ? 'inline-flex h-10 w-10 items-center justify-center rounded-md border border-accent bg-accent-soft text-accent transition-colors hover:bg-accent hover:text-bg0'
      : 'inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-bg1 text-ink-2 transition-colors hover:border-accent hover:text-accent';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map((s) => {
        const Icon = ICONS[s.id];
        return (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="me noreferrer"
            aria-label={`${s.label} — ${s.handle}`}
            title={`${s.label} · ${s.handle}`}
            className={base}
          >
            {Icon ? <Icon /> : <span>{s.label}</span>}
          </a>
        );
      })}
    </div>
  );
}
