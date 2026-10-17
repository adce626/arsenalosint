export default {
  id: 'opsec',
  title: 'OPSEC for Investigators',
  summary:
    'Sock puppets, network hygiene, and the habits that stop your investigation from exposing you.',
  level: 'advanced',
  minutes: 15,
  tags: ['tradecraft', 'opsec', 'privacy'],
  blocks: [
    {
      type: 'p',
      text: 'Operational Security (OPSEC) is the practice of denying your adversary — the target, their associates, or the platform — any information about you or your investigation. In OSINT the adversary is often just an attentive person with the same tools you have.',
    },
    {
      type: 'h',
      text: 'Separate identities',
    },
    {
      type: 'list',
      items: [
        'Use a dedicated investigation browser profile or, better, a separate machine and network where feasible.',
        'For interactive steps, use a sock puppet account with a distinct name, avatar, writing style, and creation history.',
        'Never mix persona and personal accounts in the same browser profile — fingerprinting and cookie graphs will link them.',
        'Do not log into personal services while operating as the persona.',
      ],
    },
    {
      type: 'h',
      text: 'Network hygiene',
    },
    {
      type: 'list',
      items: [
        'A commercial VPN hides your IP from the sites you visit, but not from the VPN provider. Honestly assess your threat model.',
        'Tor is the stronger option for anonymity, at the cost of speed and some sites blocking it outright.',
        'Watch for leaks: WebRTC, browser extensions, DNS, and the "shared link" previews that fetch from your IP.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Passive before active',
      text: 'Every interactive action — a profile view, a login, an API call with your key — is a signal. Exhaust passive sources (search engines, archives, cache) before you ever touch the target directly.',
    },
    {
      type: 'h',
      text: 'Protect the work product',
    },
    {
      type: 'list',
      items: [
        'Encrypt your case files at rest; assume any device you carry can be lost.',
        'Strip metadata from anything you publish — see the metadata guide.',
        'Keep a clean audit trail: sources, timestamps, and reasoning, so your findings survive scrutiny.',
        'Do not let convenience erode discipline. One careless login can undo months of care.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'The mapping tool is local-first',
      text: "The bundled Mapping Tool stores nothing off-device: projects are plain JSON files you control, and settings live in your browser. That is deliberate — it keeps your investigation out of someone else's database.",
    },
    {
      type: 'h',
      text: 'Start with a threat model',
    },
    {
      type: 'p',
      text: 'OPSEC without a threat model is theatre. Decide who you are hiding from — the target, the platform, or an adversary with resources — because each demands different controls. A curious subject needs far less than a hostile state actor.',
    },
    {
      type: 'facts',
      items: [
        {
          label: 'Adversary: the target',
          value:
            'Motivated but usually low-capability. Separate browser profiles and a plausible sock puppet are generally enough.',
        },
        {
          label: 'Adversary: the platform',
          value:
            'Detects automation and linked accounts via fingerprinting and behaviour. Compartmentalise profiles, throttle requests, act like a human.',
        },
        {
          label: 'Adversary: a capable actor',
          value:
            'Assumes network observation and device compromise. Isolated hardware, Tor, and encrypted, air-gapped case storage.',
        },
        {
          label: 'Adversary: your own client / legal process',
          value:
            'Your case file can be subpoenaed or leaked. Minimise, encrypt at rest, and retain only what you can justify.',
        },
      ],
    },
    {
      type: 'steps',
      items: [
        'Write the threat model: who, against what, with what resources.',
        'Compartmentalise: one isolated identity and browser profile per investigation, never shared.',
        'Build the persona properly — a name, an avatar (reverse-search it to be sure it is not a real person), a history, and a writing style distinct from your own.',
        'Route traffic deliberately (VPN or Tor) and confirm there are no leaks before touching the target.',
        'Keep case files encrypted at rest and strip metadata from anything you export.',
        'Log your own actions with timestamps so you can prove what you did and did not do.',
      ],
    },
    {
      type: 'example',
      title: 'The persona that unmasked itself',
      scenario:
        'An investigator creates a sock puppet to view a locked profile, then a week later logs into a personal account in the same browser.',
      method:
        'The platform\'s cookie graph and device fingerprint link the two sessions. When the target checks "who viewed my profile", the persona\'s recent activity has faded, but the shared infrastructure now correlates the accounts.',
      result:
        'The burn comes from convenience, not cleverness. The fix is structural: a dedicated profile or machine for the persona, and never a shared login — discipline, not tricks.',
    },
    {
      type: 'checklist',
      title: 'Pre-operation OPSEC check',
      items: [
        'Threat model written and specific to this case.',
        'Persona built and its avatar reverse-checked as non-real.',
        'Isolated browser profile or machine — no personal logins present.',
        'Traffic routed and tested for WebRTC / DNS leaks.',
        'Case files encrypted at rest; a backup exists.',
        'A clear rule for when, if ever, I go interactive.',
      ],
    },
    {
      type: 'tools',
      title: 'OPSEC toolkit',
      items: [
        {
          label: 'VPN & Privacy tools',
          href: '/tools?category=vpn-privacy',
          note: 'Network hygiene, anonymity, and encrypted comms.',
        },
        {
          label: 'Document Metadata tools',
          href: '/tools?category=document-metadata',
          note: 'Strip tags from anything you publish or export.',
        },
      ],
    },
  ],
};
