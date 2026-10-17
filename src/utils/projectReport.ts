import { CATEGORIES, getDisplayLabel, getTypeDef } from '../identifierTypes.js';
import { confidenceLabel } from '../confidence.js';
import { admiraltyLabel } from '../sourceGrading.js';
import { scoreHypothesis, hypothesisVerdict } from '../utils/hypotheses.js';
import { analyzeNetwork } from '../utils/networkAnalysis.js';

export interface ReportProvenance {
  confidence?: string;
  source?: string;
  accessedAt?: string;
  archivedUrl?: string;
  reliability?: string;
  credibility?: string;
}

export interface ReportIdentifier extends ReportProvenance {
  id: string;
  type: string;
  notes?: string;
  fields?: Record<string, unknown>;
}

export interface ReportConnection extends ReportProvenance {
  source: string;
  target: string;
  label?: string;
}

export interface ReportLocation extends ReportProvenance {
  id: string;
  label?: string;
  address?: string;
  lat?: number;
  lng?: number;
  visitedAt?: string;
  withWho?: string;
  notes?: string;
  archivedUrl?: string;
}

export interface ReportPinLink {
  pinId: string;
  identifierId: string;
}

export interface ReportEvent extends ReportProvenance {
  id: string;
  date?: string;
  title?: string;
  description?: string;
  pinId?: string | null;
  identifierIds?: string[];
}

export interface ReportEvidence extends ReportProvenance {
  id: string;
  text?: string;
  direction?: string;
  strength?: string;
  identifierId?: string | null;
}

export interface ReportHypothesis {
  id: string;
  title?: string;
  description?: string;
  evidence?: ReportEvidence[];
}

export interface ReportProject {
  name?: string;
  target?: { name?: string; notes?: string };
  identifiers?: ReportIdentifier[];
  connections?: ReportConnection[];
  locations?: ReportLocation[];
  pinLinks?: ReportPinLink[];
  events?: ReportEvent[];
  hypotheses?: ReportHypothesis[];
}

function safeName(name: string): string {
  const base = (name || 'project').trim().replace(/[^\w.-]+/g, '-');
  return base.replace(/^-+|-+$/g, '') || 'project';
}

function formatCoordinates(lat?: number, lng?: number): string {
  const hasLat = typeof lat === 'number' && Number.isFinite(lat);
  const hasLng = typeof lng === 'number' && Number.isFinite(lng);
  if (!hasLat || !hasLng) return '';
  return `${lat}, ${lng}`;
}

function nonEmpty(value: unknown): string {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

/** Ordered, non-empty field entries for an identifier. */
function identifierFieldEntries(
  identifier: ReportIdentifier,
): Array<[string, string]> {
  const def = getTypeDef(identifier?.type);
  const fields = identifier?.fields ?? {};
  const out: Array<[string, string]> = [];
  for (const field of def.fields) {
    const value = nonEmpty(fields[field.key]);
    if (value) out.push([field.label, value]);
  }
  return out;
}

/** Identifiers grouped by category, preserving CATEGORIES order. */
function groupIdentifiers(identifiers: ReportIdentifier[]) {
  const byCategory = new Map<string, ReportIdentifier[]>();
  for (const identifier of identifiers) {
    const def = getTypeDef(identifier?.type);
    const key: string = def.category ?? 'other';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(identifier);
  }
  return Object.entries(CATEGORIES)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, meta]) => ({
      key,
      label: meta.label,
      items: byCategory.get(key) ?? [],
    }))
    .filter((group) => group.items.length > 0);
}

interface AnalysisEntry {
  title: string;
  description: string;
  verdict: string;
  score: number;
  evidence: Array<{
    sign: string;
    strength: string;
    text: string;
    detail: string;
  }>;
}

