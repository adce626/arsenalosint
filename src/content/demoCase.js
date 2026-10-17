/**
 * A self-contained, fictional sample investigation used by the "Load demo
 * case" action on the landing screen.
 *
 * It is deliberately small but exercises every part of the workspace:
 * identifiers of several types, labelled connections (including a loop, so
 * Network analysis has something to report), mapped locations with visit
 * dates, timeline events, and competing hypotheses with weighted evidence.
 *
 * All names, domains, addresses and phone numbers are invented and use
 * reserved/example values.
 */

import { PROJECT_SCHEMA_VERSION } from '../utils/createProject';

const NOW = '2026-02-15T09:00:00.000Z';

function identifier(id, type, fields, extras = {}) {
  return {
    id,
    type,
    fields,
    notes: extras.notes ?? '',
    position: extras.position ?? { x: 0, y: 0 },
    customIconId: null,
    confidence: extras.confidence ?? '',
    source: extras.source ?? '',
    accessedAt: extras.accessedAt ?? '',
    archivedUrl: extras.archivedUrl ?? '',
    reliability: extras.reliability ?? '',
    credibility: extras.credibility ?? '',
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function location(id, label, lat, lng, extras = {}) {
  return {
    id,
    label,
    address: extras.address ?? '',
    lat,
    lng,
    placeId: null,
    visitedAt: extras.visitedAt ?? '',
    withWho: extras.withWho ?? '',
    notes: extras.notes ?? '',
    color: extras.color ?? '#c9a56b',
    iconId: null,
    confidence: extras.confidence ?? '',
    source: extras.source ?? '',
    archivedUrl: '',
    reliability: extras.reliability ?? '',
    credibility: extras.credibility ?? '',
    createdAt: NOW,
    updatedAt: NOW,
  };
}

const IDENTIFIERS = [
  identifier(
    'demo-n1',
    'name',
    { fullName: 'Marcus Vale', aliases: 'M. Vale, “Marc”', gender: 'Male' },
    {
      position: { x: 400, y: 260 },
      notes:
        'Name used across company filings and social profiles. No civil records found — see hypothesis 2.',
      confidence: 'low',
      reliability: 'C',
      credibility: '3',
      source: 'https://find-and-update.company-information.service.gov.uk/',
    },
  ),
  identifier(
    'demo-e1',
    'email',
    {
      address: 'm.vale@northwind-capital.co',
      provider: 'Self-hosted',
      context: 'Work',
    },
    {
      position: { x: 660, y: 140 },
      confidence: 'high',
      reliability: 'B',
      credibility: '2',
      source: 'https://northwind-capital.co/contact',
    },
  ),
  identifier(
    'demo-e2',
    'email',
    {
      address: 'marcusvale88@example-mail.com',
      provider: 'Privacy mail',
      context: 'Throwaway',
    },
    {
      position: { x: 660, y: 300 },
      confidence: 'medium',
      reliability: 'D',
      credibility: '3',
      source: 'https://haveibeenpwned.com/',
    },
  ),
  identifier(
    'demo-p1',
    'phone',
    {
      number: '+44 7700 900412',
      lineType: 'Mobile',
      country: 'United Kingdom',
    },
    {
      position: { x: 660, y: 460 },
      confidence: 'medium',
      reliability: 'C',
      credibility: '3',
    },
  ),
  identifier(
    'demo-t1',
    'twitter',
    { username: '@marcusvale', displayName: 'Marcus Vale', followers: '212' },
    {
      position: { x: 400, y: 90 },
      notes: 'Account created 2024; no profile photo; three promotional posts.',
      confidence: 'medium',
      reliability: 'C',
      credibility: '3',
      source: 'https://x.com/marcusvale',
    },
  ),
  identifier(
    'demo-l1',
    'linkedin',
    {
      fullName: 'Marcus Vale',
      headline: 'Managing Director at Northwind Capital',
      company: 'Northwind Capital Ltd',
      role: 'Managing Director',
      location: 'London, United Kingdom',
    },
    {
      position: { x: 400, y: 430 },
      confidence: 'medium',
      reliability: 'C',
      credibility: '3',
      source: 'https://www.linkedin.com/in/marcusvale',
    },
  ),
  identifier(
    'demo-tg1',
    'telegram',
    { username: '@northwind_support', displayName: 'Northwind Support' },
    {
      position: { x: 890, y: 460 },
      confidence: 'medium',
      reliability: 'C',
      credibility: '4',
    },
  ),
  identifier(
    'demo-domain',
    'custom',
    {
      title: 'Domain · northwind-capital.co',
      value:
        'Registered 2024-03-11 · WHOIS privacy proxy · TLS issued 2024-03-12',
      url: 'https://northwind-capital.co',
    },
    {
      position: { x: 890, y: 140 },
      confidence: 'high',
      reliability: 'B',
      credibility: '2',
      source: 'https://www.whois.com/',
    },
  ),
  identifier(
    'demo-company',
    'custom',
    {
      title: 'Company · Northwind Capital Ltd',
      value: 'Companies House #14882291 · incorporated 2024-04-02',
      url: 'https://find-and-update.company-information.service.gov.uk/',
    },
    {
      position: { x: 1120, y: 260 },
      confidence: 'high',
      reliability: 'A',
      credibility: '2',
      source: 'https://find-and-update.company-information.service.gov.uk/',
    },
  ),
  identifier(
    'demo-a1',
    'address',
    {
      line1: '18 Finsbury Circus',
      city: 'London',
      postal: 'EC2M 7EB',
      country: 'United Kingdom',
      context: 'Registered office',
    },
    {
      position: { x: 400, y: 600 },
      notes:
        'Serviced-office address shared by dozens of companies — low evidential value.',
      confidence: 'high',
      reliability: 'B',
      credibility: '1',
    },
  ),
  identifier(
    'demo-v1',
    'vehicle',
    {
      description: '2019 Range Rover Sport, black',
      make: 'Land Rover',
      model: 'Range Rover Sport',
      year: '2019',
      color: 'Black',
      owner: 'Northwind Capital Ltd',
    },
    {
      position: { x: 150, y: 460 },
      confidence: 'medium',
      reliability: 'C',
      credibility: '3',
    },
  ),
  identifier(
    'demo-lp1',
    'licensePlate',
    { plate: 'LX19 VLE', region: 'Greater London', country: 'United Kingdom' },
    {
      position: { x: 150, y: 600 },
      confidence: 'medium',
      reliability: 'C',
      credibility: '3',
    },
  ),
];

const CONNECTIONS = [
  ['demo-n1', 'demo-e1', 'uses'],
  ['demo-n1', 'demo-e2', 'owns'],
  ['demo-n1', 'demo-p1', 'uses'],
  ['demo-n1', 'demo-t1', 'operates'],
  ['demo-n1', 'demo-l1', 'profile'],
  ['demo-l1', 'demo-a1', 'registered at'],
  ['demo-l1', 'demo-domain', 'lists'],
  ['demo-domain', 'demo-a1', 'same address'],
  ['demo-domain', 'demo-company', 'promotes'],
  ['demo-p1', 'demo-tg1', 'quoted on'],
  ['demo-n1', 'demo-v1', 'drives'],
  ['demo-v1', 'demo-lp1', 'plate'],
];

const LOCATIONS = [
  location(
    'demo-pin1',
    'Registered office — 18 Finsbury Circus',
    51.5183,
    -0.0863,
    {
      address: '18 Finsbury Circus, London EC2M 7EB',
      visitedAt: '2026-01-12',
      confidence: 'high',
      reliability: 'A',
      credibility: '1',
      notes: 'Reception confirmed the company name but no staff on site.',
      source: 'Physical observation',
    },
  ),
  location('demo-pin2', 'Northwind Capital — serviced desk', 51.5074, -0.1278, {
    address: '1 Poultry, London EC2R 8EJ',
    visitedAt: '2026-01-12',
    confidence: 'medium',
    reliability: 'B',
    credibility: '2',
    withWho: 'M. Vale (claimed)',
  }),
  location(
    'demo-pin3',
    'Drop-off — Liverpool Street Station',
    51.5178,
    -0.0823,
    {
      visitedAt: '2026-01-20',
      confidence: 'low',
      reliability: 'D',
      credibility: '4',
      notes: 'Unverified eyewitness account of a document handover.',
    },
  ),
  location('demo-pin4', 'Vehicle sighting — Canary Wharf', 51.5054, -0.0235, {
    visitedAt: '2026-01-20',
    confidence: 'medium',
    reliability: 'C',
    credibility: '3',
    notes: 'Dashcam still shows plate LX19 VLE.',
  }),
  location('demo-pin5', 'Cash pickup — Dubai Marina', 25.0805, 55.1403, {
    visitedAt: '2026-02-14',
    confidence: 'low',
    reliability: 'E',
    credibility: '3',
    notes: 'Reported by a victim; no independent corroboration.',
  }),
  location('demo-pin6', 'Residential address (subject)', 51.47, -0.1, {
    visitedAt: '2026-02-01',
    confidence: 'low',
    reliability: 'D',
    credibility: '4',
    notes: 'Matches a historic electoral roll entry only.',
  }),
];

const PIN_LINKS = [
  ['demo-pin1', 'demo-n1', 'named on the mailbox'],
  ['demo-pin1', 'demo-l1', 'listed as registered office'],
  ['demo-pin2', 'demo-l1', 'claimed office'],
  ['demo-pin4', 'demo-v1', 'vehicle seen'],
  ['demo-pin4', 'demo-lp1', 'plate captured'],
  ['demo-pin5', 'demo-p1', 'call arranged from this number'],
  ['demo-pin6', 'demo-n1', 'possible home'],
];

export const DEMO_CASE = {
  schemaVersion: PROJECT_SCHEMA_VERSION,
  id: 'demo-case-lighthouse',
  name: 'Demo · Operation Lighthouse',
  createdAt: NOW,
  updatedAt: NOW,
  target: {
    name: 'Marcus Vale / Northwind Capital',
    notes:
      'Fictional sample case. Suspected investment-fraud operation using a company, a domain, and several identities. Use it to explore every tab, then start your own project.',
  },
  identifiers: IDENTIFIERS,
  connections: CONNECTIONS.map(([source, target, label], index) => ({
    id: `demo-edge-${index + 1}`,
    source,
    target,
    sourceHandle: null,
    targetHandle: null,
    label,
    confidence: 'medium',
  })),
  locations: LOCATIONS,
  pinLinks: PIN_LINKS.map(([pinId, identifierId, context], index) => ({
    id: `demo-link-${index + 1}`,
    pinId,
    identifierId,
    context,
    createdAt: NOW,
  })),
  events: [
    {
      id: 'demo-ev1',
      date: '2024-03-11',
      title: 'Domain northwind-capital.co registered',
      description:
        'Registered through a privacy proxy; no registrant data disclosed.',
      source: 'https://www.whois.com/',
      confidence: 'high',
      reliability: 'B',
      credibility: '2',
      pinId: null,
      identifierIds: ['demo-domain'],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'demo-ev2',
      date: '2024-04-02',
      title: 'Northwind Capital Ltd incorporated',
      description:
        'Incorporated at Companies House with a serviced-office address.',
      source: 'https://find-and-update.company-information.service.gov.uk/',
      confidence: 'high',
      reliability: 'A',
      credibility: '2',
      pinId: null,
      identifierIds: ['demo-company', 'demo-l1'],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'demo-ev3',
      date: '2025-11-18',
      title: 'First victim report filed',
      description:
        'Complainant describes a fake trading dashboard and crypto deposits.',
      source: 'Victim statement',
      confidence: 'medium',
      reliability: 'C',
      credibility: '3',
      pinId: null,
      identifierIds: ['demo-domain'],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'demo-ev4',
      date: '2026-01-12',
      title: 'Registered office visited',
      description: 'Reception confirmed the name; no staff or signage present.',
      source: 'Physical observation',
      confidence: 'high',
      reliability: 'A',
      credibility: '1',
      pinId: 'demo-pin1',
      identifierIds: ['demo-n1', 'demo-l1'],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'demo-ev5',
      date: '2026-01-20',
      title: 'Vehicle photographed at Canary Wharf',
      description: 'Dashcam still resolves the plate to the company vehicle.',
      source: 'Dashcam still',
      confidence: 'medium',
      reliability: 'C',
      credibility: '3',
      pinId: 'demo-pin4',
      identifierIds: ['demo-v1', 'demo-lp1'],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'demo-ev6',
      date: '2026-02-03',
      title: 'Support number active on Telegram',
      description:
        'The mobile number is advertised inside the Telegram support channel.',
      source: 'https://t.me/northwind_support',
      confidence: 'medium',
      reliability: 'C',
      credibility: '4',
      pinId: null,
      identifierIds: ['demo-p1', 'demo-tg1'],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'demo-ev7',
      date: '2026-02-14',
      title: 'Reported cash pickup in Dubai',
      description: 'Single victim report of a cash handover at Dubai Marina.',
      source: 'Victim statement',
      confidence: 'low',
      reliability: 'E',
      credibility: '3',
      pinId: 'demo-pin5',
      identifierIds: ['demo-p1'],
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
  hypotheses: [
    {
      id: 'demo-h1',
      title: 'Marcus Vale controls Northwind Capital',
      description:
        'The names, mailbox, and company role all point at one operator.',
      evidence: [
        {
          id: 'demo-h1-e1',
          text: 'Work mailbox on the company domain matches the LinkedIn role',
          direction: 'supports',
          strength: 'strong',
          identifierId: 'demo-e1',
          source: 'https://northwind-capital.co/contact',
          reliability: 'B',
          credibility: '2',
          createdAt: NOW,
          updatedAt: NOW,
        },
        {
          id: 'demo-h1-e2',
          text: 'Listed as Managing Director in filings and on LinkedIn',
          direction: 'supports',
          strength: 'moderate',
          identifierId: 'demo-l1',
          reliability: 'C',
          credibility: '2',
          createdAt: NOW,
          updatedAt: NOW,
        },
        {
          id: 'demo-h1-e3',
          text: 'Registered office is a mail-forwarding address used by many firms',
          direction: 'refutes',
          strength: 'weak',
          identifierId: 'demo-a1',
          reliability: 'B',
          credibility: '1',
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'demo-h2',
      title: 'The identity is a sock puppet, not a real person',
      description:
        'Everything attributed to “Marcus Vale” traces back to the scheme itself.',
      evidence: [
        {
          id: 'demo-h2-e1',
          text: 'No civil, electoral, or press record of the name before 2024',
          direction: 'supports',
          strength: 'strong',
          identifierId: 'demo-n1',
          reliability: 'B',
          credibility: '3',
          createdAt: NOW,
          updatedAt: NOW,
        },
        {
          id: 'demo-h2-e2',
          text: 'Social account created 2024 with no photo or personal posts',
          direction: 'supports',
          strength: 'moderate',
          identifierId: 'demo-t1',
          reliability: 'C',
          credibility: '3',
          createdAt: NOW,
          updatedAt: NOW,
        },
        {
          id: 'demo-h2-e3',
          text: 'A vehicle and plate are registered to the company in that name',
          direction: 'refutes',
          strength: 'moderate',
          identifierId: 'demo-v1',
          reliability: 'C',
          credibility: '3',
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'demo-h3',
      title: 'Northwind is a legitimate asset manager',
      description:
        'A registered company with a real address could simply be real.',
      evidence: [
        {
          id: 'demo-h3-e1',
          text: 'Company is a genuine, active Companies House registration',
          direction: 'supports',
          strength: 'weak',
          identifierId: 'demo-company',
          reliability: 'A',
          credibility: '2',
          createdAt: NOW,
          updatedAt: NOW,
        },
        {
          id: 'demo-h3-e2',
          text: 'Domain is privacy-proxied and the site mirrors a known scam template',
          direction: 'refutes',
          strength: 'strong',
          identifierId: 'demo-domain',
          reliability: 'B',
          credibility: '2',
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
  mapDisplay: {
    showPinConnections: true,
    pinConnectionColor: '#5bb8a6',
  },
};
