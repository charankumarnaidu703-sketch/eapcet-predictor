import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Hardcoded: sitemaps must always use the production URL, not env vars
// (NEXT_PUBLIC_SITE_URL is "http://localhost:3000" in .env and gets baked into the build)
const SITE_URL = 'https://ranksure.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/tools/counselling`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tools/scholarships`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tools/reimbursement`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic college pages — fetch unique college names
  let collegePages: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabase
      .from('eapcet_cutoffs')
      .select('college_name');

    if (data) {
      const uniqueNames = Array.from(new Set(data.map(d => d.college_name)));
      collegePages = uniqueNames.flatMap(name => [
        {
          url: `${SITE_URL}/college/${encodeURIComponent(name)}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        },
        {
          url: `${SITE_URL}/college/${encodeURIComponent(name)}/cutoff`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        },
      ]);
    }
  } catch (e) {
    console.error('Sitemap: failed to fetch college names', e);
  }

  // Scholarship detail pages
  const { SCHOLARSHIP_SCHEMES } = await import('@/lib/scholarshipRules');
  const scholarshipPages: MetadataRoute.Sitemap = SCHOLARSHIP_SCHEMES.map(scheme => ({
    url: `${SITE_URL}/tools/scholarships/${scheme.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Blog pages
  const blogPosts = await import('@/data/blog-posts.json');
  const blogListPage: MetadataRoute.Sitemap = [{
    url: `${SITE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }];
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.default.map((post: { slug: string; updated: string }) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...collegePages, ...scholarshipPages, ...blogListPage, ...blogPostPages];
}
