'use client';

import React, { useState, useMemo } from 'react';
import { ViewTransitions } from 'next-view-transitions';
import { MagnifyingGlass, FunnelSimple, CalendarBlank, Tag, Globe, Folder } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';
import { AccountActivity } from './account-activity';

interface FilterOption {
    id: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
}

export function AccountActivityLayout() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedSpace, setSelectedSpace] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('all');

    // Mock filter options - in real app these would come from API/hooks
    const activityTypes: FilterOption[] = [
        { id: 'all', label: 'All Activity', count: 42 },
        { id: 'web_added', label: 'Web Added', icon: <Globe className="w-3 h-3" weight="duotone" />, count: 18 },
        { id: 'web_completed', label: 'Web Completed', icon: <Globe className="w-3 h-3" weight="duotone" />, count: 15 },
        { id: 'space_created', label: 'Space Created', icon: <Folder className="w-3 h-3" weight="duotone" />, count: 3 },
        { id: 'space_updated', label: 'Space Updated', icon: <Folder className="w-3 h-3" weight="duotone" />, count: 6 },
    ];

    const spaces: FilterOption[] = [
        { id: 'all', label: 'All Spaces', count: 42 },
        { id: '1', label: 'Personal', icon: <span className="text-xs">🏠</span>, count: 25 },
        { id: '2', label: 'Work Projects', icon: <span className="text-xs">💼</span>, count: 12 },
        { id: '3', label: 'Research', icon: <span className="text-xs">📚</span>, count: 5 },
    ];

    const dateRanges: FilterOption[] = [
        { id: 'all', label: 'All Time' },
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'Past Week' },
        { id: 'month', label: 'Past Month' },
        { id: 'quarter', label: 'Past 3 Months' },
    ];

    return (
        <ViewTransitions>
            <div className="relative flex min-h-[calc(100vh-104px)]">
                {/* Filters Sidebar */}
                <div className="sticky top-[104px] left-0 h-[calc(100vh-104px)] w-72 border-r border-border bg-background/50 backdrop-blur-xl">
                    <div className="flex h-full flex-col">
                        {/* Header */}
                        <div className="px-3 py-4 border-b border-border bg-muted/20">
                            <div className="flex items-center gap-2 mb-3">
                                <FunnelSimple className="w-4 h-4 text-muted-foreground" weight="duotone" />
                                <h3 className="text-sm font-medium font-mono">Activity Filters</h3>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <MagnifyingGlass className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" weight="duotone" />
                                <input
                                    type="text"
                                    placeholder="Search activity..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-8 pl-7 pr-2 text-xs bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30"
                                />
                            </div>
                        </div>

                        {/* Filters Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Activity Type Filter */}
                            <div className="p-3 border-b border-border/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag className="w-3 h-3 text-muted-foreground" weight="duotone" />
                                    <span className="text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">Activity Type</span>
                                </div>
                                <div className="space-y-1">
                                    {activityTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors rounded-md",
                                                selectedType === type.id
                                                    ? "bg-accent text-foreground"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                {type.icon}
                                                <span className="truncate">{type.label}</span>
                                            </div>
                                            {type.count && (
                                                <span className="text-xs text-muted-foreground">
                                                    {type.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Space Filter */}
                            <div className="p-3 border-b border-border/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Folder className="w-3 h-3 text-muted-foreground" weight="duotone" />
                                    <span className="text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">Space</span>
                                </div>
                                <div className="space-y-1">
                                    {spaces.map((space) => (
                                        <button
                                            key={space.id}
                                            onClick={() => setSelectedSpace(space.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors rounded-md",
                                                selectedSpace === space.id
                                                    ? "bg-accent text-foreground"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                {space.icon}
                                                <span className="truncate">{space.label}</span>
                                            </div>
                                            {space.count && (
                                                <span className="text-xs text-muted-foreground">
                                                    {space.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range Filter */}
                            <div className="p-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <CalendarBlank className="w-3 h-3 text-muted-foreground" weight="duotone" />
                                    <span className="text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">Date Range</span>
                                </div>
                                <div className="space-y-1">
                                    {dateRanges.map((range) => (
                                        <button
                                            key={range.id}
                                            onClick={() => setDateRange(range.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors rounded-md",
                                                dateRange === range.id
                                                    ? "bg-accent text-foreground"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                            )}
                                        >
                                            <span className="truncate">{range.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="p-3 border-t border-border">
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedType('all');
                                    setSelectedSpace('all');
                                    setDateRange('all');
                                }}
                                className="w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted transition-colors rounded-md"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <main className="p-8 max-w-4xl">
                        <AccountActivity
                            searchQuery={searchQuery}
                            selectedType={selectedType}
                            selectedSpace={selectedSpace}
                            dateRange={dateRange}
                        />
                    </main>
                </div>
            </div>
        </ViewTransitions>
    );
} 