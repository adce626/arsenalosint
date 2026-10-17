export default {
  id: 'socmint',
  title: 'SOCMINT — Social Media Intelligence',
  summary:
    'Reading social platforms for identity, relationships, location, and behaviour — without tipping off the target.',
  level: 'intermediate',
  minutes: 13,
  tags: ['disciplines', 'social'],
  blocks: [
    {
      type: 'p',
      text: 'SOCMINT is the subset of OSINT that works social platforms: who someone is, who they know, where they go, and when. It is the richest source of human context and the easiest to get wrong.',
    },
    {
      type: 'h',
      text: 'What you are extracting',
    },
    {
      type: 'table',
      head: ['Signal', 'Where it hides', 'How it helps'],
      rows: [
        [
          'Identity',
          'Handle history, display names, bio links',
          'Cross-platform correlation',
        ],
        [
          'Network',
          'Tagged photos, friend lists, mutuals',
          'Associates and family',
        ],
        [
          'Location',
          'Geotags, check-ins, background landmarks',
          'Places and routines',
        ],
        ['Temporal', 'Post times, "seen" timestamps', 'Timezone and schedule'],
      ],
    },
    {
      type: 'h',
      text: 'Correlation, not assumption',
    },
    {
      type: 'p',
      text: 'The same username across platforms is a lead, not proof. Confirm with independent signals: a shared unique bio phrase, a linked profile URL, a consistent avatar (reverse-search it), and overlapping follower graphs. Aim for two unrelated corroborations before you assert identity.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Archived vs. live',
      text: 'Platforms rewrite history. Pull the Wayback Machine or an archive service for anything that might be deleted, and capture the live version with its timestamp. Deleted is not gone.',
    },
    {
      type: 'h',
      text: 'Avoiding the tell',
    },
    {
      type: 'list',
      items: [
        "Never use your real account to view, follow, or like a target's content.",
        'Remember that a profile view can surface you, depending on the platform.',
        'Prefer passive collection (search engines, archives, cached copies) before any interactive step.',
        'If an account is required, use a purpose-built sock puppet — see the OPSEC guide.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'The mapping connection',
      text: "Every account you confirm is an identifier node in the Mapping Tool. Link it to the places it reveals so a timeline of the target's movement falls out visually.",
    },
    {
      type: 'h',
      text: 'Pivoting from one handle',
    },
    {
      type: 'p',
      text: 'The professional move is enumeration: take the single handle you have and test it everywhere at once, then filter the matches by weak signals rather than trusting the first hit. Most people reuse handles across accounts even when they think they do not.',
    },
    {
      type: 'steps',
      items: [
        'Enumerate the handle across platforms and note every live profile, even the empty ones.',
        'Rank candidates by independent signals: avatar match, bio phrasing, linked accounts, follower overlap, join date.',
        'Capture each candidate profile with an archived copy and the exact URL.',
        'For the strongest candidate, pull the network: tagged photos, mutuals, and comment threads reveal associates.',
        'Feed each confirmed account into the graph as its own node and link it to the person node.',
      ],
    },
    {
      type: 'example',
      title: 'A handle to a person in four pivots',
      scenario:
        'You have one username from a marketplace listing and nothing else.',
      method:
        "Enumerate the handle across forums, GitHub, and three social platforms. Two profiles reuse the same cartoon avatar. The GitHub bio links a personal site; the site's contact page lists a first name and a city. A tagged photo on one platform shows a workplace lanyard.",
      result:
        'Name, city, and employer are now corroborated by three independent surfaces, and the marketplace handle links back to the same avatar — enough to brief a client with confidence levels and sources.',
    },
    {
      type: 'checklist',
      title: 'SOCMINT collection hygiene',
      items: [
        'Collected as a logged-out / passive viewer, never from a personal account.',
        'Captured each profile to an archive before it can change.',
        'Recorded join date, follower count, and bio verbatim — not paraphrased.',
        'Noted platform-specific tells (UTC offsets, default avatars, language mix).',
        'Flagged anything that could be a shared or fake account rather than the target.',
      ],
    },
    {
      type: 'tools',
      title: 'SOCMINT toolkit',
      items: [
        {
          label: 'Username & Social tools',
          href: '/tools?category=username-social',
          note: 'Handle enumeration, profile scrapers, and network mapping.',
        },
        {
          label: 'Image & Facial tools',
          href: '/tools?category=image-facial',
          note: 'Reverse-search avatars and face-match across platforms.',
        },
        {
          label: 'OPSEC for Investigators',
          href: '/guides/opsec',
          note: 'Sock puppets and network hygiene for the interactive steps.',
        },
      ],
    },
  ],
};
