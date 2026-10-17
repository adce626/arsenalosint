import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadAppConfig, writeLocalConfig } from './appConfig';

function mockConfigFile(fileConfig: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => fileConfig,
    })),
  );
}

describe('appConfig.loadAppConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses the config-file key when localStorage is empty', async () => {
    mockConfigFile({ googleMaps: { apiKey: 'FILE_KEY' } });
    const { config, sources } = await loadAppConfig();
    expect(config.googleMaps?.apiKey).toBe('FILE_KEY');
    expect(sources.googleMapsApiKey).toBe('config-file');
  });

  it('lets the localStorage value win over the file', async () => {
    mockConfigFile({ googleMaps: { apiKey: 'FILE_KEY' } });
    writeLocalConfig({ googleMaps: { apiKey: 'LS_KEY' } });
    const { config, sources } = await loadAppConfig();
    expect(config.googleMaps?.apiKey).toBe('LS_KEY');
    expect(sources.googleMapsApiKey).toBe('localStorage');
  });

  it('treats a null localStorage value as an explicit clear', async () => {
    mockConfigFile({ googleMaps: { apiKey: 'FILE_KEY' } });
    writeLocalConfig({
      googleMaps: { apiKey: null, apiKeyClearedFrom: 'FILE_KEY' },
    });
    const { config } = await loadAppConfig();
    expect(config.googleMaps?.apiKey).toBe('');
  });

  it('lets a newly provisioned file key win over a stale clear', async () => {
    mockConfigFile({ googleMaps: { apiKey: 'NEW_KEY' } });
    writeLocalConfig({
      googleMaps: { apiKey: null, apiKeyClearedFrom: 'OLD_KEY' },
    });
    const { config, sources } = await loadAppConfig();
    expect(config.googleMaps?.apiKey).toBe('NEW_KEY');
    expect(sources.googleMapsApiKey).toBe('config-file');
  });

  it('falls back gracefully when the config file is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        json: async () => ({}),
      })),
    );
    const { config, sources } = await loadAppConfig();
    expect(config.googleMaps?.apiKey).toBe('');
    expect(sources.googleMapsApiKey).toBeNull();
  });
});
