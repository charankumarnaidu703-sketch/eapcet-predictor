'use client';

import MobileNav from '@/components/MobileNav';

const NAV_LINKS = [
  { href: '/compare', label: 'Compare' },
  { href: '/blog', label: 'Guides' },
  { href: '/tools/counselling', label: 'Counselling' },
  { href: '/tools/scholarships', label: 'Scholarships' },
  { href: '/tools/reimbursement', label: 'Fee Aid' },
];

export default function Header() {
  return (
    <nav className="nav relative" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <a href="/" className="nav-logo">
          🎯 Rank<span>Sure</span>
        </a>

        {/* Desktop Links — uses .nav-links (hidden on mobile via globals.css) */}
        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        {/* Mobile sliding drawer */}
        <MobileNav />
      </div>
    </nav>
  );
}

