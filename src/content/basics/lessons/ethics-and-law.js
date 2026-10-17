export default {
  id: 'ethics-and-law',
  title: 'Ethics & Law',
  summary:
    'The rules that keep OSINT legal and defensible: jurisdiction, terms of service, and proportionality.',
  level: 'beginner',
  minutes: 11,
  tags: ['fundamentals', 'legal', 'ethics'],
  blocks: [
    {
      type: 'callout',
      tone: 'legal',
      title: 'Not legal advice',
      text: 'This is general orientation, not a substitute for advice from a qualified lawyer in your jurisdiction. Laws differ sharply by country and by your purpose (journalism, security research, private investigation, employment).',
    },
    {
      type: 'p',
      text: 'OSINT sits in a grey zone on purpose: the information is public, but how you collect it and what you do with it can still be unlawful or unethical. Three tests keep most work on the right side of the line.',
    },
    {
      type: 'h',
      text: '1. Legality',
    },
    {
      type: 'list',
      items: [
        'Never access anything behind authentication you are not entitled to use.',
        'Do not use leaked or breached datasets, even if they are "just sitting there".',
        'Respect anti-harassment and stalking statutes — repeated unwanted monitoring of a person is a crime in many places.',
        'Data-protection regimes (GDPR, UK DPA, CCPA) constrain collecting and storing personal data even when it is public.',
      ],
    },
    {
      type: 'h',
      text: '2. Terms of service',
    },
    {
      type: 'p',
      text: 'Platform ToS are civil contracts, not criminal law — but violating them can get accounts suspended and, in some jurisdictions, carries separate liability. Automated scraping is the usual flashpoint: prefer official APIs and their rate limits.',
    },
    {
      type: 'h',
      text: '3. Ethics & proportionality',
    },
    {
      type: 'list',
      items: [
        'Minimise: collect only what the question requires, not everything you can.',
        "Do not cause harm to bystanders — the target's children, colleagues, and neighbours are not your subject.",
        'Do not make contact or interact without a clear, authorised reason.',
        'Document your authorisation: who asked, why, and what scope they approved.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The occupational hazard',
      text: 'The most common failure is losing the plot: investigation drifts into curiosity, curiosity into obsession. Keep a written objective taped to the work, and stop when it is answered.',
    },
    {
      type: 'h',
      text: 'Who you are changes what is allowed',
    },
    {
      type: 'p',
      text: 'The same technique can be routine for one investigator and a crime for another. Your lawful basis — not the method — is what defines the boundary. Know which box you are in before you start.',
    },
    {
      type: 'facts',
      items: [
        {
          label: 'Journalist',
          value:
            'Wider latitude for public-interest collection, but still bound by data protection, anti-stalking law, and platform terms.',
        },
        {
          label: 'Private investigator / due diligence',
          value:
            'Often licensed and regulated; scope is defined by a contract and frequently by statute. Staying inside the signed scope is part of the job.',
        },
        {
          label: 'Corporate / in-house',
          value:
            'Handles employee and customer data under a clear lawful basis (often legitimate interest) and internal retention rules.',
        },
        {
          label: 'Curious individual',
          value:
            'No special basis. Public information about yourself is fine; sustained monitoring of another person is where stalking and harassment law bites.',
        },
      ],
    },
    {
      type: 'example',
      title: 'The line you should not cross',
      scenario:
        'While profiling a target you discover an exposed admin panel for a service they use. It loads without a login prompt.',
      method:
        'The temptation is to look. But authentication-free access to a system you are not entitled to use is unauthorised access in most jurisdictions, regardless of how you found it.',
      result:
        "You do not touch it. You note the URL, the time, and a screenshot of the public-facing notice, and — if appropriate — you report the exposure through the vendor's security contact or a coordinated-disclosure channel.",
    },
    {
      type: 'checklist',
      title: 'Pre-flight legal & ethical check',
      items: [
        'I can name the lawful basis for handling this personal data.',
        'My collection is proportionate to the question — no more than needed.',
        'I am not touching anything behind authentication I am not entitled to use.',
        'I am not acting on leaked or breached data.',
        'My monitoring of any individual is not sustained, unwanted, or harassing.',
        "I know my jurisdiction, and the target's, and where they differ.",
        'I have a retention and deletion plan for what I collect.',
      ],
    },
    {
      type: 'tools',
      title: 'Legal-aware sources & privacy',
      items: [
        {
          label: 'VPN & Privacy tools',
          href: '/tools?category=vpn-privacy',
          note: 'Harden collection without relying on unlawful access.',
        },
        {
          label: 'Learning resources',
          href: '/tools?category=learning-resources',
          note: 'Curated write-ups on the law and ethics of open-source work.',
        },
      ],
    },
  ],
};
