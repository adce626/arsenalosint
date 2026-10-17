/**
 * App-wide config (e.g. Google Maps API key).
 *
 * Resolution order, highest priority first:
 *   1. localStorage — set via the in-app settings UI. Per-browser, easy to clear.
 *   2. public/app.config.json — user-editable file with the same shape as
 *      app.config.example.json. Useful for power users who want a portable
 *      config across browsers. Gitignored.
 *
 * Nothing is ever sent off-device. API keys never live in project files.
 */
import { z } from 'zod';

const STORAGE_KEY = 'osint-tool:app-config';
const CONFIG_PATH = '/app.config.json';

export interface GoogleMapsConfig {
  // A `null` value is the "explicitly cleared in this browser" sentinel.
  apiKey?: string | null;
  mapId?: string | null;
  [key: string]: unknown;
}

export interface MapConfig {
  provider?: string;
  [key: string]: unknown;
}

export interface AppConfig {
  googleMaps?: GoogleMapsConfig;
  map?: MapConfig;
  [key: string]: unknown;
}

export interface ConfigSources {
  googleMapsApiKey: string | null;
  googleMapsMapId: string | null;
  mapProvider: string | null;
}

export interface LoadedConfig {
  config: AppConfig;
  sources: ConfigSources;
}

const googleMapsSchema = z
  .object({
    apiKey: z.string().optional(),
    mapId: z.string().optional(),
  })
  .passthrough();

/** Loose schema for `app.config.json`: known sections are validated, unknown
 *  keys are preserved so future options keep working without a schema bump. */
export const appConfigSchema = z
  .object({
    googleMaps: googleMapsSchema.optional(),
    map: z.object({ provider: z.string().optional() }).passthrough().optional(),
  })
  .passthrough();

function asConfig(value: unknown): AppConfig | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as AppConfig;
}

function readLocalStorage(): AppConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return asConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function readConfigFile(): Promise<AppConfig | null> {
  try {
    const res = await fetch(CONFIG_PATH, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const result = appConfigSchema.safeParse(json);
    return asConfig(result.success ? result.data : json);
  } catch {
    return null;
  }
}

function mergeConfigs(...sources: (AppConfig | null)[]): AppConfig {
  const out: AppConfig = {};
  for (const src of sources) {
    if (!src) continue;
    for (const [section, values] of Object.entries(src)) {
      if (section.startsWith('_')) continue;
      if (values && typeof values === 'object') {
        out[section] = {
          ...((out[section] as Record<string, unknown>) ?? {}),
          ...(values as Record<string, unknown>),
        };
      }
    }
  }
  return out;
}

export async function loadAppConfig(): Promise<LoadedConfig> {
  const [fileConfig, lsConfig] = await Promise.all([
    readConfigFile(),
    Promise.resolve(readLocalStorage()),
  ]);

  // localStorage wins for "active" choices made through the UI, but a
  // file-level key still takes effect if the corresponding LS key is empty.
  const merged = mergeConfigs(fileConfig, lsConfig);

  // googleMaps.apiKey and googleMaps.mapId get special resolution because
  // of the explicit-clear sentinel (see resolveGoogleValue). Overwrite
  // whatever the naive merge produced with the resolved values.
  const apiKey = resolveGoogleValue(lsConfig, fileConfig, 'apiKey');
  const mapId = resolveGoogleValue(lsConfig, fileConfig, 'mapId');
  merged.googleMaps = {
    ...(merged.googleMaps ?? {}),
    apiKey: apiKey.value,
    mapId: mapId.value,
  };

  const sources: ConfigSources = {
    googleMapsApiKey: apiKey.source,
    googleMapsMapId: mapId.source,
    mapProvider: lsConfig?.map?.provider
      ? 'localStorage'
      : fileConfig?.map?.provider
        ? 'config-file'
        : null,
  };

  return { config: merged, sources };
}

/**
 * Resolve one googleMaps key (apiKey / mapId) across the two layers.
 *
 * - A non-empty localStorage value always wins (set via the in-app UI).
 * - A null localStorage value is the explicit-clear sentinel: "the user
 *   cleared this key in this browser". The sentinel records the file value
 *   it was created against (`<key>ClearedFrom`), and only keeps the key
 *   hidden while the file still holds that same value. If the file later
 *   provides a *different* non-empty value — e.g. Docker's entrypoint just
 *   regenerated app.config.json from .env, or the user hand-edited the
 *   file — that's fresh intent, and the file wins again. Without this, a
 *   stale clear from weeks ago would silently swallow a newly-provisioned
 *   key and the app would inexplicably ask for setup.
 */
function resolveGoogleValue(
  lsConfig: AppConfig | null,
  fileConfig: AppConfig | null,
  key: 'apiKey' | 'mapId',
): { value: string; source: string | null } {
  const fileVal = fileConfig?.googleMaps?.[key]?.trim?.() || '';
  const lsSection = lsConfig?.googleMaps;
  if (lsSection && key in lsSection) {
    const lsVal = lsSection[key];
    if (typeof lsVal === 'string' && lsVal.trim()) {
      return { value: lsVal.trim(), source: 'localStorage' };
    }
    const clearedFrom = String(lsSection[`${key}ClearedFrom`] ?? '');
    if (fileVal && fileVal !== clearedFrom) {
      return { value: fileVal, source: 'config-file' };
    }
    return { value: '', source: 'localStorage' };
  }
  return fileVal
    ? { value: fileVal, source: 'config-file' }
    : { value: '', source: null };
}

export function writeLocalConfig(patch: AppConfig): AppConfig {
  const current = readLocalStorage() ?? {};
  const next = mergeConfigs(current, patch);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearLocalConfigSection(section: string): AppConfig {
  const current = readLocalStorage() ?? {};
  if (current[section]) delete current[section];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current;
}

/** Remove a single key (e.g. "mapId") from a section without nuking the whole
 *  section. Used so clearing the LS Map ID doesn't also clear the LS API key. */
export function clearLocalConfigKey(section: string, key: string): AppConfig {
  const current = readLocalStorage() ?? {};
  const sectionValue = current[section];
  if (sectionValue && typeof sectionValue === 'object' && key in sectionValue) {
    const sectionCopy = { ...(sectionValue as Record<string, unknown>) };
    delete sectionCopy[key];
    if (Object.keys(sectionCopy).length === 0) {
      delete current[section];
    } else {
      current[section] = sectionCopy;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  return current;
}

export const APP_CONFIG_PATH_HINT = 'public/app.config.json';
