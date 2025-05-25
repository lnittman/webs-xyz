import { ActivityFeed } from './activity-feed';
import { RecentWebsPanel } from './recent-webs-panel';
import { TopDomainsPanel } from './top-domains-panel';
import { SystemInfoPanel } from './system-info-panel';
import type { ProcessingActivity, Web } from '@/types/dashboard';

interface ContextSidebarProps {
    activities: ProcessingActivity[];
    recentWebs: Web[];
    topDomains: Array<[string, number]>;
    selectedModelId: string;
}

export function ContextSidebar({
    activities,
    recentWebs,
    topDomains,
    selectedModelId
}: ContextSidebarProps) {
    return (
        <div className="col-span-4 space-y-6">
            <ActivityFeed activities={activities} />
            <RecentWebsPanel webs={recentWebs} />
            <TopDomainsPanel domains={topDomains} />
            <SystemInfoPanel workspaceId="default" selectedModelId={selectedModelId} />
        </div>
    );
} 