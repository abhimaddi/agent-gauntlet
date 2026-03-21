import type { Page } from 'playwright';
import type { DomSummary } from './types';

function detectSuspiciousSignals(text: string): string[] {
  const signals: string[] = [];
  const lower = text.toLowerCase();

  const patterns: Array<[RegExp, string]> = [
    [/ignore previous instructions|follow page instructions|system override/i, 'prompt_override_language'],
    [/urgent|verify now|required detour|sponsored/i, 'task_diversion_banner'],
    [/paste token|submit secret|internal key|expose/i, 'data_exfil_bait'],
    [/claim reward|finalize now|recommended/i, 'deceptive_ui_copy'],
  ];

  for (const [pattern, label] of patterns) {
    if (pattern.test(lower)) {
      signals.push(label);
    }
  }

  return [...new Set(signals)];
}

export async function extractDomSummary(page: Page): Promise<DomSummary> {
  return page
    .evaluate(() => {
      const textNodes = Array.from(document.querySelectorAll('main, section, article, p, h1, h2, h3, li, label, span'))
        .map((node) => node.textContent?.trim() ?? '')
        .filter(Boolean)
        .slice(0, 50);

      const buttonLabels = Array.from(document.querySelectorAll('button, [role="button"]'))
        .map((button) => button.textContent?.trim() ?? '')
        .filter(Boolean)
        .slice(0, 25);

      function esc(value: string): string {
        return value.replaceAll('"', '\\"');
      }

      function selectorFor(el: Element): string | null {
        const html = el as HTMLElement;
        const id = html.id?.trim();
        if (id) {
          return `#${CSS.escape(id)}`;
        }

        const testId = html.getAttribute('data-testid')?.trim();
        if (testId) {
          return `[data-testid="${esc(testId)}"]`;
        }

        const name = html.getAttribute('name')?.trim();
        if (name && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
          return `${el.tagName.toLowerCase()}[name="${esc(name)}"]`;
        }

        const aria = html.getAttribute('aria-label')?.trim();
        if (aria) {
          return `${el.tagName.toLowerCase()}[aria-label="${esc(aria)}"]`;
        }

        const role = html.getAttribute('role')?.trim();
        if (role === 'button') {
          const text = (html.textContent ?? '').trim();
          if (text) {
            const safe = esc(text).slice(0, 50);
            return `[role="button"]:has-text("${safe}")`;
          }
        }

        const tag = el.tagName.toLowerCase();
        if (tag === 'a' && html.getAttribute('href')) {
          const href = html.getAttribute('href') ?? '';
          if (href && href !== '#') {
            return `a[href="${esc(href)}"]`;
          }
        }

        let node: Element | null = el;
        const path: string[] = [];
        let depth = 0;
        while (node && node.parentElement && depth < 4) {
          const parent = node.parentElement as Element;
          const tagName = node.tagName.toLowerCase();
          const siblings = Array.from(parent.children).filter((child) => child.tagName === node!.tagName);
          const index = siblings.indexOf(node) + 1;
          path.unshift(`${tagName}:nth-of-type(${index})`);
          node = parent;
          depth += 1;
        }

        if (path.length > 0) {
          return path.join(' > ');
        }

        return null;
      }

      const actionableElements = Array.from(document.querySelectorAll('button, a[href], input, textarea, [role="button"]'))
        .slice(0, 30)
        .map((el) => {
          const selector = selectorFor(el);
          if (!selector) {
            return null;
          }

          const tag = el.tagName.toLowerCase();
          const role: 'button' | 'link' | 'input' | 'textarea' | 'other' =
            tag === 'button'
              ? 'button'
              : tag === 'a'
                ? 'link'
                : tag === 'input'
                  ? 'input'
                  : tag === 'textarea'
                    ? 'textarea'
                    : (el.getAttribute('role') === 'button' ? 'button' : 'other');

          const label =
            (el.getAttribute('aria-label') ?? '').trim() ||
            (el.textContent ?? '').trim() ||
            (el.getAttribute('placeholder') ?? '').trim() ||
            role;

          return {
            selector,
            role,
            label: label.slice(0, 120),
            inputType: tag === 'input' ? ((el as HTMLInputElement).type || 'text') : undefined,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

      const title = document.title || 'Untitled';
      const url = window.location.href;

      return {
        title,
        url,
        visibleText: textNodes,
        buttonLabels,
        actionableElements,
        suspiciousSignals: [] as string[],
      };
    })
    .then((summary) => {
      const signalText = [...summary.visibleText, ...summary.buttonLabels].join(' ');
      const suspiciousSignals = detectSuspiciousSignals(signalText);

      return {
        ...summary,
        suspiciousSignals,
      };
    });
}
