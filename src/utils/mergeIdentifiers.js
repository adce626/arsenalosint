/**
 * Entity merge + duplicate detection for identifier nodes.
 *
 * `mergeIdentifiersInto(project, keepId, removeIds)` is a pure function that
 * folds one or more identifiers into a keeper: it backfills missing fields,
 * concatenates notes, backfills provenance, remaps every connection / pin link
 * / timeline-event reference, drops collapsed self-loops, and de-duplicates the
 * resulting edges and links. It is deterministic so the undo layer can store a
 * before/after slice and replay it safely.
 *
 * `findDuplicateGroups(identifiers)` is a heuristic detector: it groups nodes
 * that share a strong identifying value (email, phone, username, handle, VIN,
 * or plate). Usernames/handles are only compared within the same platform;
 * emails, phones, VINs, and plates are compared globally.
 */

const IDENTITY_FIELDS = {
  email: 'email',
  address: 'email', // email-type primary field
  phone: 'phone',
  number: 'phone', // phone-type primary field
  username: 'username',
  handle: 'handle',
  vin: 'vin',
  plate: 'plate',
};

export const DUPLICATE_KIND_LABELS = {
  email: 'Email',
  phone: 'Phone',
  username: 'Username',
  handle: 'Handle',
  vin: 'VIN',
  plate: 'Plate',
};

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function nonEmpty(value) {
  return isBlank(value) ? '' : String(value).trim();
}

/** Fold `remove` into `keep`, keeping `keep`'s values where both are set. */
function mergeRecord(keep, remove) {
  const fields = { ...(keep.fields ?? {}) };
  for (const [key, value] of Object.entries(remove.fields ?? {})) {
    if (isBlank(fields[key]) && !isBlank(value)) fields[key] = value;
  }

  const notes = [keep.notes, remove.notes]
    .map((n) => (n ?? '').trim())
    .filter(Boolean)
    .join('\n\n');

  return {
    ...keep,
    fields,
    notes,
    customIconId: keep.customIconId ?? remove.customIconId ?? null,
    confidence: nonEmpty(keep.confidence) || nonEmpty(remove.confidence),
    source: nonEmpty(keep.source) || nonEmpty(remove.source),
    accessedAt: nonEmpty(keep.accessedAt) || nonEmpty(remove.accessedAt),
    archivedUrl: nonEmpty(keep.archivedUrl) || nonEmpty(remove.archivedUrl),
    reliability: nonEmpty(keep.reliability) || nonEmpty(remove.reliability),
    credibility: nonEmpty(keep.credibility) || nonEmpty(remove.credibility),
    updatedAt: new Date().toISOString(),
  };
}

function undirectedKey(a, b) {
  return [a, b].sort().join('|');
}

function remapConnections(connections, keepId, removeIds) {
  const idMap = new Map(removeIds.map((id) => [id, keepId]));
  const seen = new Set();
  const out = [];
  for (const c of connections ?? []) {
    const source = idMap.get(c.source) ?? c.source;
    const target = idMap.get(c.target) ?? c.target;
    if (source === target) continue; // collapsed self-loop
    const key = undirectedKey(source, target);
    if (seen.has(key)) {
      // Fold label/confidence into the surviving edge.
      const existing = out.find(
        (e) => undirectedKey(e.source, e.target) === key,
      );
      if (existing) {
        if (!nonEmpty(existing.label) && nonEmpty(c.label))
          existing.label = c.label;
        if (!nonEmpty(existing.confidence) && nonEmpty(c.confidence))
          existing.confidence = c.confidence;
      }
      continue;
    }
    seen.add(key);
    out.push({ ...c, source, target });
  }
  return out;
}

function remapPinLinks(pinLinks, keepId, removeIds) {
  const idMap = new Map(removeIds.map((id) => [id, keepId]));
  const seen = new Set();
  const out = [];
  for (const link of pinLinks ?? []) {
    const identifierId = idMap.get(link.identifierId) ?? link.identifierId;
    const key = `${link.pinId}|${identifierId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...link, identifierId });
  }
  return out;
}

function remapEvents(events, keepId, removeIds) {
  const idMap = new Map(removeIds.map((id) => [id, keepId]));
  return (events ?? []).map((event) => {
    const ids = event.identifierIds ?? [];
    if (ids.length === 0) return event;
    const seen = new Set();
    const next = [];
    for (const id of ids) {
      const mapped = idMap.get(id) ?? id;
      if (seen.has(mapped)) continue;
      seen.add(mapped);
      next.push(mapped);
    }
    const unchanged =
      next.length === ids.length && next.every((v, i) => v === ids[i]);
    return unchanged ? event : { ...event, identifierIds: next };
  });
}

/**
 * Return a new project with `removeIds` folded into `keepId`. Returns the input
 * unchanged when the merge is a no-op (missing keeper, or every id === keepId).
 */
export function mergeIdentifiersInto(project, keepId, removeIds) {
  const ids = (removeIds ?? []).filter((id) => id && id !== keepId);
  if (!project || !keepId || ids.length === 0) return project;

  const idSet = new Set(ids);
  const keep = project.identifiers.find((i) => i.id === keepId);
  if (!keep) return project;

  let merged = keep;
  for (const id of ids) {
    const remove = project.identifiers.find((i) => i.id === id);
    if (remove) merged = mergeRecord(merged, remove);
  }

  return {
    ...project,
    identifiers: project.identifiers
      .filter((i) => !idSet.has(i.id))
      .map((i) => (i.id === keepId ? merged : i)),
    connections: remapConnections(project.connections, keepId, ids),
    pinLinks: remapPinLinks(project.pinLinks, keepId, ids),
    events: remapEvents(project.events, keepId, ids),
  };
}

function normalizeValue(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/\s+/g, '');
}

/**
 * Heuristic duplicate groups. Each group is
 * `{ key, kind, value, items: identifier[] }` with two or more members.
 */
export function findDuplicateGroups(identifiers = []) {
  const groups = new Map();
  for (const identifier of identifiers) {
    const fields = identifier.fields ?? {};
    for (const [fieldKey, kind] of Object.entries(IDENTITY_FIELDS)) {
      const raw = fields[fieldKey];
      if (isBlank(raw)) continue;
      const value = normalizeValue(raw);
      if (!value) continue;
      // Usernames/handles are platform-specific; the rest are global.
      const scope =
        kind === 'username' || kind === 'handle' ? identifier.type : 'global';
      const key = `${scope}|${kind}|${value}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          kind,
          value: String(raw).trim(),
          items: [],
        });
      }
      groups.get(key).items.push(identifier);
    }
  }
  return [...groups.values()].filter((g) => g.items.length > 1);
}
