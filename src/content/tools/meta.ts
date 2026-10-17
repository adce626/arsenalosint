/**
 * Client-safe tools metadata.
 *
 * This module holds only small lookup maps (no catalog data), so it can be
 * imported from both Server and Client Components without pulling the ~400 KB
 * tools JSON into the browser bundle.
 */

export interface CategoryMeta {
  label: string;
  icon: string;
}

/** Human-readable labels + a lucide icon key for every category id. */
export const CATEGORIES: Record<string, CategoryMeta> = {
  'domain-ip-network': { label: 'Domain, IP & Network', icon: 'Network' },
  'username-social': { label: 'Username & Social', icon: 'AtSign' },
  'data-breach': { label: 'Data Breaches', icon: 'DatabaseZap' },
  'people-identity': { label: 'People & Identity', icon: 'UserSearch' },
  'image-facial': { label: 'Image & Facial', icon: 'ScanFace' },
  'email-phone': { label: 'Email & Phone', icon: 'Mail' },
  'red-team-offensive': { label: 'Offensive Security', icon: 'Crosshair' },
  'malware-threat-intel': { label: 'Malware & Threat Intel', icon: 'Bug' },
  'search-dorking': { label: 'Search & Dorking', icon: 'Search' },
  'vpn-privacy': { label: 'VPN & Privacy', icon: 'ShieldCheck' },
  geolocation: { label: 'Geolocation', icon: 'MapPin' },
  'document-metadata': { label: 'Document Metadata', icon: 'FileSearch' },
  'blue-team-defensive': { label: 'Blue Team & Defense', icon: 'Shield' },
  misc: { label: 'Miscellaneous', icon: 'Boxes' },
  'training-ctf': { label: 'Training & CTF', icon: 'GraduationCap' },
  'learning-resources': { label: 'Learning Resources', icon: 'BookOpen' },
  'vehicle-aviation-maritime': {
    label: 'Vehicles, Aviation & Maritime',
    icon: 'Plane',
  },
  'crypto-blockchain': { label: 'Crypto & Blockchain', icon: 'Bitcoin' },
  'iot-devices': { label: 'IoT Devices', icon: 'Cpu' },
  'hardware-hacking': { label: 'Hardware Hacking', icon: 'CircuitBoard' },
  'digital-forensics': { label: 'Digital Forensics', icon: 'Fingerprint' },
  'dark-web': { label: 'Dark Web', icon: 'Globe' },
  frameworks: { label: 'Frameworks', icon: 'LayoutGrid' },
  'threat-intel-platforms': { label: 'Threat Intel Platforms', icon: 'Radar' },
  'company-business': { label: 'Company & Business', icon: 'Building2' },
  'bug-bounty': { label: 'Bug Bounty', icon: 'BugPlay' },
};

export interface InstallMethodMeta {
  label: string;
  hint: string;
}

/** Install-method metadata. */
export const INSTALL_METHODS: Record<string, InstallMethodMeta> = {
  web: { label: 'Web', hint: 'Runs in the browser' },
  manual: { label: 'Manual', hint: 'Download / install by hand' },
  git: { label: 'Git', hint: 'Clone from source' },
  pip: { label: 'Pip', hint: 'Install with pip / pipx' },
  apt: { label: 'APT', hint: 'Install with apt' },
  go: { label: 'Go', hint: 'Install with go install' },
  docker: { label: 'Docker', hint: 'Run in a container' },
};

/** Stable display order for the install-method filter. */
export const METHOD_LIST: string[] = Object.keys(INSTALL_METHODS);

/** The normalized shape of a single catalog tool (client-facing). */
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  method: string;
  tags: string[];
  /** Ready-to-run install command, when the source provides one. */
  command?: string;
  /** Curated standout tool, surfaced first in the catalog. */
  featured?: boolean;
}

/** Install methods whose command can be copied to a shell. */
export const COMMAND_METHODS = ['git', 'pip', 'apt', 'go', 'docker'];

export function hasInstallCommand(
  tool: Pick<Tool, 'method' | 'command'>,
): boolean {
  return COMMAND_METHODS.includes(tool.method) && !!tool.command;
}

export function categoryLabel(id: string): string {
  return CATEGORIES[id]?.label ?? id;
}

export function methodLabel(id: string): string {
  return INSTALL_METHODS[id]?.label ?? id;
}
