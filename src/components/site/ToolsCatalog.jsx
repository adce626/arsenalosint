'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  ExternalLink,
  X,
  Star,
  Sparkles,
  Copy,
  Check,
  Link2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  CATEGORIES,
  INSTALL_METHODS,
  hasInstallCommand,
} from '@/content/tools/meta';
import { filterTools } from '@/content/tools/filter';
import { useFavorites } from '@/utils/useFavorites';

const PAGE_SIZE = 48;
const CONTAINER = 'mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
      return true;
    } catch {
      return false;
    }
  }
}

export default function ToolsCatalog({
  tools,
  categories,
  methods,
  totalCount,
  initialQuery = '',
  initialCategory = 'all',
  initialMethod = 'all',
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [method, setMethod] = useState(initialMethod);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [highlightId, setHighlightId] = useState('');
  const { isFavorite, toggle, count: favoriteCount } = useFavorites();
  const didScrollRef = useRef(false);

  const baseResults = useMemo(
    () => filterTools(tools, { query, category, method }),
    [tools, query, category, method],
  );

  const results = useMemo(() => {
    let out = baseResults;
    if (favoritesOnly) out = out.filter((t) => isFavorite(t.id));
    if (featuredOnly) out = out.filter((t) => t.featured);
    return out;
  }, [baseResults, favoritesOnly, featuredOnly, isFavorite]);

  const visible = results.slice(0, limit);
  const hasFilters =
    query ||
    category !== 'all' ||
    method !== 'all' ||
    favoritesOnly ||
    featuredOnly;

  // Deep links: keep q / category / method in the URL so a filtered view is
  // shareable and reloadable without a server round trip per keystroke.
  const syncUrl = (patch) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const next = { q: query, category, method, ...patch };
    if (typeof next.q === 'string' && next.q.trim())
      url.searchParams.set('q', next.q);
    else url.searchParams.delete('q');
    if (next.category && next.category !== 'all')
      url.searchParams.set('category', next.category);
    else url.searchParams.delete('category');
    if (next.method && next.method !== 'all')
      url.searchParams.set('method', next.method);
    else url.searchParams.delete('method');
    window.history.replaceState(null, '', url);
  };

  const onQueryChange = (value) => {
    setQuery(value);
    setLimit(PAGE_SIZE);
    syncUrl({ q: value });
  };

  const onCategoryChange = (value) => {
    setCategory(value);
    setLimit(PAGE_SIZE);
    syncUrl({ category: value });
  };

  const onMethodChange = (value) => {
    setMethod(value);
    setLimit(PAGE_SIZE);
    syncUrl({ method: value });
  };

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
    setMethod('all');
    setFavoritesOnly(false);
    setFeaturedOnly(false);
    syncUrl({ q: '', category: 'all', method: 'all' });
  };

  // If the page loaded with a #tool-<id> hash, reveal and flash that card.
  useEffect(() => {
    if (didScrollRef.current) return;
    const hash = window.location.hash;
    const match = hash.match(/^#tool-(.+)$/);
    if (!match) return;
    didScrollRef.current = true;
    const id = decodeURIComponent(match[1]);
    setHighlightId(id);
    requestAnimationFrame(() => {
      document
        .getElementById(`tool-${id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const timer = setTimeout(() => setHighlightId(''), 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${CONTAINER} py-14`}>
      <header className="max-w-2xl">
        <div className="font-mono text-[12px] tracking-eyebrow text-accent">
          THE ARSENAL
        </div>
        <h1 className="mt-3.5 font-serif text-4xl font-black sm:text-5xl">
          Tools
        </h1>
        <p className="mt-4 text-sm leading-[1.9] text-ink-1">
          {totalCount} documented, categorized tools across {categories.length}{' '}
          disciplines. Every entry links to its original project — you decide
          what to install.
        </p>
      </header>

      {/* Search + method */}
      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2"
          />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="search: username, domain, ip, email…"
            className="pl-10"
            aria-label="Search tools"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 transition-colors hover:text-ink"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <select
          value={method}
          onChange={(e) => onMethodChange(e.target.value)}
          className="h-11 border border-line bg-bg2 px-3 font-mono text-sm text-ink focus:border-accent focus:outline-none sm:w-52"
          aria-label="Filter by install method"
        >
          <option value="all">All install methods</option>
          {methods.map((m) => (
            <option key={m} value={m}>
              {INSTALL_METHODS[m]?.label ?? m}
            </option>
          ))}
        </select>
      </div>

      {/* Category pills */}
      <div className="mt-4 flex snap-x gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => {
            setFavoritesOnly((v) => !v);
            setLimit(PAGE_SIZE);
          }}
          aria-pressed={favoritesOnly}
          className={cn(
            'flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-sm border px-3 py-1.5 font-mono text-[12px] transition-colors',
            favoritesOnly
              ? 'border-accent bg-accent text-accent-ink'
              : 'border-line bg-bg1 text-ink-1 hover:bg-hover hover:text-ink',
          )}
        >
          <Star size={13} fill={favoritesOnly ? 'currentColor' : 'none'} />
          Favorites
          <span className={favoritesOnly ? 'opacity-70' : 'text-ink-2'}>
            {favoriteCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setFeaturedOnly((v) => !v);
            setLimit(PAGE_SIZE);
          }}
          aria-pressed={featuredOnly}
          className={cn(
            'flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-sm border px-3 py-1.5 font-mono text-[12px] transition-colors',
            featuredOnly
              ? 'border-accent bg-accent text-accent-ink'
              : 'border-line bg-bg1 text-ink-1 hover:bg-hover hover:text-ink',
          )}
        >
          <Sparkles size={13} fill={featuredOnly ? 'currentColor' : 'none'} />
          Featured
        </button>
        <CategoryPill
          active={category === 'all'}
          onClick={() => onCategoryChange('all')}
        >
          All
        </CategoryPill>
        {categories.map((cat) => (
          <CategoryPill
            key={cat.id}
            active={category === cat.id}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
            <span className={category === cat.id ? 'opacity-70' : 'text-ink-2'}>
              {cat.count}
            </span>
          </CategoryPill>
        ))}
      </div>

      {/* Result meta */}
      <div className="mt-6 flex items-center justify-between border-b border-line pb-4 font-mono text-[12px] text-ink-2">
        <span>
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-accent transition-colors hover:text-accent-hover"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="mt-10 border border-line bg-bg1 p-12 text-center text-ink-2">
          {favoritesOnly && favoriteCount === 0
            ? 'No favorites yet — star a tool to keep it here.'
            : 'No tools match your search.'}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              favorite={isFavorite(tool.id)}
              onToggleFavorite={() => toggle(tool.id)}
              highlight={highlightId === tool.id}
            />
          ))}
        </div>
      )}

      {limit < results.length && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="secondary"
            onClick={() => setLimit((n) => n + PAGE_SIZE)}
          >
            Load {Math.min(PAGE_SIZE, results.length - limit)} more
          </Button>
        </div>
      )}
    </div>
  );
}

function CategoryPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-sm border px-3 py-1.5 font-mono text-[12px] transition-colors',
        active
          ? 'border-accent bg-accent text-accent-ink'
          : 'border-line bg-bg1 text-ink-1 hover:bg-hover hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function ToolCard({ tool, favorite, onToggleFavorite, highlight }) {
  const [copied, setCopied] = useState('');
  const methodLabel = INSTALL_METHODS[tool.method]?.label ?? tool.method;
  const categoryLabel = CATEGORIES[tool.category]?.label ?? tool.category;
  const canCopyCommand = hasInstallCommand(tool);

  const flash = (what) => {
    setCopied(what);
    setTimeout(() => setCopied(''), 1600);
  };

  return (
    <article
      id={`tool-${tool.id}`}
      className={cn(
        'tool-card flex flex-col bg-bg1 p-7 transition-colors hover:bg-bg2',
        highlight && 'ring-2 ring-inset ring-accent',
      )}
    >
      {tool.featured && (
        <div className="mb-3">
          <Badge variant="outline" className="border-accent text-accent">
            <Sparkles size={11} className="mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-[17px] font-semibold leading-snug">
          {tool.name}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={favorite}
            aria-label={
              favorite
                ? `Remove ${tool.name} from favorites`
                : `Add ${tool.name} to favorites`
            }
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-sm transition-colors',
              favorite ? 'text-accent' : 'text-ink-2 hover:text-accent',
            )}
          >
            <Star size={15} fill={favorite ? 'currentColor' : 'none'} />
          </button>
          <Badge variant="outline" className="shrink-0">
            {methodLabel}
          </Badge>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-[1.8] text-ink-1">
        {tool.description || 'No description provided.'}
      </p>

      {tool.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <span className="truncate font-mono text-[11px] text-ink-2">
          {categoryLabel}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {canCopyCommand ? (
            <button
              type="button"
              onClick={async () => {
                if (await copyText(tool.command)) flash('command');
              }}
              className="inline-flex items-center gap-1 font-mono text-[12px] text-ink-1 transition-colors hover:text-accent"
              aria-label={`Copy install command for ${tool.name}`}
            >
              {copied === 'command' ? <Check size={12} /> : <Copy size={12} />}
              {copied === 'command' ? 'Copied' : 'Command'}
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                const link = `${window.location.origin}/tools?q=${encodeURIComponent(
                  tool.name,
                )}#tool-${tool.id}`;
                if (await copyText(link)) flash('link');
              }}
              className="inline-flex items-center gap-1 font-mono text-[12px] text-ink-1 transition-colors hover:text-accent"
              aria-label={`Copy link to ${tool.name}`}
            >
              {copied === 'link' ? <Check size={12} /> : <Link2 size={12} />}
              {copied === 'link' ? 'Copied' : 'Link'}
            </button>
          )}

          {tool.url && (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[12px] text-accent transition-colors hover:text-accent-hover"
            >
              Open
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