/** Ranked hypotheses with their evidence, for the report's analysis section. */
function buildAnalysis(project: ReportProject): AnalysisEntry[] {
  const idLabel = buildIdLabelMap(project?.identifiers ?? []);
  const entries = (project?.hypotheses ?? []).map((h) => {
    const score = scoreHypothesis(h);
    const verdict = hypothesisVerdict(h);
    const evidence = (h.evidence ?? []).map((e) => {
      const refute = e.direction === 'refutes';
      const grade = admiraltyLabel(e.reliability, e.credibility);
      const detail = [
        e.identifierId ? idLabel.get(e.identifierId) : '',
        e.source ? `source: ${e.source}` : '',
        grade,
      ]
        .filter(Boolean)
        .join(' · ');
      return {
        sign: refute ? '−' : '+',
        strength: e.strength ?? 'moderate',
        text: nonEmpty(e.text) || 'Evidence',
        detail,
      };
    });
    return {
      title: nonEmpty(h.title) || 'Untitled hypothesis',
      description: nonEmpty(h.description),
      verdict: verdict.label,
      score,
      evidence,
    };
  });
  return entries.sort((a, b) => b.score - a.score);
}

function buildIdLabelMap(identifiers: ReportIdentifier[]): Map<string, string> {
  const idLabel = new Map<string, string>();
  for (const identifier of identifiers) {
    idLabel.set(identifier.id, getDisplayLabel(identifier));
  }
  return idLabel;
}

/** Non-empty provenance rows (confidence/source/accessed/archived). */
function provenanceRows(item: ReportProvenance): Array<[string, string]> {
  const rows: Array<[string, string]> = [];
  const conf = confidenceLabel(item?.confidence);
  if (conf) rows.push(['Confidence', conf]);
  const grade = admiraltyLabel(item?.reliability, item?.credibility);
  if (grade) rows.push(['Source grading', grade]);
  const source = nonEmpty(item?.source);
  if (source) rows.push(['Source', source]);
  const accessed = nonEmpty(item?.accessedAt);
  if (accessed) rows.push(['Accessed', accessed]);
  const archived = nonEmpty(item?.archivedUrl);
  if (archived) rows.push(['Archived', archived]);
  return rows;
}

interface TimelineEntry {
  date: string;
  time: number | null;
  kind: 'Event' | 'Visit';
  title: string;
  detail: string;
  source: string;
  confidence: string;
  links: string[];
}

