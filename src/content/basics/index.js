/**
 * Field guides (OSINT basics) content registry.
 *
 * Each lesson lives in its own module under ./lessons and exports a plain
 * object: { id, title, summary, level, minutes, tags, blocks[] }. The
 * `blocks` array is rendered by the Basics page — see the block types in
 * the BasicLesson component.
 */
import whatIsOsint from './lessons/what-is-osint.js';
import intelligenceCycle from './lessons/intelligence-cycle.js';
import ethicsAndLaw from './lessons/ethics-and-law.js';
import socmint from './lessons/socmint.js';
import geoint from './lessons/geoint.js';
import googleDorking from './lessons/google-dorking.js';
import reverseImageSearch from './lessons/reverse-image-search.js';
import metadata from './lessons/metadata.js';
import emailPhoneRecon from './lessons/email-phone-recon.js';
import opsec from './lessons/opsec.js';
import mappingYourCase from './lessons/mapping-your-case.js';

export const LESSONS = [
  whatIsOsint,
  intelligenceCycle,
  ethicsAndLaw,
  socmint,
  geoint,
  googleDorking,
  reverseImageSearch,
  metadata,
  emailPhoneRecon,
  opsec,
  mappingYourCase,
];

export const TUTORIAL_CATEGORIES = [
  {
    id: 'fundamentals',
    label: 'Fundamentals',
    icon: 'Compass',
    description:
      'What OSINT is, how an investigation is structured, and where the line is drawn.',
    lessonIds: [
      'what-is-osint',
      'intelligence-cycle',
      'ethics-and-law',
      'mapping-your-case',
    ],
  },
  {
    id: 'disciplines',
    label: 'Disciplines',
    icon: 'Layers',
    description: 'The specialized branches of open-source intelligence.',
    lessonIds: ['socmint', 'geoint'],
  },
  {
    id: 'techniques',
    label: 'Techniques',
    icon: 'Wrench',
    description: 'Concrete, repeatable methods you can run against a target.',
    lessonIds: [
      'google-dorking',
      'reverse-image-search',
      'metadata',
      'email-phone-recon',
    ],
  },
  {
    id: 'tradecraft',
    label: 'Tradecraft',
    icon: 'ShieldCheck',
    description: 'Staying safe, unattributable, and legal while you work.',
    lessonIds: ['opsec'],
  },
];

/**
 * Recommended investigation tracks — ordered paths through the guides for a
 * common task. Each is a subset of LESSONS in the order a working analyst would
 * actually use them.
 */
export const TRACKS = [
  {
    id: 'safe-start',
    label: 'Stand up a case safely',
    description:
      'Set the objective, learn the legal line, and lock your operational security before you collect anything.',
    icon: 'ShieldCheck',
    lessonIds: [
      'what-is-osint',
      'intelligence-cycle',
      'ethics-and-law',
      'opsec',
    ],
  },
  {
    id: 'profile-person',
    label: 'Profile a person',
    description:
      'Pivot from one handle, address, or number to a corroborated identity and a map of their network.',
    icon: 'UserSearch',
    lessonIds: [
      'socmint',
      'google-dorking',
      'email-phone-recon',
      'mapping-your-case',
    ],
  },
  {
    id: 'verify-media',
    label: 'Verify an image or video',
    description:
      'Prove where and when a photo or clip was taken, and whether the original hides anything else.',
    icon: 'ScanFace',
    lessonIds: ['reverse-image-search', 'metadata', 'geoint'],
  },
];

export function getLesson(id) {
  return LESSONS.find((l) => l.id === id) ?? null;
}

/** Previous/next lesson in curriculum order, for reader footer navigation. */
export function getLessonNeighbors(id) {
  const i = LESSONS.findIndex((l) => l.id === id);
  return {
    prev: i > 0 ? LESSONS[i - 1] : null,
    next: i >= 0 && i < LESSONS.length - 1 ? LESSONS[i + 1] : null,
  };
}

export const TOTAL_MINUTES = LESSONS.reduce(
  (sum, lesson) => sum + (lesson.minutes ?? 0),
  0,
);

export const LEVELS = {
  beginner: { label: 'Beginner' },
  intermediate: { label: 'Intermediate' },
  advanced: { label: 'Advanced' },
};
