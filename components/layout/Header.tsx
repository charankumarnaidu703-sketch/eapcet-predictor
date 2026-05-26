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
      <div className="nav-inner flex items-center justify-between px-6 h-[60px] max-w-[1200px] mx-auto">
        <a href="/" className="nav-logo text-white font-bold flex items-center gap-2">
          🎯 Rank<span>Sure</span>
        </a>

        {/* Desktop Links — Hidden on mobile (< 768px) */}
        <ul className="hidden md:flex items-center gap-1 list-none">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-white/65 hover:text-white hover:bg-white/8 px-3 py-1.5 rounded text-[0.82rem] font-medium transition-all"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Unified sliding drawer MobileNav — replaces old hamburger & dropdown menu */}
        <MobileNav />
      </div>
    </nav>
  );
}
