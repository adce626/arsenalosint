/**
 * Pure, client-safe filtering for a normalized tools array.
 *
 * Takes the array explicitly (rather than importing the catalog) so this
 * module never pulls the tools JSON into the client bundle.
 */
import type { Tool } from './meta';

export interface FilterOptions {
  query?: string;
  category?: string;
  method?: string;
}

export function filterTools(
  tools: Tool[],
  { query = '', category = 'all', method = 'all' }: FilterOptions = {},
): Tool[] {
  const q = query.trim().toLowerCase();
  return tools.filter((t) => {
    if (category !== 'all' && t.category !== category) return false;
    if (method !== 'all' && t.method !== method) return false;
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}
