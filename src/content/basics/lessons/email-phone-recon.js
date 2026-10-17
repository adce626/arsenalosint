export default {
  id: 'email-phone-recon',
  title: 'Email & Phone Recon',
  summary:
    'What an email address or phone number can reveal — and where the hard privacy walls are.',
  level: 'advanced',
  minutes: 13,
  tags: ['techniques', 'email', 'phone'],
  blocks: [
    {
      type: 'p',
      text: 'An email or phone number is a pivot point: it can link accounts, hint at an employer, or confirm a real name. But most platforms now deliberately leak very little, so treat every result as a weak signal.',
    },
    {
      type: 'h',
      text: 'Email addresses',
    },
    {
      type: 'list',
      items: [
        'Breach-corpus checkers (Have I Been Pwned and similar) tell you which breaches an address appears in — never the passwords themselves.',
        'Gravatar and account-recovery flows can confirm whether an address is registered on a service.',
        'The domain reveals employer, school, or host (Gmail, ProtonMail, a custom domain).',
        'Verification should rely on the account, not the address: an address alone proves little.',
      ],
    },
    {
      type: 'h',
      text: 'Phone numbers',
    },
    {
      type: 'list',
      items: [
        'Carrier and line type are usually derivable from the number itself (prefix, country code).',
        'Messaging apps (WhatsApp, Signal, Telegram) can reveal a profile name and avatar when the number is registered — but doing so can notify the user depending on their settings.',
        'Reverse-lookup services are hit-and-miss and often resell stale data; corroborate before trusting.',
      ],
    },
    {
      type: 'callout',
      tone: 'legal',
      title: 'Consent & data protection',
      text: 'A phone number is personal data under GDPR-style regimes. Collecting and storing it requires a lawful basis; storing it in a case file you share can create real liability.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Attribute carefully',
      text: 'The classic mistake is over-attributing: "the number is on a business listing, therefore the target owns the business." Listings go stale and numbers get recycled. State the link and its confidence, not the conclusion.',
    },
    {
      type: 'h',
      text: 'Headers tell the truth',
    },
    {
      type: 'p',
      text: 'If you have an actual email (not just the address), the message headers are a richer source than the address. They carry the sending infrastructure, the route between servers, and often the client that composed it — none of which the sender can easily edit without breaking delivery.',
    },
    {
      type: 'code',
      text: '# Pull the routing and auth fields from a saved .eml\n# (from the raw message source in your mail client)\ngrep -Ei "^(Received|Return-Path|Message-ID|Authentication-Results|X-Mailer|From|Reply-To):" message.eml\n\n# Then resolve the origin infrastructure\ndig +short origin-ip.example.net\ndig +short -x 203.0.113.10',
    },
    {
      type: 'example',
      title: 'From a phone number to a real name',
      scenario:
        'Your only lead is a mobile number appearing on a marketplace profile.',
      method:
        "Determine country and carrier from the prefix and look up the number's portability and line type. Check whether it is registered on any messaging app — from a sock puppet, and only where the app will not notify the user. Cross-reference the number against public business listings and the handle used on the marketplace account.",
      result:
        'The number resolves to a registered messaging profile whose avatar matches the marketplace seller, and an old business listing pairs the number with a first name — reported as a probable link at medium confidence, with the caveat that numbers get recycled.',
    },
    {
      type: 'checklist',
      title: 'Email & phone collection rules',
      items: [
        'Confirmed the lawful basis before looking up personal contact data.',
        'Used official APIs or documented lookups — not scrape-and-pray.',
        'Treated every result as a weak signal until independently corroborated.',
        'Checked that a lookup would not notify the target (profile-view settings).',
        'Recorded each pivot and its timestamp in the case graph.',
      ],
    },
    {
      type: 'tools',
      title: 'Email & phone toolkit',
      items: [
        {
          label: 'Email & Phone tools',
          href: '/tools?category=email-phone',
          note: 'Address and number lookups, header parsers, and validators.',
        },
        {
          label: 'Data Breach tools',
          href: '/tools?category=data-breach',
          note: 'Breach-exposure checks — see which breaches an address appears in, never the passwords.',
        },
        {
          label: 'Domain, IP & Network tools',
          href: '/tools?category=domain-ip-network',
          note: 'Resolve the infrastructure behind a sending domain.',
        },
      ],
    },
  ],
};
