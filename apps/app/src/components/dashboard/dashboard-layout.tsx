import { WebsGrid } from './webs-grid';
import { ContextSidebar } from './context-sidebar';
import { CollapsiblePreviewSection } from './collapsible-preview-section';
import type { ProcessingActivity, Web } from '@/types/dashboard';

interface DashboardLayoutProps {
    webs: Web[];
    searchQuery: string;
    onClearSearch: () => void;
    activities: ProcessingActivity[];
    recentWebs: Web[];
    topDomains: Array<[string, number]>;
    selectedModelId: string;
}

export function DashboardLayout({
    webs,
    searchQuery,
    onClearSearch,
    activities,
    recentWebs,
    topDomains,
    selectedModelId
}: DashboardLayoutProps) {
    return (
        <div className="flex-1">
            {/* Collapsible section for non-wide layouts - COMMENTED OUT */}
            {/* <div className="block 2xl:hidden">
                <CollapsiblePreviewSection
                    activities={activities}
                    recentWebs={recentWebs}
                    topDomains={topDomains}
                    selectedModelId={selectedModelId}
                />
            </div> */}

            <div>
                {/* Wide layout (1400px+) - 3 column with context sidebar */}
                <div className="hidden 2xl:block">
                    <div className="w-full flex justify-center">
                        <div className="w-full max-w-3xl px-6">
                            <WebsGrid
                                webs={webs}
                                searchQuery={searchQuery}
                                onClearSearch={onClearSearch}
                                layout="wide"
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop layout (768px - 1399px) - Centered grid */}
                <div className="hidden md:block 2xl:hidden">
                    <div className="w-full flex justify-center">
                        <div className="w-full max-w-3xl px-6">
                            <WebsGrid
                                webs={webs}
                                searchQuery={searchQuery}
                                onClearSearch={onClearSearch}
                                layout="desktop"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile layout (< 768px) - List view */}
                <div className="block md:hidden">
                    <div className="w-full flex justify-center">
                        <div className="w-full max-w-3xl px-6">
                            <WebsGrid
                                webs={webs}
                                searchQuery={searchQuery}
                                onClearSearch={onClearSearch}
                                layout="mobile"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 