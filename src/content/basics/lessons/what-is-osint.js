export default {
  id: 'what-is-osint',
  title: 'What is OSINT?',
  summary:
    'Definitions, the difference between open source and covert collection, and what counts as a legitimate source.',
  level: 'beginner',
  minutes: 9,
  tags: ['fundamentals', 'concepts'],
  blocks: [
    {
      type: 'p',
      text: 'Open-Source Intelligence (OSINT) is intelligence produced from publicly or commercially available information that is collected, refined, and analyzed to answer a specific question. The "open" part means the source is lawfully accessible to anyone — no hacking, no deception, no special access required.',
    },
    {
      type: 'h',
      text: 'Open source vs. "publicly available"',
    },
    {
      type: 'p',
      text: 'The distinction that trips people up is that open does not always mean free or indexed by Google. Data can be public but gated (a paid records database), public but obscured (an image with useful EXIF), or public but scattered. OSINT is the discipline of finding it, not just googling it.',
    },
    {
      type: 'list',
      items: [
        'Open source — media, websites, social platforms, public records, satellite imagery, government publications.',
        'Commercially available — paid data brokers and records services you are licensed to use.',
        'Not OSINT — breaching a system, impersonating a person to obtain access, or buying leaked data. Those are illegal regardless of intent.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'The source hierarchy',
      text: 'Prefer primary sources (the original post, the raw record) over secondary ones (a screenshot, a blog that summarises it). Screenshots lose metadata, timestamps, and context — and are trivial to fake.',
    },
    {
      type: 'table',
      head: ['Type', 'Example', 'Reliability'],
      rows: [
        ['Primary', 'A live tweet, an official registry entry', 'Highest'],
        ['Secondary', 'A news article quoting the tweet', 'Medium'],
        ['Tertiary', 'A wiki summarising the article', 'Lowest'],
      ],
    },
    {
      type: 'h',
      text: 'Where OSINT is used',
    },
    {
      type: 'p',
      text: 'Journalists verifying claims, fraud and AML investigators, security teams profiling threat actors, corporate due diligence, and — responsibly — individuals trying to understand their own digital footprint. The techniques are neutral; the intent and the law are what matter.',
    },
    {
      type: 'h',
      text: "The investigator's mindset",
    },
    {
      type: 'p',
      text: 'Tools do not find people; questions do. A useful working definition of the job: collect the minimum public facts that let you answer one specific question, and record why you believe each one. The discipline is in the reasoning trail, not the haul.',
    },
    {
      type: 'list',
      items: [
        'Start from the question, never the tool. "Which accounts share this recovery email?" beats "open every social site".',
        'Write findings as claims with evidence: claim, source, timestamp, confidence. A screenshot with no URL is not evidence.',
        'Triangulate: one public data point is a lead; two independent sources agreeing is a finding.',
        'Assume you are wrong and hunt for the disconfirming case — this is what separates analysis from confirmation bias.',
      ],
    },
    {
      type: 'example',
      title: 'Is this blog the same person?',
      scenario:
        'A subject claims a personal blog. You need to decide whether it belongs to the same person you are investigating, not just someone with a similar name.',
      method:
        "Pull the blog's author name, the email or social links in the footer, and the domain registration. Cross-check those against the subject's known handles and the reused profile photo — then look for one detail only the real subject would know (an old employer, a pet, a closed account name).",
      result:
        'Two independent matches (a re-used avatar and a listed work email at a company the subject previously worked for) plus a unique in-joke lift this from "unverified" to "probable, with provenance". You report the two matches and the confidence — not a bare yes.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The most expensive mistake: assuming a name is an identity',
      text: 'Names are not unique, and common names collide constantly in every database. Never merge two records because the names match — merge them because an independent identifier (phone, email, handle, photo) matches.',
    },
    {
      type: 'checklist',
      title: 'Before you collect anything',
      items: [
        'I can state the decision this investigation informs in one sentence.',
        'I have written authorisation or a lawful basis for handling personal data.',
        'I know which identifiers I already hold (name, email, phone, handle, photo).',
        'I have decided how I will store findings — and where I will not put them.',
      ],
    },
    {
      type: 'tools',
      title: 'Where to start collecting',
      items: [
        {
          label: 'Search & Dorking tools',
          href: '/tools?category=search-dorking',
          note: 'Engine front-ends and dork builders — the entry point for almost any case.',
        },
        {
          label: 'People & Identity tools',
          href: '/tools?category=people-identity',
          note: 'Name, account, and record pivots once you have a starting identifier.',
        },
        {
          label: 'Mapping Tool',
          href: '/mapping',
          note: 'Turn collected entities and places into a graph you can reason about.',
        },
      ],
    },
  ],
};
