/**
 * Tool playbooks — end-to-end, shareable workflows that pair a real question
 * with the exact tool chain for answering it.
 *
 * Shape:
 *   { slug, title, summary, category, difficulty, minutes,
 *     tools: [{ label, href }], steps: [{ title, detail, output? }], tips: [] }
 *
 * `tools[].href` should deep-link into the tools catalog
 * (`/tools?q=…&category=…`) or point at an external service.
 */

export const PLAYBOOK_CATEGORIES = [
  { id: 'people', label: 'People & identity' },
  { id: 'media', label: 'Media verification' },
  { id: 'infrastructure', label: 'Domains & infrastructure' },
  { id: 'field', label: 'Field & mapping' },
];

export const PLAYBOOKS = [
  {
    slug: 'trace-a-username',
    title: 'Trace a username across platforms',
    summary:
      'Start from a single handle and build a corroborated map of every account, alias, and contact channel it opens onto.',
    category: 'people',
    difficulty: 'beginner',
    minutes: 30,
    tools: [
      {
        label: 'Username enumeration',
        href: '/tools?category=username-social',
      },
      { label: 'Search the catalog', href: '/tools?q=username' },
      { label: 'SOCMINT guide', href: '/guides/socmint' },
    ],
    steps: [
      {
        title: 'Fix the exact handle',
        detail:
          'Write down the handle character-for-character, including underscores, dots, and case. Note every variant the subject is likely to reuse (with/without digits, real name mashed together).',
        output: 'A list of 3–6 candidate strings.',
      },
      {
        title: 'Run an enumeration tool',
        detail:
          'Feed the primary handle into a username-checking tool to get a first-pass list of platforms where it exists. Treat every hit as a lead, not a match.',
        output: 'A raw list of candidate profiles.',
      },
      {
        title: 'Verify each hit by hand',
        detail:
          'Open the profile and confirm it plausibly belongs to the same person: avatar reuse, bio text, posting style, links, and join date. Discard name collisions.',
        output: 'A shortlist of confirmed accounts.',
      },
      {
        title: 'Harvest pivots',
        detail:
          'From confirmed profiles pull emails, linked sites, other handles, and location hints. Each is a new pivot — log it immediately.',
        output: 'New identifiers to feed back into the top of the loop.',
      },
      {
        title: 'Repeat on variants and aliases',
        detail:
          'Re-run enumeration on each alias and variant. Relationships between accounts (follows, tags) often reveal the rest of the network.',
        output: 'A cross-platform account map.',
      },
    ],
    tips: [
      'An unused-looking profile with a matching handle is often a parked name-squat, not your subject.',
      'Check the profile’s oldest posts — they leak the most (older photos, old locations, old friends).',
      'Record confidence for each account before you move on; do not let a guess become a fact.',
    ],
  },
  {
    slug: 'geolocate-a-photo',
    title: 'Geolocate a photograph',
    summary:
      'Place an image on the map using nothing but what is visible in the frame — signs, skyline, terrain, and shadows.',
    category: 'media',
    difficulty: 'intermediate',
    minutes: 45,
    tools: [
      { label: 'Geolocation tools', href: '/tools?category=geolocation' },
      { label: 'GEOINT guide', href: '/guides/geoint' },
      { label: 'Mapping workspace', href: '/mapping' },
    ],
    steps: [
      {
        title: 'Do not trust the caption',
        detail:
          'Assume the stated location is wrong until proven otherwise. Your job is to derive the location from the pixels.',
        output: 'A clean slate.',
      },
      {
        title: 'Inventory every clue',
        detail:
          'List all readable text, language, licence plates, phone prefixes, brand names, architecture, road markings, vegetation, and terrain. Zoom to the maximum.',
        output: 'A clue sheet.',
      },
      {
        title: 'Reverse-image search',
        detail:
          'Run the image (and tight crops of distinctive regions) through reverse-search engines to find earlier or higher-resolution copies and any prior captions.',
        output: 'Earlier copies and candidate locations.',
      },
      {
        title: 'Read the light',
        detail:
          'Use shadows and a sun-position tool together with the photo’s claimed time to estimate the compass heading and latitude band.',
        output: 'A time/heading constraint.',
      },
      {
        title: 'Match on satellite and street',
        detail:
          'Search satellite imagery for the terrain and road layout, then confirm on street-level imagery. Match until at least three independent features line up.',
        output: 'Coordinates on the map.',
      },
      {
        title: 'Pin it and date it',
        detail:
          'Drop the location into the Mapping workspace, attach the source and your confidence, and note the estimated capture date.',
        output: 'A documented, mapped finding.',
      },
    ],
    tips: [
      'Three matching features beats one convincing one — force yourself to find corroboration.',
      'Power lines, pylons, and bus-stop signage are quieter, more reliable anchors than big landmarks.',
      'If it will not resolve, write down exactly what blocked you; that is a result too.',
    ],
  },
  {
    slug: 'investigate-a-domain',
    title: 'Profile a domain and its infrastructure',
    summary:
      'Move from a bare domain to its owner, hosting, related subdomains, and the people or organizations behind it.',
    category: 'infrastructure',
    difficulty: 'intermediate',
    minutes: 40,
    tools: [
      { label: 'Domain & IP tools', href: '/tools?category=domain-ip-network' },
      { label: 'Certificate search', href: '/tools?q=certificate' },
      { label: 'WHOIS lookup', href: '/tools?q=whois' },
    ],
    steps: [
      {
        title: 'Registration history',
        detail:
          'WHOIS the domain: creation and expiry dates, registrar, and any registrant details. Note privacy shields and the dates they were applied.',
        output: 'Ownership and age of the domain.',
      },
      {
        title: 'DNS records',
        detail:
          'Pull A/AAAA, MX, TXT, and CNAME records. MX and TXT often reveal the real email and hosting providers behind a site.',
        output: 'The service stack.',
      },
      {
        title: 'Subdomain enumeration',
        detail:
          'Query certificate-transparency logs and DNS datasets for subdomains — staging sites, admin panels, and mail servers routinely leak there.',
        output: 'The full exposed surface.',
      },
      {
        title: 'Hosting and neighbours',
        detail:
          'Resolve the IPs, group them by ASN, and check what else shares the host. Shared infrastructure is a rich pivot.',
        output: 'Network ownership map.',
      },
      {
        title: 'Fingerprint the site',
        detail:
          'Identify the CMS, frameworks, and third-party scripts from page source and headers. Version strings hint at the operator’s habits and timeframe.',
        output: 'Technical profile.',
      },
      {
        title: 'Archive and capture',
        detail:
          'Check historical snapshots for changed content, then archive the current state as evidence with a timestamp.',
        output: 'A dated evidence capture.',
      },
    ],
    tips: [
      'WHOIS privacy does not mean anonymous — creation dates and registrar patterns still cluster related domains.',
      'Look for look-alike and typo domains registered around the same time; they often belong to the same campaign.',
      'Only scan ports on systems you are explicitly authorized to test.',
    ],
  },
  {
    slug: 'verify-a-video',
    title: 'Verify a video clip',
    summary:
      'Establish whether a circulating clip is authentic, where and when it was filmed, and whether it has been edited or recycled.',
    category: 'media',
    difficulty: 'advanced',
    minutes: 60,
    tools: [
      {
        label: 'Image & video forensics',
        href: '/tools?category=image-facial',
      },
      { label: 'Geolocation tools', href: '/tools?category=geolocation' },
      { label: 'Verify media guide', href: '/guides/reverse-image-search' },
    ],
    steps: [
      {
        title: 'Capture before you analyze',
        detail:
          'Download the clip and record its URL, uploader, timestamp, and any caption. The original can vanish mid-investigation.',
        output: 'A preserved copy plus provenance notes.',
      },
      {
        title: 'Find the earliest instance',
        detail:
          'Extract keyframes and reverse-search them to locate the earliest upload. The first appearance usually carries the most accurate context.',
        output: 'The earliest known date.',
      },
      {
        title: 'Break it into frames',
        detail:
          'Sample frames at scene changes and inspect them for continuity: replicated objects, warped edges, and mismatched lighting indicate editing.',
        output: 'Suspicious frames flagged.',
      },
      {
        title: 'Geolocate and chronolocate',
        detail:
          'Run the geolocation playbook on the clearest frames, then use shadow and weather to pin the time of day and season.',
        output: 'Location and time constraints.',
      },
      {
        title: 'Corroborate with independent sources',
        detail:
          'Find news, witnesses, or other footage of the same event and check that details agree. Conflict is a finding, not a failure.',
        output: 'A confidence statement.',
      },
    ],
    tips: [
      'A clip can be real footage re-captioned with a false location or date — verify context, not just pixels.',
      'Re-encoded clips strip metadata; do not read an empty EXIF block as evidence of tampering.',
      'State your conclusion as high/medium/low confidence, with the reasoning attached.',
    ],
  },
  {
    slug: 'check-email-exposure',
    title: 'Check an email for exposure',
    summary:
      'Find where an address is registered, whether it appears in breaches, and what the address reveals about its owner.',
    category: 'people',
    difficulty: 'beginner',
    minutes: 25,
    tools: [
      { label: 'Email & phone tools', href: '/tools?category=email-phone' },
      { label: 'Breach lookup', href: '/tools?category=data-breach' },
      { label: 'Email recon guide', href: '/guides/email-phone-recon' },
    ],
    steps: [
      {
        title: 'Validate the address',
        detail:
          'Confirm the syntax and the domain’s mail records, and check for disposable or catch-all providers that indicate a throwaway.',
        output: 'Whether the address is real and deliverable.',
      },
      {
        title: 'Registration footprint',
        detail:
          'Use an account-discovery service to see which platforms the address is registered on. This reveals the subject’s services without logging in.',
        output: 'A platform list.',
      },
      {
        title: 'Breach exposure',
        detail:
          'Query breach corpora for the address to learn which incidents touched it and what data classes were exposed (passwords, addresses, IPs).',
        output: 'Exposure timeline.',
      },
      {
        title: 'Gravatar and avatar pivots',
        detail:
          'Hash the address and check the global avatar directory — a returned image is both a face pivot and confirmation the address is in active use.',
        output: 'A candidate avatar to reverse-search.',
      },
      {
        title: 'Document lawfully',
        detail:
          'Record only what your authorization covers, note the confidence of each finding, and avoid collecting credentials you have no basis to hold.',
        output: 'A clean, scoped record.',
      },
    ],
    tips: [
      'A breach hit means data was exposed, not that the subject did anything wrong — write it that way.',
      'Catch-all domains accept mail to any address; a “valid” response there proves nothing.',
      'Never test credentials you find — possession and use are different legal questions.',
    ],
  },
  {
    slug: 'map-a-case',
    title: 'Map a case in the workspace',
    summary:
      'Turn scattered findings into a structured project: identifiers, links, locations, a timeline, and an exportable report.',
    category: 'field',
    difficulty: 'beginner',
    minutes: 35,
    tools: [
      { label: 'Mapping Tool guide', href: '/guides/mapping-your-case' },
      { label: 'Open the workspace', href: '/mapping' },
      { label: 'Printable reference', href: '/reference' },
    ],
    steps: [
      {
        title: 'Define the question',
        detail:
          'Open the workspace and write the target and the question you are answering. Every later entry should serve that question.',
        output: 'A scoped project.',
      },
      {
        title: 'Enter identifiers as you find them',
        detail:
          'Add each confirmed identifier — name, email, handle, phone, domain — and paste the source URL, accessed date, and a confidence level.',
        output: 'A provenance-backed entity list.',
      },
      {
        title: 'Draw the links',
        detail:
          'Connect related identifiers and set a confidence on each link. Colour-coded edges show which relationships are solid and which are leads.',
        output: 'A relationship graph.',
      },
      {
        title: 'Place the locations',
        detail:
          'Drop pins for every located event, link them to the relevant identifiers, and add visited/observed dates.',
        output: 'A populated map.',
      },
      {
        title: 'Build the timeline',
        detail:
          'Record dated events and link each to its people and places. Pin visits from the map appear automatically.',
        output: 'A chronological view.',
      },
      {
        title: 'Export the report',
        detail:
          'Generate the report for a backgrounder, with a timeline and an evidence appendix listing every source and its confidence.',
        output: 'A shareable, printable deliverable.',
      },
    ],
    tips: [
      'Set confidence honestly as you go — the report is only as trustworthy as your lowest-rated link.',
      'The workspace is local-first: nothing leaves your browser, so save the project file if you need to move it.',
      'Re-read the ethics guide before you publish anything sourced from real people.',
    ],
  },
];

export function getPlaybook(slug) {
  return PLAYBOOKS.find((p) => p.slug === slug) ?? null;
}

export const DIFFICULTY_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
