'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

const links = [
  { href: '/history', label: 'History' },
  { href: '/dataset', label: 'Dataset' },
];

export function SentinelHeader() {
  const pathname = usePathname();

  return (
    <header className="ag-topbar fade-in">
      <div className="ag-topbar-left">
        <Link href="/" className="ag-home-badge" aria-label="Agent Gauntlet home">
          <span className="ag-home-badge-rim" aria-hidden="true" />
          <span className="ag-home-badge-mark">AG</span>
        </Link>
      </div>

      <div className="ag-nav">
        <nav className="ag-nav-links" aria-label="Primary">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} className={active ? 'active' : ''}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ag-nav-tools">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
