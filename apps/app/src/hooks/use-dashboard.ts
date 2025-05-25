import { useMemo } from 'react';
import { extractDomain } from '@/lib/dashboard-utils';
import type { Web, ProcessingActivity } from '@/types/dashboard';

interface UseDashboardProps {
  webs?: Web[];
  searchQuery: string;
  activities: ProcessingActivity[];
}

export function useDashboard({ webs = [], searchQuery, activities }: UseDashboardProps) {
  // Filter webs based on search query
  const filteredWebs = useMemo(() => {
    if (!searchQuery) return webs;
    const query = searchQuery.toLowerCase();
    return webs.filter(web => {
      return (
        web.title?.toLowerCase().includes(query) ||
        web.url.toLowerCase().includes(query) ||
        web.prompt?.toLowerCase().includes(query) ||
        extractDomain(web.url).toLowerCase().includes(query)
      );
    });
  }, [webs, searchQuery]);

  // Group webs by domain for context
  const websByDomain = useMemo(() => {
    return webs.reduce((acc, web) => {
      const domain = extractDomain(web.url);
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(web);
      return acc;
    }, {} as Record<string, Web[]>);
  }, [webs]);

  // Get recent activity for context tile
  const recentWebs = useMemo(() => webs.slice(0, 5), [webs]);

  // Get top domains
  const topDomains = useMemo(() => {
    return Object.entries(websByDomain)
      .sort(([, a], [, b]) => (b?.length || 0) - (a?.length || 0))
      .slice(0, 3)
      .map(([domain, domainWebs]) => [domain, domainWebs?.length || 0] as [string, number]);
  }, [websByDomain]);

  // Count processing activities
  const processingCount = useMemo(() => {
    return activities.filter(a => a.type === 'processing').length;
  }, [activities]);

  return {
    filteredWebs,
    websByDomain,
    recentWebs,
    topDomains,
    processingCount,
  };
} 