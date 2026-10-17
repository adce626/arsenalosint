import type { MetadataRoute } from 'next';
import { LESSONS } from '@/content/basics/index.js';
import { PLAYBOOKS } from '@/content/playbooks/index.js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5173';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/playbooks`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/glossary`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/reference`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/mapping`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const lessons: MetadataRoute.Sitemap = LESSONS.map((lesson) => ({
    url: `${SITE_URL}/guides/${lesson.id}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const playbooks: MetadataRoute.Sitemap = PLAYBOOKS.map((playbook) => ({
    url: `${SITE_URL}/playbooks/${playbook.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...routes, ...lessons, ...playbooks];
}
