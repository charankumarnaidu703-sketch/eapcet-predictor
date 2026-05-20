/**
 * Breadcrumb — visual breadcrumb navigation + BreadcrumbList JSON-LD schema
 * Used across all pages for SEO and UX.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ranksure.vercel.app';

export interface BreadcrumbItem {
  label: string;
  href?: string; // omit for the current (last) page
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** dark = white text on navy bg, light = navy text on cream bg */
  variant?: 'dark' | 'light';
}

export default function Breadcrumb({ items, variant = 'light' }: BreadcrumbProps) {
  const isDark = variant === 'dark';

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`breadcrumb ${isDark ? 'breadcrumb-dark' : 'breadcrumb-light'}`}
      >
        <ol className="breadcrumb-list">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={i} className="breadcrumb-item">
                {!isLast && item.href ? (
                  <a href={item.href} className="breadcrumb-link">
                    {item.label}
                  </a>
                ) : (
                  <span className="breadcrumb-current" aria-current="page">
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <span className="breadcrumb-sep" aria-hidden="true">
                    ›
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
