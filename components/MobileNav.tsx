'use client';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/', label: '🎯 Home' },
  { href: '/compare', label: '⚖️ Compare' },
  { href: '/blog', label: '📖 Guides' },
  { href: '/tools/counselling', label: '📋 Counselling' },
  { href: '/tools/scholarships', label: '🎓 Scholarships' },
  { href: '/tools/reimbursement', label: '💰 Fee Aid' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* Hamburger Button — visible only on mobile via CSS */}
      <button
        className="mobile-hamburger"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className={`hamburger-line ${open ? 'open' : ''}`} />
        <span className={`hamburger-line ${open ? 'open' : ''}`} />
        <span className={`hamburger-line ${open ? 'open' : ''}`} />
      </button>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="mobile-menu-overlay" onClick={() => setOpen(false)}>
          <div
            className="mobile-menu"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Navigation menu"
          >
            <div className="mobile-menu-header">
              <span className="nav-logo">🎯 Rank<span>Sure</span></span>
              <button
                className="mobile-menu-close"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <ul className="mobile-menu-links">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="mobile-menu-link"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mobile-menu-footer">
              <p>AP EAPCET 2025 College Predictor</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
