export type ThemeMode = 'dark' | 'light';

export const DEFAULT_THEME: ThemeMode = 'dark';
export const THEME_STORAGE_KEY = 'agent-gauntlet-theme';

export function normalizeTheme(value?: string | null): ThemeMode {
  return value === 'light' ? 'light' : DEFAULT_THEME;
}