function parseTime(value: string): number | null {
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

/** Chronological events + pin visits, undated entries last. */
function buildTimeline(project: ReportProject): TimelineEntry[] {
  const identifiers = project?.identifiers ?? [];
  const locations = project?.locations ?? [];
  const idLabel = buildIdLabelMap(identifiers);
  const pinLabel = new Map<string, string>();
  for (const loc of locations) {
    pinLabel.set(
      loc.id,
      loc.label?.trim() || loc.address?.trim() || 'Location',
    );
  }

  const out: TimelineEntry[] = [];
  for (const event of project?.events ?? []) {
    const links: string[] = [];
    if (event.pinId && pinLabel.has(event.pinId))
      links.push(pinLabel.get(event.pinId)!);
    for (const id of event.identifierIds ?? []) {
      const label = idLabel.get(id);
      if (label) links.push(label);
    }
    out.push({
      date: nonEmpty(event.date),
      time: parseTime(nonEmpty(event.date)),
      kind: 'Event',
      title: nonEmpty(event.title) || 'Untitled event',
      detail: nonEmpty(event.description),
      source: nonEmpty(event.source),
      confidence: confidenceLabel(event.confidence),
      links,
    });
  }
  for (const loc of locations) {
    const visited = nonEmpty(loc.visitedAt);
    if (!visited) continue;
    out.push({
      date: visited,
      time: parseTime(visited),
      kind: 'Visit',
      title: loc.label?.trim() || loc.address?.trim() || 'Location',
      detail: loc.notes ? nonEmpty(loc.notes) : '',
      source: nonEmpty(loc.source),
      confidence: confidenceLabel(loc.confidence),
      links: [],
    });
  }
  out.sort((a, b) => {
    if (a.time === null && b.time === null) return 0;
    if (a.time === null) return 1;
    if (b.time === null) return -1;
    return a.time - b.time;
  });
  return out;
}

export function buildProjectReportMarkdown(project: ReportProject): string {
  const identifiers = project?.identifiers ?? [];
  const connections = project?.connections ?? [];
  const locations = project?.locations ?? [];
  const pinLinks = project?.pinLinks ?? [];
  const timeline = buildTimeline(project);
  const analysis = buildAnalysis(project);
  const network = analyzeNetwork(
    (project?.identifiers ?? []) as { id: string }[],
    (project?.connections ?? []) as {
      id: string;
      source: string;
      target: string;
    }[],
  );

  const idLabel = buildIdLabelMap(identifiers);

  const lines: string[] = [];
  lines.push(`# ${project?.name || 'Untitled Project'}`);
  lines.push('');
  lines.push(`_Generated ${new Date().toLocaleString()}_`);
  lines.push('');

  const target = project?.target ?? {};
  if (target.name) lines.push(`**Target:** ${target.name}`);
  if (target.notes)
    lines.push(`**Target notes:** ${String(target.notes).replace(/\n/g, ' ')}`);
  if (target.name || target.notes) lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push(`- Identifiers: ${identifiers.length}`);
  lines.push(`- Connections: ${connections.length}`);
  lines.push(`- Locations: ${locations.length}`);
  lines.push(`- Timeline entries: ${timeline.length}`);
  lines.push(`- Hypotheses: ${analysis.length}`);
  lines.push(
    `- Network: ${network.nodeCount} entities · ${network.edgeCount} connections · ${network.componentCount} clusters`,
  );
  lines.push(`- Pin links: ${pinLinks.length}`);
  lines.push('');

  if (identifiers.length > 0) {
    lines.push('## Identifiers');
    lines.push('');
    for (const group of groupIdentifiers(identifiers)) {
      lines.push(`### ${group.label}`);
      lines.push('');
      for (const identifier of group.items) {
        const def = getTypeDef(identifier.type);
        lines.push(`#### ${def.label} — ${getDisplayLabel(identifier)}`);
        lines.push('');
        for (const [label, value] of identifierFieldEntries(identifier)) {
          lines.push(`- ${label}: ${value}`);
        }
        const notes = nonEmpty(identifier.notes);
        if (notes) lines.push(`- Notes: ${notes.replace(/\n/g, ' ')}`);
        for (const [label, value] of provenanceRows(identifier)) {
          lines.push(`- ${label}: ${value}`);
        }
        lines.push('');
      }
    }
  }

  if (connections.length > 0) {
    lines.push('## Connections');
    lines.push('');
    for (const connection of connections) {
      const from = idLabel.get(connection.source) ?? connection.source ?? '?';
      const to = idLabel.get(connection.target) ?? connection.target ?? '?';
      const label = nonEmpty(connection.label);
      const conf = confidenceLabel(connection.confidence);
      const suffix = [label, conf].filter(Boolean).join(' · ');
      lines.push(`- ${from} ↔ ${to}${suffix ? ` _(${suffix})_` : ''}`);
    }
    lines.push('');
  }

  if (locations.length > 0) {
    lines.push('## Locations');
    lines.push('');
    for (const location of locations) {
      lines.push(`### ${location.label || 'Unnamed location'}`);
      lines.push('');
      if (location.address) lines.push(`- Address: ${location.address}`);
      const coords = formatCoordinates(location.lat, location.lng);
      if (coords) lines.push(`- Coordinates: ${coords}`);
      const visitedAt = nonEmpty(location.visitedAt);
      if (visitedAt) lines.push(`- Visited: ${visitedAt}`);
      const withWho = nonEmpty(location.withWho);
      if (withWho) lines.push(`- With: ${withWho}`);
      const notes = nonEmpty(location.notes);
      if (notes) lines.push(`- Notes: ${notes.replace(/\n/g, ' ')}`);
      for (const [label, value] of provenanceRows(location)) {
        lines.push(`- ${label}: ${value}`);
      }
      const linked = pinLinks
        .filter((link) => link.pinId === location.id)
        .map((link) => idLabel.get(link.identifierId) ?? link.identifierId)
        .filter(Boolean);
      if (linked.length > 0) {
        lines.push(`- Linked identifiers: ${linked.join(', ')}`);
      }
      lines.push('');
    }
  }

  if (timeline.length > 0) {
    lines.push('## Timeline');
    lines.push('');
    for (const entry of timeline) {
      const meta = [entry.kind, entry.confidence].filter(Boolean).join(' · ');
      lines.push(`### ${entry.date || 'Undated'} — ${entry.title}`);
      lines.push('');
      lines.push(`_${meta}_`);
      if (entry.detail) lines.push(entry.detail.replace(/\n/g, ' '));
      if (entry.source) lines.push(`Source: ${entry.source}`);
      if (entry.links.length > 0)
        lines.push(`Linked: ${entry.links.join(', ')}`);
      lines.push('');
    }
  }

  if (analysis.length > 0) {
    lines.push('## Analysis of competing hypotheses');
    lines.push('');
    for (const entry of analysis) {
      const scoreText = entry.score > 0 ? `+${entry.score}` : entry.score;
      lines.push(`### ${entry.title} — ${entry.verdict} (score ${scoreText})`);
      lines.push('');
      if (entry.description) lines.push(entry.description);
      if (entry.evidence.length > 0) {
        for (const e of entry.evidence) {
          lines.push(
            `- ${e.sign} [${e.strength}] ${e.text}${e.detail ? ` _(${e.detail})_` : ''}`,
          );
        }
      } else {
        lines.push('- No evidence recorded.');
      }
      lines.push('');
    }
  }

  if (network.nodeCount > 0) {
    lines.push('## Network analysis');
    lines.push('');
    lines.push(
      `- Entities: ${network.nodeCount} · Connections: ${network.edgeCount} · Clusters: ${network.componentCount} · Loops: ${network.independentCycles} · Density: ${(network.density * 100).toFixed(1)}%`,
    );
    lines.push('');
    const connectors = network.ranked.filter((r) => r.degree > 0).slice(0, 5);
    if (connectors.length > 0) {
      lines.push('### Key connectors');
      lines.push('');
      for (const connector of connectors) {
        const label = idLabel.get(connector.id) ?? connector.id;
        lines.push(
          `- ${label} — ${connector.degree} link${connector.degree === 1 ? '' : 's'}, betweenness ${connector.betweenness.toFixed(2)}`,
        );
      }
      lines.push('');
    }
  }

  const evidence = buildEvidenceAppendix(project);
  if (evidence.length > 0) {
    lines.push('## Evidence appendix');
    lines.push('');
    lines.push('| Item | Type | Confidence | Source | Accessed | Archived |');
    lines.push('| ---- | ---- | ---------- | ------ | -------- | -------- |');
    for (const row of evidence) {
      lines.push(
        `| ${row.item} | ${row.type} | ${row.confidence || '—'} | ${
          row.source || '—'
        } | ${row.accessed || '—'} | ${row.archived || '—'} |`,
      );
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}

interface EvidenceRow {
  item: string;
  type: string;
  confidence: string;
  source: string;
  accessed: string;
  archived: string;
}

function buildEvidenceAppendix(project: ReportProject): EvidenceRow[] {
  const rows: EvidenceRow[] = [];
  for (const identifier of project?.identifiers ?? []) {
    rows.push({
      item: getDisplayLabel(identifier),
      type: getTypeDef(identifier.type).label,
      confidence: confidenceLabel(identifier.confidence),
      source: nonEmpty(identifier.source),
      accessed: nonEmpty(identifier.accessedAt),
      archived: nonEmpty(identifier.archivedUrl),
    });
  }
  for (const location of project?.locations ?? []) {
    rows.push({
      item: location.label || location.address || 'Unnamed location',
      type: 'Location',
      confidence: confidenceLabel(location.confidence),
      source: nonEmpty(location.source),
      accessed: nonEmpty(location.accessedAt),
      archived: nonEmpty(location.archivedUrl),
    });
  }
  return rows;
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildProjectReportHtml(project: ReportProject): string {
  const identifiers = project?.identifiers ?? [];
  const connections = project?.connections ?? [];
  const locations = project?.locations ?? [];
  const pinLinks = project?.pinLinks ?? [];
  const timeline = buildTimeline(project);
  const evidence = buildEvidenceAppendix(project);
  const analysis = buildAnalysis(project);
  const network = analyzeNetwork(
    identifiers as { id: string }[],
    connections as { id: string; source: string; target: string }[],
  );

  const idLabel = buildIdLabelMap(identifiers);

  const target = project?.target ?? {};
  const title = escapeHtml(project?.name || 'Untitled Project');

  const sections: string[] = [];

  if (target.name || target.notes) {
    sections.push(`<section>
      <h2>Target</h2>
      ${target.name ? `<p><strong>${escapeHtml(target.name)}</strong></p>` : ''}
      ${target.notes ? `<p class="muted">${escapeHtml(target.notes)}</p>` : ''}
    </section>`);
  }

  if (identifiers.length > 0) {
    const groups = groupIdentifiers(identifiers)
      .map(
        (group) => `<h3>${escapeHtml(group.label)}</h3>
        ${group.items
          .map((identifier) => {
            const def = getTypeDef(identifier.type);
            const fields = identifierFieldEntries(identifier);
            const notes = nonEmpty(identifier.notes)
              ? `<li><span>Notes</span><em>${escapeHtml(identifier.notes)}</em></li>`
              : '';
            const provenance = provenanceRows(identifier)
              .map(
                ([label, value]) =>
                  `<li><span>${escapeHtml(label)}</span><em>${escapeHtml(value)}</em></li>`,
              )
              .join('');
            return `<div class="card">
              <div class="card-title">
                <span class="badge" style="background:${escapeHtml(def.color)}">${escapeHtml(def.glyph)}</span>
                ${escapeHtml(def.label)} — ${escapeHtml(getDisplayLabel(identifier))}
              </div>
              <ul class="fields">
                ${fields
                  .map(
                    ([label, value]) =>
                      `<li><span>${escapeHtml(label)}</span><em>${escapeHtml(value)}</em></li>`,
                  )
                  .join('')}
                ${notes}
                ${provenance}
              </ul>
            </div>`;
          })
          .join('')}`,
      )
      .join('');
    sections.push(
      `<section><h2>Identifiers (${identifiers.length})</h2>${groups}</section>`,
    );
  }

  if (connections.length > 0) {
    const items = connections
      .map((connection) => {
        const from = idLabel.get(connection.source) ?? connection.source ?? '?';
        const to = idLabel.get(connection.target) ?? connection.target ?? '?';
        const label = nonEmpty(connection.label);
        const conf = confidenceLabel(connection.confidence);
        const suffix = [label, conf].filter(Boolean).join(' · ');
        return `<li>${escapeHtml(from)} <span class="arrow">↔</span> ${escapeHtml(to)}${
          suffix ? ` <span class="muted">(${escapeHtml(suffix)})</span>` : ''
        }</li>`;
      })
      .join('');
    sections.push(
      `<section><h2>Connections (${connections.length})</h2><ul class="plain">${items}</ul></section>`,
    );
  }

  if (locations.length > 0) {
    const items = locations
      .map((location) => {
        const coords = formatCoordinates(location.lat, location.lng);
        const linked = pinLinks
          .filter((link) => link.pinId === location.id)
          .map((link) => idLabel.get(link.identifierId) ?? link.identifierId)
          .filter(Boolean);
        const rows = [
          location.address
            ? `<li><span>Address</span><em>${escapeHtml(location.address)}</em></li>`
            : '',
          coords
            ? `<li><span>Coordinates</span><em>${escapeHtml(coords)}</em></li>`
            : '',
          nonEmpty(location.visitedAt)
            ? `<li><span>Visited</span><em>${escapeHtml(location.visitedAt)}</em></li>`
            : '',
          nonEmpty(location.withWho)
            ? `<li><span>With</span><em>${escapeHtml(location.withWho)}</em></li>`
            : '',
          nonEmpty(location.notes)
            ? `<li><span>Notes</span><em>${escapeHtml(location.notes)}</em></li>`
            : '',
          provenanceRows(location)
            .map(
              ([label, value]) =>
                `<li><span>${escapeHtml(label)}</span><em>${escapeHtml(value)}</em></li>`,
            )
            .join(''),
          linked.length
            ? `<li><span>Linked identifiers</span><em>${escapeHtml(linked.join(', '))}</em></li>`
            : '',
        ].join('');
        return `<div class="card">
          <div class="card-title">${escapeHtml(location.label || 'Unnamed location')}</div>
          <ul class="fields">${rows}</ul>
        </div>`;
      })
      .join('');
    sections.push(
      `<section><h2>Locations (${locations.length})</h2>${items}</section>`,
    );
  }

  if (timeline.length > 0) {
    const items = timeline
      .map((entry) => {
        const meta = [entry.kind, entry.confidence].filter(Boolean).join(' · ');
        return `<li class="tl-item">
          <div class="tl-date">${escapeHtml(entry.date || 'Undated')}</div>
          <div class="tl-body">
            <div class="tl-title">${escapeHtml(entry.title)}</div>
            <div class="muted tl-meta">${escapeHtml(meta)}</div>
            ${entry.detail ? `<p>${escapeHtml(entry.detail)}</p>` : ''}
            ${entry.source ? `<div class="muted tl-src">${escapeHtml(entry.source)}</div>` : ''}
            ${entry.links.length ? `<div class="muted tl-links">Linked: ${escapeHtml(entry.links.join(', '))}</div>` : ''}
          </div>
        </li>`;
      })
      .join('');
    sections.push(
      `<section><h2>Timeline (${timeline.length})</h2><ul class="timeline">${items}</ul></section>`,
    );
  }

  if (network.nodeCount > 0) {
    const connectors = network.ranked.filter((r) => r.degree > 0).slice(0, 6);
    const connectorRows = connectors
      .map((connector) => {
        const label = idLabel.get(connector.id) ?? connector.id;
        return `<tr><td>${escapeHtml(label)}</td><td>${connector.degree}</td><td>${connector.betweenness.toFixed(2)}</td></tr>`;
      })
      .join('');
    const clusterRows = network.components
      .filter((c) => c.length > 1)
      .map((members, index) => {
        const names = members
          .map((id) => escapeHtml(idLabel.get(id) ?? id))
          .join(', ');
        return `<tr><td>Cluster ${index + 1}</td><td>${members.length}</td><td class="src">${names}</td></tr>`;
      })
      .join('');
    sections.push(`<section>
      <h2>Network analysis</h2>
      <div class="muted">${network.nodeCount} entities · ${network.edgeCount} connections · ${network.componentCount} clusters · ${network.independentCycles} loops · density ${(network.density * 100).toFixed(1)}%</div>
      ${connectorRows ? `<h3>Key connectors</h3><table class="evidence"><thead><tr><th>Entity</th><th>Links</th><th>Betweenness</th></tr></thead><tbody>${connectorRows}</tbody></table>` : ''}
      ${clusterRows ? `<h3>Clusters</h3><table class="evidence"><thead><tr><th>Group</th><th>Size</th><th>Members</th></tr></thead><tbody>${clusterRows}</tbody></table>` : ''}
    </section>`);
  }

  if (analysis.length > 0) {
    const items = analysis
      .map((entry) => {
        const scoreText = entry.score > 0 ? `+${entry.score}` : entry.score;
        const evidenceItems = entry.evidence
          .map(
            (e) =>
              `<li class="an-ev ${e.sign === '−' ? 'refutes' : 'supports'}"><span class="an-sign">${escapeHtml(e.sign)}</span><span class="an-strength">${escapeHtml(e.strength)}</span><span>${escapeHtml(e.text)}</span>${e.detail ? `<span class="muted"> — ${escapeHtml(e.detail)}</span>` : ''}</li>`,
          )
          .join('');
        return `<div class="card">
          <div class="card-title">${escapeHtml(entry.title)} <span class="verdict">${escapeHtml(entry.verdict)} · ${escapeHtml(String(scoreText))}</span></div>
          ${entry.description ? `<p class="muted">${escapeHtml(entry.description)}</p>` : ''}
          <ul class="plain analysis-ev">${evidenceItems || '<li class="muted">No evidence recorded.</li>'}</ul>
        </div>`;
      })
      .join('');
    sections.push(
      `<section><h2>Analysis of competing hypotheses</h2>${items}</section>`,
    );
  }

  if (evidence.length > 0) {
    const rows = evidence
      .map(
        (row) => `<tr>
          <td>${escapeHtml(row.item)}</td>
          <td>${escapeHtml(row.type)}</td>
          <td>${escapeHtml(row.confidence || '—')}</td>
          <td class="src">${escapeHtml(row.source || '—')}</td>
          <td>${escapeHtml(row.accessed || '—')}</td>
          <td class="src">${escapeHtml(row.archived || '—')}</td>
        </tr>`,
      )
      .join('');
    sections.push(
      `<section><h2>Evidence appendix</h2>
      <table class="evidence">
        <thead><tr><th>Item</th><th>Type</th><th>Confidence</th><th>Source</th><th>Accessed</th><th>Archived</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></section>`,
    );
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} — Report</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 48px 24px;
    background: #f7f5f0;
    color: #1a1712;
    font: 14px/1.6 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  main { max-width: 820px; margin: 0 auto; }
  header { border-bottom: 2px solid #c9a56b; padding-bottom: 16px; margin-bottom: 28px; }
  h1 { font-size: 28px; margin: 0 0 4px; }
  .muted { color: #6e7076; }
  h2 { font-size: 18px; margin: 32px 0 12px; border-bottom: 1px solid #ded7c9; padding-bottom: 6px; }
  h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: #8a6a34; margin: 20px 0 8px; }
  .card { border: 1px solid #ded7c9; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; background: #fff; }
  .card-title { font-weight: 600; margin-bottom: 6px; }
  .badge { display: inline-block; min-width: 22px; text-align: center; padding: 2px 5px; border-radius: 5px; color: #fff; font-size: 11px; margin-right: 6px; }
  ul.fields { list-style: none; margin: 0; padding: 0; }
  ul.fields li { display: flex; gap: 10px; padding: 2px 0; }
  ul.fields li span { flex: 0 0 150px; color: #6e7076; font-size: 12px; padding-top: 1px; }
  ul.fields li em { font-style: normal; }
  ul.plain { margin: 0; padding-left: 18px; }
  .arrow { color: #c9a56b; }
  ul.timeline { list-style: none; margin: 0; padding: 0; }
  li.tl-item { display: flex; gap: 14px; padding: 8px 0; border-bottom: 1px dashed #e6dfd2; }
  .tl-date { flex: 0 0 120px; font-size: 12px; color: #6e7076; padding-top: 2px; }
  .tl-body { flex: 1; }
  .tl-title { font-weight: 600; }
  .tl-meta { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  .tl-item p { margin: 4px 0; }
  .tl-src, .tl-links { font-size: 12px; word-break: break-all; }
  table.evidence { width: 100%; border-collapse: collapse; font-size: 12px; }
  table.evidence th, table.evidence td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e6dfd2; vertical-align: top; }
  table.evidence th { color: #8a6a34; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  table.evidence td.src { max-width: 220px; word-break: break-all; }
  ul.analysis-ev { margin: 4px 0 0; padding-left: 0; list-style: none; }
  ul.analysis-ev li { padding: 2px 0; }
  .an-sign { display: inline-block; width: 14px; font-weight: 700; }
  .an-ev.supports .an-sign { color: #0f766e; }
  .an-ev.refutes .an-sign { color: #b91c1c; }
  .an-strength { display: inline-block; min-width: 66px; color: #8a6a34; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  .card-title .verdict { float: right; font-size: 11px; font-weight: 500; color: #8a6a34; text-transform: uppercase; letter-spacing: 0.04em; }
  footer { margin-top: 40px; color: #6e7076; font-size: 12px; text-align: center; }
  @media print {
    body { background: #fff; padding: 0; }
    .card { break-inside: avoid; }
  }
</style>
</head>
<body>
<main>
  <header>
    <h1>${title}</h1>
    <div class="muted">Generated ${escapeHtml(new Date().toLocaleString())} · ${identifiers.length} identifiers · ${locations.length} locations · ${analysis.length} hypotheses</div>
  </header>
  ${sections.join('\n')}
  <footer>ARSENAL OSINT — investigation report</footer>
</main>
</body>
</html>`;
}

export function downloadProjectReport(project: ReportProject): void {
  const markdown = buildProjectReportMarkdown(project);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeName(project?.name ?? '')}-report.md`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function printProjectReport(project: ReportProject): void {
  const html = buildProjectReportHtml(project);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.addEventListener('load', () => {
    win.print();
  });
}
