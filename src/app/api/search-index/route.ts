import { TOOLS } from '@/content/tools/catalog';

// Prerendered at build time into a static JSON payload so the command palette
// can fetch the tool index lazily without shipping 400KB of catalog to every
// page. Kept intentionally small: only the fields search needs.
export const dynamic = 'force-static';

export function GET() {
  const items = TOOLS.map((tool) => ({
    name: tool.name,
    category: tool.category,
    url: tool.url,
  }));

  return Response.json(items, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
