export default {
  id: 'google-dorking',
  title: 'Search Operators & Dorking',
  summary:
    'Advanced query syntax that turns a search engine into a precision instrument for exposed data.',
  level: 'intermediate',
  minutes: 12,
  tags: ['techniques', 'search'],
  blocks: [
    {
      type: 'p',
      text: 'Search engines index far more than most people ask for. "Dorking" is the practice of composing precise queries that surface files, login pages, and records that were never meant to be advertised.',
    },
    {
      type: 'callout',
      tone: 'legal',
      title: 'Look, do not touch',
      text: 'Finding an exposed admin panel or a spreadsheet of personal data is not the same as using it. Accessing or downloading protected data can be a crime. Document what you found and report it.',
    },
    {
      type: 'h',
      text: 'Core operators',
    },
    {
      type: 'table',
      head: ['Operator', 'Does', 'Example'],
      rows: [
        ['site:', 'Restrict to one domain', 'site:example.com login'],
        [
          'filetype:',
          'Find specific file types',
          'filetype:pdf "not for distribution"',
        ],
        ['intitle: / inurl:', 'Match page title / URL', 'intitle:"index of"'],
        ['"..."', 'Exact phrase', '"confidential draft"'],
        ['-word', 'Exclude a term', 'jaguar -car -animal'],
        ['OR / AND', 'Boolean logic', '"john doe" OR "j. doe"'],
        ['*', 'Wildcard word', '"password for * account"'],
      ],
    },
    {
      type: 'h',
      text: 'Putting it together',
    },
    {
      type: 'code',
      text: 'site:example.com filetype:pdf (invoice OR receipt) -template\ndept:security "internal use only" filetype:xlsx',
    },
    {
      type: 'p',
      text: 'Chain operators from broad to narrow: start with the domain, add a file type, then a distinctive phrase. If you get thousands of hits, you have not been specific enough; if you get zero, loosen one constraint at a time.',
    },
    {
      type: 'list',
      items: [
        'Search other engines too — Bing, Yandex (strong on faces and Eastern Europe), and regional engines index different corpora.',
        'Search code: GitHub, GitLab and grep.app surface credentials and configs accidentally committed.',
        'Use archives: a dork that finds it today may only have found a cached copy last year.',
      ],
    },
    {
      type: 'h',
      text: 'Dork patterns worth memorising',
    },
    {
      type: 'table',
      head: ['Goal', 'Query pattern'],
      rows: [
        [
          'Open directory listings',
          'intitle:"index of" "parent directory" site:example.com',
        ],
        [
          'Exposed config / env files',
          'site:example.com ext:env OR ext:yml OR ext:ini "password"',
        ],
        [
          'Spreadsheets of people',
          'site:example.com (filetype:xlsx OR filetype:csv) "email"',
        ],
        [
          'Login / admin surfaces',
          'site:example.com (inurl:login OR inurl:admin)',
        ],
        [
          'Documents with hidden authors',
          'site:example.com filetype:pdf "internal use only"',
        ],
      ],
    },
    {
      type: 'example',
      title: "Scoping an organisation's exposure",
      scenario:
        'You are assessing what a company has inadvertently published, for a defensive brief.',
      method:
        'Start with `site:example.com` and add a file type, then a distinctive phrase. Fan out across engines and code hosts, and archive every hit before it is patched away. You record the finding; you do not open data you are not entitled to see.',
      result:
        'A short list of exposed documents and misconfigured directories, each with a URL and a timestamp — delivered as a remediation report with "look, do not touch" discipline throughout.',
    },
    {
      type: 'checklist',
      title: 'Dorking session checklist',
      items: [
        'Domain and target confirmed before any query.',
        'Queries built broad-to-narrow, one operator added at a time.',
        'At least two engines used; code hosts checked for credentials.',
        'Every useful hit archived with its URL and date.',
        'Nothing behind a login was accessed — findings documented, not exploited.',
      ],
    },
    {
      type: 'tools',
      title: 'Search & dorking toolkit',
      items: [
        {
          label: 'Search & Dorking tools',
          href: '/tools?category=search-dorking',
          note: 'Dork builders, multi-engine front-ends, and code-search utilities.',
        },
        {
          label: 'Data Breach tools',
          href: '/tools?category=data-breach',
          note: 'Check exposure surfaced by dorks against known breach corpora.',
        },
      ],
    },
  ],
};
