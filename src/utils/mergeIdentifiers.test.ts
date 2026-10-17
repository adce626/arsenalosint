import { describe, it, expect } from 'vitest';
import { mergeIdentifiersInto, findDuplicateGroups } from './mergeIdentifiers';

function project(overrides = {}) {
  return {
    id: 'p1',
    name: 'Case',
    identifiers: [],
    connections: [],
    pinLinks: [],
    events: [],
    ...overrides,
  };
}

describe('mergeIdentifiersInto', () => {
  it('backfills fields, concatenates notes, and keeps the keeper in place', () => {
    const keep = {
      id: 'a',
      type: 'email',
      fields: { address: 'jane@example.com' },
      notes: 'primary',
      confidence: 'high',
    };
    const remove = {
      id: 'b',
      type: 'email',
      fields: { address: 'jane@work.com', provider: 'Gmail' },
      notes: 'work account',
      confidence: 'low',
      source: 'https://example.org',
    };
    const next = mergeIdentifiersInto(
      project({ identifiers: [keep, remove] }),
      'a',
      ['b'],
    );

    expect(next.identifiers).toHaveLength(1);
    expect(next.identifiers[0].id).toBe('a');
    // keeper value wins, missing field backfilled
    expect(next.identifiers[0].fields.address).toBe('jane@example.com');
    expect(next.identifiers[0].fields.provider).toBe('Gmail');
    expect(next.identifiers[0].notes).toBe('primary\n\nwork account');
    expect(next.identifiers[0].confidence).toBe('high');
    expect(next.identifiers[0].source).toBe('https://example.org');
  });

  it('remaps connections, drops self-loops, and de-duplicates', () => {
    const ids = [
      { id: 'a', type: 'email', fields: {} },
      { id: 'b', type: 'phone', fields: {} },
      { id: 'c', type: 'name', fields: {} },
    ];
    const connections = [
      { id: 'e1', source: 'a', target: 'c' },
      { id: 'e2', source: 'b', target: 'c' }, // collapses onto e1
      { id: 'e3', source: 'a', target: 'b' }, // becomes self-loop -> dropped
    ];
    const next = mergeIdentifiersInto(
      project({ identifiers: ids, connections }),
      'a',
      ['b'],
    );

    expect(next.connections).toHaveLength(1);
    expect(next.connections[0]).toMatchObject({ source: 'a', target: 'c' });
  });

  it('remaps and de-duplicates pin links and event references', () => {
    const ids = [
      { id: 'a', type: 'email', fields: {} },
      { id: 'b', type: 'email', fields: {} },
    ];
    const pinLinks = [
      { id: 'l1', pinId: 'pin1', identifierId: 'a' },
      { id: 'l2', pinId: 'pin1', identifierId: 'b' }, // duplicate pair
    ];
    const events = [
      { id: 'ev1', identifierIds: ['a', 'b', 'z'] },
      { id: 'ev2', identifierIds: [] },
    ];
    const next = mergeIdentifiersInto(
      project({ identifiers: ids, pinLinks, events }),
      'a',
      ['b'],
    );

    expect(next.pinLinks).toHaveLength(1);
    expect(next.pinLinks[0].identifierId).toBe('a');
    expect(next.events[0].identifierIds).toEqual(['a', 'z']);
    expect(next.events[1].identifierIds).toEqual([]);
  });

  it('is a no-op when there is nothing to merge', () => {
    const p = project({
      identifiers: [{ id: 'a', type: 'email', fields: {} }],
    });
    expect(mergeIdentifiersInto(p, 'a', [])).toBe(p);
    expect(mergeIdentifiersInto(p, 'a', ['a'])).toBe(p);
    expect(mergeIdentifiersInto(p, 'missing', ['a'])).toBe(p);
  });
});

describe('findDuplicateGroups', () => {
  it('groups a shared email across different types', () => {
    const groups = findDuplicateGroups([
      { id: 'a', type: 'email', fields: { address: 'Jane@Example.com' } },
      { id: 'b', type: 'instagram', fields: { email: 'jane@example.com' } },
      { id: 'c', type: 'phone', fields: { number: '+15550001111' } },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].kind).toBe('email');
    expect(groups[0].items.map((i: { id: string }) => i.id).sort()).toEqual([
      'a',
      'b',
    ]);
  });

  it('only compares usernames within the same platform', () => {
    const groups = findDuplicateGroups([
      { id: 'a', type: 'twitter', fields: { username: '@jane' } },
      { id: 'b', type: 'instagram', fields: { username: 'jane' } },
      { id: 'c', type: 'twitter', fields: { username: 'jane' } },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].items.map((i: { id: string }) => i.id).sort()).toEqual([
      'a',
      'c',
    ]);
  });

  it('returns nothing when all values are distinct', () => {
    expect(
      findDuplicateGroups([
        { id: 'a', type: 'email', fields: { address: 'a@x.com' } },
        { id: 'b', type: 'email', fields: { address: 'b@x.com' } },
      ]),
    ).toEqual([]);
  });
});
