'use client';

import { useState, useEffect, useRef } from 'react';

const NAV_LINKS = [
  { href: '/compare', label: 'Compare' },
  { href: '/blog', label: 'Guides' },
  { href: '/tools/counselling', label: 'Counselling' },
  { href: '/tools/scholarships', label: 'Scholarships' },
  { href: '/tools/reimbursement', label: 'Fee Aid' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="nav relative" role="navigation" aria-label="Main navigation" ref={menuRef}>
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

        {/* Hamburger Icon — Visible on mobile only (< 768px) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 p-2 rounded-full hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              isOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Full-Width Dropdown below header */}
      {isOpen && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 bg-[#0d1b2a] border-b border-white/10 z-50 shadow-lg">
          <ul className="flex flex-col list-none p-0 m-0">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="w-full">
                <a
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 border-b border-gray-100 text-white/90 hover:text-white hover:bg-white/5 text-base font-medium transition-all"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
