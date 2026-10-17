export default {
  id: 'mapping-your-case',
  title: 'Mapping a Case End to End',
  summary:
    'How to use the built-in Mapping Tool: model the target, link identifiers, and pin the places that matter.',
  level: 'beginner',
  minutes: 12,
  tags: ['fundamentals', 'tooling', 'workflow'],
  blocks: [
    {
      type: 'p',
      text: 'The Mapping Tool turns an investigation into something you can see and reason about. The Information tab is a graph of what you know; the Map tab is where it happened. The two are connected, so a coffee-shop pin can carry the Instagram account that checked in there.',
    },
    {
      type: 'steps',
      items: [
        'Create a project and set the target name. Pick Google Maps (richer place data, needs a key) or OpenStreetMap (free, no key) on first run.',
        'Open the Information tab. Add an identifier for every person, account, phone, vehicle, or address you confirm — each becomes a node.',
        "Wire nodes together by dragging from one node's handle to another. Drop a wire on empty space to spawn a connected node, Blender-style.",
        'Switch to the Map tab. Click anywhere to drop a pin; known places get their name, address, and icon filled in automatically.',
        'Link pins and identifiers: open a pin\'s card or an identifier\'s editor and attach the other side, with a short context note ("checked in on IG").',
        'Turn on "Connect pins" to trace a route, then save the whole thing to a single .osint.json file you can archive or share.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'One entity, one node',
      text: 'Add a node the first time you confirm something, then link to it. Duplicated entities fracture the graph and hide the relationships you are trying to find.',
    },
    {
      type: 'h',
      text: 'Reading the graph',
    },
    {
      type: 'list',
      items: [
        'The shape of the graph is a finding: a cluster of accounts sharing a phone number, or a set of pins sharing one identifier, tells a story.',
        'Use the sidebar hover to light up linked pins on the map — great for spotting which places belong to which persona.',
        'Save often. The app also keeps local snapshots under "Continue recent" so a stray back-button won\'t lose your work.',
      ],
    },
    {
      type: 'callout',
      tone: 'legal',
      title: 'Handle your case file with care',
      text: "A saved project can contain real people's addresses, numbers, and movements. Treat the .osint.json like a sensitive document: encrypt it, and share it only with those authorised to see it.",
    },
    {
      type: 'h',
      text: 'Painting the picture as you go',
    },
    {
      type: 'p',
      text: 'Do not save the graph for the end. Build it while you collect: each confirmed entity becomes a node the moment you find it, and each relationship is a link you can justify. The graph then does your analysis — clusters, bridges, and isolated leads appear on their own.',
    },
    {
      type: 'example',
      title: 'From scattered tabs to one picture',
      scenario:
        'You have a name, two social handles, a phone number, and three placed photos, collected over an afternoon.',
      method:
        'Create the person node, then a node per handle, the phone, and each photo location. Draw a link from the phone to the handle you found on a marketplace, and from the handle to the two pins it checked into. Turn on "Connect pins" to trace the route between photos.',
      result:
        'The shape reveals that both handles share the one phone and the photos cluster around a single neighbourhood — a movement pattern you could not see in the tabs, now exportable as a single .osint.json.',
    },
    {
      type: 'checklist',
      title: 'Graph hygiene',
      items: [
        'One node per entity — no duplicates for the same person or place.',
        'Every link has a short context note and a confidence level.',
        'Provenance (source URL, date) recorded for each node.',
        'The project saved to a .osint.json and backed up.',
        'Case file treated as sensitive: encrypted, shared only as authorised.',
      ],
    },
    {
      type: 'tools',
      title: 'Frameworks & analysis',
      items: [
        {
          label: 'Frameworks tools',
          href: '/tools?category=frameworks',
          note: 'Link-analysis and structured-analysis methods that pair with the graph.',
        },
        {
          label: 'Open the Mapping Tool',
          href: '/mapping',
          note: 'Everything in this guide, in the app.',
        },
      ],
    },
  ],
};
