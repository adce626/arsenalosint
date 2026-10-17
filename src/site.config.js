/**
 * Central brand + copy for the main site shell. Kept in one place so the
 * Hub, header, footer, and meta copy stay in sync.
 */
export const SITE = {
  brandFirst: 'ARSENAL',
  brandAccent: 'OSINT',
  name: 'Arsenal OSINT',
  shortName: 'Arsenal',
  tagline: 'RECON · INTEL · ARCHIVE',
  description:
    'A complete field guide to OSINT tooling — a searchable arsenal of curated tools, hands-on field guides, and a local-first mapping workspace. All in your browser.',
  repo: 'https://github.com/rawfilejson/awesome-osint-arsenal',
  license: 'MIT',
  author: 'adce626',
  // Personal accounts, surfaced in the header and footer.
  social: [
    {
      id: 'github',
      label: 'GitHub',
      handle: '@adce626',
      href: 'https://github.com/adce626',
    },
    {
      id: 'x',
      label: 'X',
      handle: '@adce626',
      href: 'https://x.com/adce626',
    },
  ],
};

export const NAV = [
  { id: 'tools', label: 'Tools' },
  { id: 'basics', label: 'Methodology' },
  { id: 'playbooks', label: 'Playbooks' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'mapping', label: 'Mapping Tool' },
];
