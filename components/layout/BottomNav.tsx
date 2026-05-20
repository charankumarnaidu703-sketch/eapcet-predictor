'use client';

import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      href: '/',
      label: 'Predictor',
      icon: 'analytics',
      isActive: pathname === '/',
    },
    {
      href: '/compare',
      label: 'Compare',
      icon: 'compare_arrows',
      isActive: pathname === '/compare',
    },
    {
      href: '/tools/counselling',
      label: 'Counselling',
      icon: 'forum',
      isActive: pathname === '/tools/counselling',
    },
    {
      href: '/tools/scholarships',
      label: 'Tools',
      icon: 'handyman',
      // Active for any other tools pages (like scholarships or reimbursement)
      isActive: pathname.startsWith('/tools/') && pathname !== '/tools/counselling',
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-2 pb-safe bg-[#fbf9f5] border-t border-[#c4c6cd] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-2xl md:hidden"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      {NAV_ITEMS.map((item) => {
        if (item.isActive) {
          return (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center bg-[#fed65b] text-[#745c00] rounded-full px-4 py-1.5 active:scale-90 transition-transform duration-150"
            >
              <span className="material-symbols-outlined text-[20px] font-normal leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                {item.icon}
              </span>
              <span className="text-[10px] font-bold tracking-tight uppercase leading-tight mt-0.5">
                {item.label}
              </span>
            </a>
          );
        }

        return (
          <a
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center text-[#44474c] hover:text-[#0b1a2a] transition-colors active:scale-90 transition-transform duration-150 py-1 px-3"
          >
            <span className="material-symbols-outlined text-[24px] font-normal leading-none">
              {item.icon}
            </span>
            <span className="text-[11px] font-medium leading-tight mt-0.5">
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
