import type { Metadata } from 'next';
import Script from 'next/script';
import { BootSequence } from '@/components/boot-sequence';
import { DEFAULT_THEME, THEME_STORAGE_KEY } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Gauntlet',
  description: 'Adversarial evaluation harness for browser agents',
};

const themeInitScript = `
  (() => {
    try {
      const storedTheme = window.localStorage.getItem('${THEME_STORAGE_KEY}');
      const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : '${DEFAULT_THEME}';
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = '${DEFAULT_THEME}';
      document.documentElement.style.colorScheme = '${DEFAULT_THEME}';
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="ag-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <div id="showdown-overlay" aria-hidden="true">
          <canvas id="showdown-canvas" />
        </div>
        <BootSequence />
        {children}
      </body>
    </html>
  );
}
