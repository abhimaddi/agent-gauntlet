'use client';

import { normalizeTheme, THEME_STORAGE_KEY, type ThemeMode } from '@/lib/theme';

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  function handleToggle() {
    const currentTheme = normalizeTheme(document.documentElement.dataset.theme);
    const nextTheme: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore localStorage failures and still apply the theme to the current document.
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle light or dark mode"
      title="Toggle light or dark mode"
      onClick={handleToggle}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        <span className="theme-toggle-icon-sun">
          <SunIcon />
        </span>
        <span className="theme-toggle-icon-moon">
          <MoonIcon />
        </span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 2.6v2.4" />
      <path d="M12 19v2.4" />
      <path d="M4.9 4.9l1.7 1.7" />
      <path d="M17.4 17.4l1.7 1.7" />
      <path d="M2.6 12H5" />
      <path d="M19 12h2.4" />
      <path d="M4.9 19.1l1.7-1.7" />
      <path d="M17.4 6.6l1.7-1.7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.1 14.2A8.7 8.7 0 1 1 9.8 3.9a7.1 7.1 0 0 0 10.3 10.3Z" />
    </svg>
  );
}
