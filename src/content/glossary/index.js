/**
 * Glossary content registry.
 *
 * `GLOSSARY_CATEGORIES` controls the display order and grouping; every term's
 * `category` must match one of these ids. `see` cross-links to another term id
 * (the slugified term), so related ideas stay one click apart.
 */

export const GLOSSARY_CATEGORIES = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'socmint', label: 'SOCMINT & identity' },
  { id: 'geoint', label: 'GEOINT & imagery' },
  { id: 'network', label: 'Network & infrastructure' },
  { id: 'legal', label: 'Law, ethics & data' },
  { id: 'tradecraft', label: 'Tradecraft & OPSEC' },
];

export const GLOSSARY_TERMS = [
  // --- Foundations ---------------------------------------------------------
  {
    term: 'OSINT',
    aka: 'Open-Source Intelligence',
    category: 'foundations',
    definition:
      'Intelligence produced from publicly available information — websites, social media, records, media, and data — that is collected, validated, and analyzed for a specific question. The source is open; the method and the analysis are what make it intelligence.',
    see: 'intelligence-cycle',
  },
  {
    term: 'PAI',
    aka: 'Publicly Available Information',
    category: 'foundations',
    definition:
      'The raw material of OSINT: any information lawfully accessible to the public. PAI becomes intelligence only once it is collected against a requirement and corroborated.',
  },
  {
    term: 'Intelligence cycle',
    category: 'foundations',
    definition:
      'The repeatable loop that keeps an investigation honest: direction (what do we need?), collection, processing, analysis, dissemination, and feedback. Skipping direction is the most common reason a case stalls.',
    see: 'osint',
  },
  {
    term: 'IOC',
    aka: 'Indicator of Compromise',
    category: 'foundations',
    definition:
      'An observable artifact — a domain, IP, file hash, or email address — that suggests a system or account has been involved in an incident. Individually weak; powerful in clusters.',
  },
  {
    term: 'TTP',
    aka: 'Tactics, Techniques & Procedures',
    category: 'foundations',
    definition:
      'The behavioural patterns of an actor, as opposed to their one-off tools. Mapping an adversary to TTPs is more durable than tracking individual indicators.',
  },
  {
    term: 'Corroboration',
    category: 'foundations',
    definition:
      'Confirming a finding with at least one independent source that does not trace back to the original claim. Two copies of the same rumor are not corroboration.',
    see: 'verification',
  },
  {
    term: 'Verification',
    category: 'foundations',
    definition:
      'Confirming that a piece of content is authentic, unaltered, and correctly situated in time and place. Verification is a process, never a single check.',
    see: 'corroboration',
  },
  {
    term: 'Primary source',
    category: 'foundations',
    definition:
      'Original material created at the time — a raw photo, an official record, a post. Prefer primary sources; secondary sources interpret and can distort.',
  },
  {
    term: 'Attribution',
    category: 'foundations',
    definition:
      'The judgement that a specific person or group is responsible for an action or account. Requires multiple, independent, high-quality links — never a single data point.',
    see: 'confidence',
  },
  {
    term: 'Confidence',
    category: 'foundations',
    definition:
      'A stated level of certainty (high / medium / low) attached to a finding, kept separate from the finding itself. Recording confidence prevents a guess from hardening into fact as it moves through a case.',
    see: 'attribution',
  },
  {
    term: 'Confirmation bias',
    category: 'foundations',
    definition:
      'The tendency to seek and weight evidence that supports a hypothesis you already hold. Actively hunt for the disconfirming data.',
  },

  // --- SOCMINT & identity --------------------------------------------------
  {
    term: 'SOCMINT',
    aka: 'Social Media Intelligence',
    category: 'socmint',
    definition:
      'OSINT drawn specifically from social platforms: posts, profiles, connections, and metadata. Rich in social context, and rich in noise.',
    see: 'osint',
  },
  {
    term: 'Digital footprint',
    category: 'socmint',
    definition:
      'The accumulated trace a person leaves online — accounts, comments, photos, registrations — often far larger than the subject realizes.',
  },
  {
    term: 'Handle',
    category: 'socmint',
    definition:
      'A username or @-name. Consistent handles across platforms are one of the strongest pivots in a person-focused investigation.',
    see: 'enumeration',
  },
  {
    term: 'Pivot',
    category: 'socmint',
    definition:
      'Moving from one confirmed data point to a new lead: a handle to an email, an email to a photo, a photo to a place. Investigation is a chain of pivots, each logged.',
  },
  {
    term: 'Enumeration',
    category: 'socmint',
    definition:
      'Systematically checking a candidate identifier (usually a username) across many platforms to find where it is registered. Automate the checking, verify the matches by hand.',
    see: 'handle',
  },
  {
    term: 'Sock puppet',
    aka: 'Sock puppet account',
    category: 'socmint',
    definition:
      'A fake identity used to interact with a target. From a defensive standpoint, a sign that a profile may not be a real person.',
  },
  {
    term: 'Alias',
    category: 'socmint',
    definition:
      'An alternative name, nickname, or handle a subject uses. Collecting aliases broadens every subsequent search.',
  },
  {
    term: 'Doxxing',
    category: 'socmint',
    definition:
      'Publishing a person’s private identifying information without consent, usually to harm. A privacy violation regardless of how the data was gathered.',
    see: 'pii',
  },
  {
    term: 'Gravatar',
    category: 'socmint',
    definition:
      'A globally recognized avatar keyed to an email hash. A quick way to test whether an email address has ever been registered on the web.',
  },

  // --- GEOINT & imagery ----------------------------------------------------
  {
    term: 'GEOINT',
    aka: 'Geospatial Intelligence',
    category: 'geoint',
    definition:
      'Intelligence derived from imagery and geospatial data — locating and dating where a photo, video, or event actually took place.',
    see: 'geolocation',
  },
  {
    term: 'Geolocation',
    category: 'geoint',
    definition:
      'Determining the place a piece of media or event shows, using visible clues (signage, architecture, terrain, shadows) rather than a reported location.',
    see: 'chronolocation',
  },
  {
    term: 'Chronolocation',
    category: 'geoint',
    definition:
      'Determining when a photo or video was taken, from shadows, weather, events, foliage, or metadata — the time half of verification.',
    see: 'geolocation',
  },
  {
    term: 'Geotag',
    category: 'geoint',
    definition:
      'Embedded location data (usually GPS coordinates) stored in a file’s metadata. Often stripped by platforms — do not assume it is there, and do not assume it is not.',
    see: 'exif',
  },
  {
    term: 'EXIF',
    aka: 'Exchangeable Image File Format',
    category: 'geoint',
    definition:
      'The metadata block inside a photo that can hold camera model, timestamp, orientation, and GPS. Source of both great leads and great embarrassment if leaked from your own files.',
    see: 'metadata',
  },
  {
    term: 'Reverse image search',
    category: 'geoint',
    definition:
      'Searching with an image instead of words to find other appearances of it. The core move for spotting recycled, misattributed, or earlier copies of a photo.',
    see: 'perceptual-hash',
  },
  {
    term: 'Perceptual hash',
    category: 'geoint',
    definition:
      'A fingerprint of an image’s visual content that survives resizing and minor edits. Used to match the “same” picture across platforms even when bytes differ.',
    see: 'reverse-image-search',
  },
  {
    term: 'Error level analysis',
    aka: 'ELA',
    category: 'geoint',
    definition:
      'A heuristic that re-compresses an image and highlights regions with different compression histories — a hint of editing, never proof.',
  },
  {
    term: 'Shadow analysis',
    category: 'geoint',
    definition:
      'Using the direction and length of shadows, combined with sun-position tools, to estimate the time (and sometimes latitude) a photo was taken.',
    see: 'chronolocation',
  },
  {
    term: 'Deepfake',
    category: 'geoint',
    definition:
      'Synthetic or manipulated audio/video generated to depict someone saying or doing something they did not. Verify the source, not just the pixels.',
  },

  // --- Network & infrastructure -------------------------------------------
  {
    term: 'WHOIS',
    category: 'network',
    definition:
      'A public registry lookup for a domain or IP: registrar, creation date, and often registrant details (frequently privacy-shielded).',
    see: 'dns',
  },
  {
    term: 'DNS',
    aka: 'Domain Name System',
    category: 'network',
    definition:
      'The system that maps domain names to IP addresses. Records of interest include A, AAAA, MX, TXT, and CNAME.',
    see: 'whois',
  },
  {
    term: 'Reverse DNS',
    category: 'network',
    definition:
      'Looking up the hostname associated with an IP address — often reveals hosting provider and naming conventions.',
  },
  {
    term: 'Subdomain',
    category: 'network',
    definition:
      'A named host under a domain (e.g. mail.example.com). Subdomain enumeration often exposes staging sites, admin panels, and forgotten services.',
  },
  {
    term: 'ASN',
    aka: 'Autonomous System Number',
    category: 'network',
    definition:
      'An identifier for a network block owned by an organization or ISP. Grouping IPs by ASN reveals who really hosts a service.',
  },
  {
    term: 'CIDR',
    aka: 'Classless Inter-Domain Routing',
    category: 'network',
    definition:
      'Notation for an IP range, e.g. 203.0.113.0/24. Useful for scoping scans and understanding network ownership.',
  },
  {
    term: 'Certificate transparency',
    category: 'network',
    definition:
      'Public logs of every TLS certificate issued. Searching them surfaces subdomains and services that were never meant to be advertised.',
    see: 'subdomain',
  },
  {
    term: 'Port scan',
    category: 'network',
    definition:
      'Probing a host for open ports to infer running services. Only ever run against systems you are authorized to test.',
  },
  {
    term: 'Shodan',
    category: 'network',
    definition:
      'A search engine for internet-connected devices, indexing banners from open services. A discovery tool, not an exploitation tool.',
  },
  {
    term: 'Traceroute',
    category: 'network',
    definition:
      'A tool that maps the network path to a host, revealing intermediate routers and rough geography.',
  },

  // --- Law, ethics & data --------------------------------------------------
  {
    term: 'PII',
    aka: 'Personally Identifiable Information',
    category: 'legal',
    definition:
      'Data that can identify a specific person — name, address, email, phone, government IDs. Handle the minimum needed, and store it securely or not at all.',
    see: 'doxxing',
  },
  {
    term: 'GDPR',
    aka: 'General Data Protection Regulation',
    category: 'legal',
    definition:
      'EU law governing the processing of personal data. It can apply to an investigator anywhere if the subject is in the EU — know your lawful basis.',
  },
  {
    term: 'Data minimization',
    category: 'legal',
    definition:
      'The principle of collecting and retaining only the personal data necessary for the stated purpose. Reduces both legal risk and breach impact.',
    see: 'pii',
  },
  {
    term: 'Authorization',
    category: 'legal',
    definition:
      'Documented permission to investigate a target or system — from the client, the employer, or in the case of systems, the owner. Without it, “research” is abuse.',
  },
  {
    term: 'Need-to-know',
    category: 'legal',
    definition:
      'The practice of sharing findings only with those whose role requires them. Protects subjects, sources, and the integrity of the case.',
  },
  {
    term: 'Data breach',
    category: 'legal',
    definition:
      'An incident in which personal data was exposed. Breach corpora are a common pivot for confirmed email/credential exposure (check only what you are authorized to).',
    see: 'pii',
  },

  // --- Tradecraft & OPSEC --------------------------------------------------
  {
    term: 'OPSEC',
    aka: 'Operational Security',
    category: 'tradecraft',
    definition:
      'Managing what you reveal while you work so targets and platforms cannot identify or profile you. A discipline, not a single tool.',
    see: 'attribution',
  },
  {
    term: 'Attribution (of self)',
    category: 'tradecraft',
    definition:
      'The risk that your own activity links back to you — shared accounts, reused avatars, timing, or payment. Assume any logged-in view is attributable.',
  },
  {
    term: 'Sock-puppet hygiene',
    category: 'tradecraft',
    definition:
      'Keeping research personas fully separated: distinct browser profiles, emails, and networks, with no crossover to your real identity.',
  },
  {
    term: 'Sandbox',
    category: 'tradecraft',
    definition:
      'An isolated environment for opening untrusted files or links so malware cannot reach your real system.',
  },
  {
    term: 'Fingerprinting',
    category: 'tradecraft',
    definition:
      'Platforms identifying you by browser, fonts, canvas, or device signals — even without cookies. A hardening concern for attributable research.',
  },
  {
    term: 'Burner',
    category: 'tradecraft',
    definition:
      'A throwaway asset — number, email, or account — used once for a specific task and then abandoned, so it cannot be linked across tasks.',
  },
  {
    term: 'Canary',
    category: 'tradecraft',
    definition:
      'A unique, planted string (a token sprinkled into a document or account) that alerts you if the material surfaces somewhere it should not.',
  },
  {
    term: 'Metadata hygiene',
    category: 'tradecraft',
    definition:
      'Stripping author, GPS, and device data from files before you publish them — the reverse of the EXIF you exploit in others’ files.',
    see: 'exif',
  },
];

/** Slug usable as an in-page anchor + cross-link target. */
export function termSlug(term) {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getTerm(term) {
  const slug = termSlug(term);
  return GLOSSARY_TERMS.find((t) => termSlug(t.term) === slug) ?? null;
}
