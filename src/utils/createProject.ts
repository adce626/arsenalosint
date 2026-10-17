export const PROJECT_SCHEMA_VERSION = 1;

export interface ProjectTarget {
  name: string;
  notes: string;
}

export interface MapDisplay {
  showPinConnections: boolean;
  pinConnectionColor: string;
}

/** A dated entry on the investigation timeline (an observation, sighting, or fact). */
export interface ProjectEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  source?: string;
  confidence?: string;
  pinId?: string | null;
  identifierIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** One piece of evidence attached to a hypothesis. */
export interface HypothesisEvidence {
  id: string;
  text: string;
  direction: 'supports' | 'refutes';
  strength?: 'strong' | 'moderate' | 'weak';
  identifierId?: string | null;
  source?: string;
  reliability?: string;
  credibility?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** A competing explanation, with supporting/refuting evidence. */
export interface Hypothesis {
  id: string;
  title: string;
  description?: string;
  evidence: HypothesisEvidence[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OsintProject {
  schemaVersion: number;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  target: ProjectTarget;
  identifiers: unknown[];
  connections: unknown[];
  locations: unknown[];
  pinLinks: unknown[];
  events: ProjectEvent[];
  hypotheses: Hypothesis[];
  mapDisplay: MapDisplay;
}

export interface CreateProjectInput {
  name: string;
  targetName?: string;
  notes?: string;
}

export function createProject({
  name,
  targetName = '',
  notes = '',
}: CreateProjectInput): OsintProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled Project',
    createdAt: now,
    updatedAt: now,
    target: {
      name: targetName.trim(),
      notes: notes.trim(),
    },
    identifiers: [],
    connections: [],
    locations: [],
    pinLinks: [],
    events: [],
    hypotheses: [],
    mapDisplay: {
      showPinConnections: false,
      pinConnectionColor: '#ef4444',
    },
  };
}
