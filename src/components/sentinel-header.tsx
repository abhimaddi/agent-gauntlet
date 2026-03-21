'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Lobby' },
  { href: '/history', label: 'History' },
  { href: '/dataset', label: 'Dataset' },
];

export function SentinelHeader() {
  const pathname = usePathname();

  return (
    <header className="card mb-6 px-4 py-3 md:px-6 md:py-4 fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="chip chip-accent mb-2">Sentinel Arena</p>
          <h1 className="text-2xl font-semibold tracking-tight title-glow">Adversarial Browser-Agent Benchmark</h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border px-4 py-1.5 text-sm transition"
                style={{
                  borderColor: active ? 'var(--accent)' : 'var(--border)',
                  background: active ? 'rgba(103, 181, 255, 0.14)' : 'transparent',
                  color: active ? '#cde7ff' : 'var(--text-muted)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
