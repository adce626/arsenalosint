export default {
  id: 'intelligence-cycle',
  title: 'The Intelligence Cycle',
  summary:
    'A repeatable five-phase loop that turns a vague question into a defensible answer.',
  level: 'beginner',
  minutes: 10,
  tags: ['fundamentals', 'methodology'],
  blocks: [
    {
      type: 'p',
      text: 'Amateur OSINT is a pile of tabs. Professional OSINT is a process. The intelligence cycle is that process: it keeps you honest and stops you from chasing shiny objects that do not answer the question you were actually asked.',
    },
    {
      type: 'steps',
      items: [
        'Planning & Direction — write down the question and the decision it informs. "Is this profile the same person as X?" is better than "find everything about X".',
        'Collection — gather raw material from identified sources. Log the URL and the access time for every artefact.',
        'Processing — normalise what you collected: convert formats, extract text, de-duplicate, translate, and put it into a structured form.',
        'Analysis — connect, corroborate, and weigh the evidence. Here you separate signal from noise and state confidence levels.',
        'Dissemination — deliver the finding with its caveats, sources, and confidence. A finding without provenance is an opinion.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'The cycle is a loop, not a line',
      text: 'Analysis almost always exposes gaps that send you back to collection. Budget your time assuming at least two passes.',
    },
    {
      type: 'h',
      text: 'Structuring the material',
    },
    {
      type: 'p',
      text: 'Most investigations are a graph: people, accounts, phone numbers, vehicles, addresses, and the links between them. Capture each entity once and record how it relates to the others. This is exactly what the built-in Mapping Tool is for — see "Mapping a case end to end".',
    },
    {
      type: 'table',
      head: ['Phase', 'Key question', 'Common mistake'],
      rows: [
        [
          'Planning',
          'What decision does this inform?',
          'Collecting with no objective',
        ],
        ['Collection', 'What is the primary source?', 'Trusting screenshots'],
        [
          'Processing',
          'Is this normalised?',
          'Mixing formats, losing provenance',
        ],
        ['Analysis', 'How confident am I?', 'Treating a guess as a fact'],
        [
          'Dissemination',
          'Can a reviewer retrace me?',
          'No sources, no caveats',
        ],
      ],
    },
    {
      type: 'h',
      text: 'From question to collection plan',
    },
    {
      type: 'p',
      text: 'The gap between a vague ask and productive collection is a written plan. Turn the question into a short list of the specific entities you need to confirm or deny, then list where each one could plausibly live. That list is your collection plan — and it stops the tab explosion.',
    },
    {
      type: 'steps',
      items: [
        'Restate the question as a decision: "We need to know whether to extend credit to this applicant."',
        'Break it into sub-questions: identity, address history, business affiliations, adverse history.',
        'For each sub-question, name the source type: company registry, property records, court records, social platforms.',
        'Rank the sources by reliability and cost, then work from the cheapest and most primary outward.',
        'Set a time-box and a stopping rule — what evidence would close the question?',
      ],
    },
    {
      type: 'example',
      title: 'Running the cycle on a fraud lead',
      scenario:
        'A payment processor flags an account. The question: is this merchant a real, trading business or a shell?',
      method:
        'Planning: decide "real vs shell" is the question. Collection: pull the company registry filing, the website WHOIS, the advertised address, and the owner\'s public profiles. Processing: normalise dates and names into the graph. Analysis: compare the registered director against the advertised name and the address against a known mail-drop. Dissemination: a one-page finding with each claim sourced.',
      result:
        'The registry director does not match the site\'s claimed founder and the address is a virtual-office provider used by hundreds of companies — reported as "shell-likely, medium confidence", with the three records that support it.',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Keep a provenance record from the first click',
      text: 'Every artefact gets: source URL, who published it, when it was published, when you accessed it, and a hash or screenshot for anything volatile. Rebuilding provenance after the fact is painful and unconvincing.',
    },
    {
      type: 'checklist',
      title: 'Standard provenance fields for every artefact',
      items: [
        'Source URL and site name',
        'Publisher / author, if identifiable',
        'Publication date and your access date',
        'An archived copy (Wayback, archive.today) for anything that might change or vanish',
        'Your one-line note on what this artefact proves',
      ],
    },
    {
      type: 'tools',
      title: 'Run the cycle with these',
      items: [
        {
          label: 'Frameworks & methodologies',
          href: '/tools?category=frameworks',
          note: 'Structured analytic techniques and checklists for the analysis phase.',
        },
        {
          label: 'Web archives',
          href: '/tools?q=archive',
          note: 'Lock in provenance for volatile sources before they change.',
        },
        {
          label: 'Mapping a case end to end',
          href: '/guides/mapping-your-case',
          note: 'The Processing and Analysis phases, done in the built-in tool.',
        },
      ],
    },
  ],
};
