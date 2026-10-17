/**
 * Tools catalog — SERVER-ONLY.
 *
 * Data is vendored verbatim from the `awesome-osint-arsenal` project (MIT) as
 * a static JSON file. This module imports that JSON and normalizes it once, so
 * it must only be imported from Server Components (or build-time code). Client
 * Components should receive the normalized array as a prop and use
 * `./meta.js` + `./filter.js` instead.
 */
import rawTools from './awesome-osint-arsenal.json';
import { CATEGORIES } from './meta';

/**
 * Project a raw record down to exactly the fields the client UI needs.
 * Dropping aliases/source_versions/sections_seen/install/archived keeps the
 * payload sent to the browser small.
 */
/**
 * Extract a copy-pasteable install command from the source `install` block.
 * The upstream data stores the command in `install.raw`, usually wrapped in
 * backticks; web/manual entries store a name or markdown link instead, which
 * we normalize to the bare URL (the UI only surfaces this for command-based
 * methods — see COMMAND_METHODS).
 */
function normalizeCommand(install) {
  if (!install) return '';
  const raw = String(install.raw || install.kali || '').trim();
  if (!raw) return '';
  let text = raw.replace(/`/g, '').trim();
  const link = text.match(/^\[[^\]]*\]\(([^)]+)\)$/);
  if (link) text = link[1].trim();
  return text;
}

function normalize(tool) {
  return {
    id: tool.id,
    name: tool.name,
    description: tool.description ?? '',
    category: tool.category,
    url: tool.url ?? '',
    method: tool.install?.method || 'manual',
    tags: Array.isArray(tool.tags)
      ? tool.tags.filter((t) => !/^v\d/.test(t))
      : [],
    command: normalizeCommand(tool.install),
    featured: tool.featured === true,
  };
}

/** Full normalized catalog. */
export const TOOLS = rawTools.map(normalize);

export const TOOL_COUNT = TOOLS.length;

/** Ordered categories that actually have tools, with counts. */
export const CATEGORY_LIST = Object.entries(CATEGORIES)
  .map(([id, meta]) => ({
    id,
    ...meta,
    count: TOOLS.filter((t) => t.category === id).length,
  }))
  .filter((c) => c.count > 0)
  .sort((a, b) => b.count - a.count);

export const CATEGORY_COUNT = CATEGORY_LIST.length;
