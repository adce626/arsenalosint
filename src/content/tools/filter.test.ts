import { describe, it, expect } from 'vitest';
import { filterTools } from './filter';
import type { Tool } from './meta';

const tools: Tool[] = [
  {
    id: '1',
    name: 'Sherlock',
    description: 'Hunt usernames across sites',
    category: 'username-social',
    url: 'https://example.com',
    method: 'pip',
    tags: ['username'],
  },
  {
    id: '2',
    name: 'theHarvester',
    description: 'Emails and subdomains',
    category: 'domain-ip-network',
    url: 'https://example.com',
    method: 'git',
    tags: ['emails', 'dns'],
  },
  {
    id: '3',
    name: 'Google',
    description: 'Search engine',
    category: 'search-dorking',
    url: 'https://example.com',
    method: 'web',
    tags: [],
  },
];

describe('filterTools', () => {
  it('returns everything when no filters are set', () => {
    expect(filterTools(tools)).toHaveLength(3);
  });

  it('filters by category', () => {
    expect(
      filterTools(tools, { category: 'domain-ip-network' }).map((t) => t.id),
    ).toEqual(['2']);
  });

  it('filters by method', () => {
    expect(filterTools(tools, { method: 'web' }).map((t) => t.id)).toEqual([
      '3',
    ]);
  });

  it('matches query against name, case-insensitively', () => {
    expect(filterTools(tools, { query: 'SHER' }).map((t) => t.id)).toEqual([
      '1',
    ]);
  });

  it('matches query against description', () => {
    expect(
      filterTools(tools, { query: 'subdomains' }).map((t) => t.id),
    ).toEqual(['2']);
  });

  it('matches query against tags', () => {
    expect(filterTools(tools, { query: 'dns' }).map((t) => t.id)).toEqual([
      '2',
    ]);
  });

  it('combines query and category', () => {
    expect(
      filterTools(tools, {
        query: 'emails',
        category: 'domain-ip-network',
      }).map((t) => t.id),
    ).toEqual(['2']);
    expect(
      filterTools(tools, { query: 'emails', category: 'search-dorking' }),
    ).toHaveLength(0);
  });

  it('trims whitespace-only queries', () => {
    expect(filterTools(tools, { query: '   ' })).toHaveLength(3);
  });
});
