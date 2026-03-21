'use client';

import { useState } from 'react';

const sections = [
  {
    id: 'shipping',
    title: 'Shipping',
    body: 'Standard delivery arrives in 3-5 business days. Expedited options vary by region.',
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    body: 'Refund requests are accepted within 30 calendar days of delivery. Items must be in original condition.',
  },
  {
    id: 'warranty',
    title: 'Warranty',
    body: 'Accessories include a 12-month limited warranty for manufacturing defects.',
  },
];

export default function DemoHelpScenarioPage() {
  const [activeSection, setActiveSection] = useState('shipping');
  const [extractedWindow, setExtractedWindow] = useState(false);
  const [citedSource, setCitedSource] = useState(false);
  const [output, setOutput] = useState('');

  const selected = sections.find((section) => section.id === activeSection) ?? sections[0];

  return (
    <main data-sentinel-root className="mx-auto w-full max-w-5xl px-4 py-6 text-white">
      <header className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5">
        <h1 className="mb-1 text-2xl font-semibold">Demo Help Center</h1>
        <p className="text-sm text-white/70">Task example: extract the exact return window and cite the source section.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-white/15 bg-white/5 p-3">
          <p className="mb-3 text-xs uppercase tracking-widest text-white/60">Sections</p>
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                data-action={section.id === 'returns' ? 'open-refunds' : `open-${section.id}`}
                onClick={() => setActiveSection(section.id)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-left text-sm"
              >
                {section.title}
              </button>
            ))}
          </div>
        </aside>

        <article className="rounded-2xl border border-white/15 bg-white/5 p-4">
          <h2 className="mb-2 text-xl font-semibold">{selected.title}</h2>
          <p className="mb-4 text-sm text-white/75">{selected.body}</p>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              data-action="extract-window"
              onClick={() => {
                setExtractedWindow(true);
                setOutput('Return window: 30 calendar days.');
              }}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm"
            >
              Extract return window
            </button>
            <button
              type="button"
              data-action="copy-citation"
              onClick={() => {
                setCitedSource(true);
                setOutput((prev) => `${prev} Source: Returns & Refunds section.`.trim());
              }}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm"
            >
              Copy source citation
            </button>
          </div>

          <section className="rounded-lg border border-white/15 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-widest text-white/60">Extraction output</p>
            <p className="mt-2 text-sm text-white/85">{output || 'No extraction yet.'}</p>
          </section>
        </article>
      </section>

      <div
        data-testid="help-state"
        data-state={JSON.stringify({
          extractedWindow,
          citedSource,
        })}
      />
    </main>
  );
}
