import { describe, it, expect, vi } from 'vitest';
import { parseProject } from './projectIO';
import { PROJECT_SCHEMA_VERSION, createProject } from './createProject';

describe('parseProject', () => {
  it('fills defaults for a minimal valid project', () => {
    const project = parseProject({ name: 'Case A' });
    expect(project.name).toBe('Case A');
    expect(project.schemaVersion).toBe(PROJECT_SCHEMA_VERSION);
    expect(project.id).toBeTruthy();
    expect(project.identifiers).toEqual([]);
    expect(project.connections).toEqual([]);
    expect(project.target).toEqual({ name: '', notes: '' });
    expect(project.mapDisplay.pinConnectionColor).toBe('#ef4444');
  });

  it('round-trips createProject output', () => {
    const created = createProject({
      name: 'Round Trip',
      targetName: 'T',
      notes: 'N',
    });
    const parsed = parseProject(created);
    expect(parsed.name).toBe('Round Trip');
    expect(parsed.target).toEqual({ name: 'T', notes: 'N' });
    expect(parsed.id).toBe(created.id);
  });

  it('rejects values that are not JSON objects', () => {
    expect(() => parseProject(null)).toThrow(/valid JSON object/);
    expect(() => parseProject('nope')).toThrow(/valid JSON object/);
    expect(() => parseProject([])).toThrow(/valid JSON object/);
  });

  it('rejects a project without a name', () => {
    expect(() => parseProject({})).toThrow(/missing a "name"/);
    expect(() => parseProject({ name: 42 })).toThrow(/missing a "name"/);
  });

  it('warns but still parses on a schema-version mismatch', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const parsed = parseProject({ name: 'Old', schemaVersion: 0 });
    expect(parsed.schemaVersion).toBe(PROJECT_SCHEMA_VERSION);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
