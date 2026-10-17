import ToolsCatalog from '@/components/site/ToolsCatalog.jsx';
import { TOOLS, CATEGORY_LIST, TOOL_COUNT } from '@/content/tools/catalog';
import { METHOD_LIST } from '@/content/tools/meta';

export const metadata = {
  title: 'Tools',
  description:
    'Search the full arsenal of documented OSINT and security tools, filterable by discipline and install method.',
};

export default async function ToolsPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.q === 'string' ? params.q : '';
  const category =
    typeof params?.category === 'string' ? params.category : 'all';
  const method = typeof params?.method === 'string' ? params.method : 'all';

  return (
    <ToolsCatalog
      tools={TOOLS}
      categories={CATEGORY_LIST}
      methods={METHOD_LIST}
      totalCount={TOOL_COUNT}
      initialQuery={query}
      initialCategory={
        CATEGORY_LIST.some((c) => c.id === category) ? category : 'all'
      }
      initialMethod={METHOD_LIST.includes(method) ? method : 'all'}
    />
  );
}
