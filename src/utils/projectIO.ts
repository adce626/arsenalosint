import { z } from 'zod';
import { PROJECT_SCHEMA_VERSION, type OsintProject } from './createProject';

const targetSchema = z
  .object({
    name: z.string().default(''),
    notes: z.string().default(''),
  })
  .default({ name: '', notes: '' });

const mapDisplaySchema = z
  .object({
    showPinConnections: z.boolean().default(false),
    pinConnectionColor: z.string().default('#ef4444'),
  })
  .default({ showPinConnections: false, pinConnectionColor: '#ef4444' });

/**
 * Schema for a `.osint.json` project file. Unknown keys are stripped, missing
 * optional sections get safe defaults, and the shape is validated before it
 * ever reaches the app state.
 */
export const projectSchema = z.object({
  schemaVersion: z.number().default(PROJECT_SCHEMA_VERSION),
  id: z.string().optional(),
  name: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  target: targetSchema,
  identifiers: z.array(z.unknown()).default([]),
  connections: z.array(z.unknown()).default([]),
  locations: z.array(z.unknown()).default([]),
  pinLinks: z.array(z.unknown()).default([]),
  events: z.array(z.unknown()).default([]),
  hypotheses: z.array(z.unknown()).default([]),
  mapDisplay: mapDisplaySchema,
});

export function parseProject(raw: unknown): OsintProject {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Project file is not a valid JSON object.');
  }

  const result = projectSchema.safeParse(raw);
  if (!result.success) {
    const nameIssue = result.error.issues.find((i) => i.path[0] === 'name');
    if (nameIssue) throw new Error('Project file is missing a "name".');
    const first = result.error.issues[0];
    throw new Error(
      `Invalid project file: ${first?.message ?? 'unknown error'}`,
    );
  }

  const parsed = result.data;
  if (parsed.schemaVersion !== PROJECT_SCHEMA_VERSION) {
    // Soft accept for now; future migrations can branch here.
    console.warn(
      `Project schemaVersion ${parsed.schemaVersion} differs from current ${PROJECT_SCHEMA_VERSION}.`,
    );
  }

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: parsed.id || crypto.randomUUID(),
    name: parsed.name,
    createdAt: parsed.createdAt || new Date().toISOString(),
    updatedAt: parsed.updatedAt || new Date().toISOString(),
    target: parsed.target,
    identifiers: parsed.identifiers,
    connections: parsed.connections,
    locations: parsed.locations,
    pinLinks: parsed.pinLinks,
    events: parsed.events as OsintProject['events'],
    hypotheses: parsed.hypotheses as OsintProject['hypotheses'],
    mapDisplay: parsed.mapDisplay,
  };
}

export function downloadProject(project: OsintProject): OsintProject {
  const stamped: OsintProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(stamped, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (stamped.name || 'project')
    .replace(/[^a-z0-9-_]+/gi, '_')
    .toLowerCase();
  a.href = url;
  a.download = `${safeName}.osint.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return stamped;
}

export function readProjectFromFile(file: File): Promise<OsintProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        resolve(parseProject(parsed));
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
