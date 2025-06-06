'use client';

import { usePathname } from 'next/navigation';
import { Link } from 'next-view-transitions';
import { useTransitionRouter } from 'next-view-transitions';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { UserMenu } from '../menu/user-menu';
import { NotificationsWrapper } from '../menu/notifications/notifications-wrapper';
import { DocsMenu } from '../menu/docs-menu';
import { FeedbackMenu } from '../menu/feedback-menu';
import { SpacesMenu } from '../menu/spaces-menu';
import { CreateSpaceModal } from '../modal/create-space-modal';
import { WebsAsciiLogo } from '../ascii/webs-ascii';
import { Skeleton } from '@repo/design/components/ui/skeleton';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@repo/design/components/ui/breadcrumb';
import { cn } from '@repo/design/lib/utils';
import React from 'react';
import { useWeb } from '@/hooks/web/queries';
import { useSpaces } from '@/hooks/spaces';
import { currentSpaceIdAtom, currentSpaceAtom } from '@/atoms/spaces';

interface NavigationProps {
    webTitle?: string;
    webId?: string;
}

export function Navigation({ webTitle, webId }: NavigationProps) {
    const pathname = usePathname();
    const router = useTransitionRouter();
    const [createSpaceModalOpen, setCreateSpaceModalOpen] = useState(false);

    // Space state management
    const [currentSpaceId, setCurrentSpaceId] = useAtom(currentSpaceIdAtom);
    const [currentSpace, setCurrentSpace] = useAtom(currentSpaceAtom);
    const { spaces, isLoading: spacesLoading } = useSpaces();

    // Extract webId from pathname if not provided via props
    const extractedWebId = pathname.match(/^\/w\/([^\/]+)/)?.[1];
    const currentWebId = webId || extractedWebId;

    // Get web data if we have a webId
    const { web } = useWeb(currentWebId || null);
    const displayWebTitle = webTitle || web?.title || (currentWebId ? `Web ${currentWebId}` : undefined);

    // Set current space from web or default space when spaces load
    useEffect(() => {
        if (web?.spaceId && web.spaceId !== currentSpaceId) {
            setCurrentSpaceId(web.spaceId);
        } else if (!currentSpaceId && spaces.length > 0) {
            // Set to default space if no current space
            const defaultSpace = spaces.find(s => s.isDefault) || spaces[0];
            if (defaultSpace) {
                setCurrentSpaceId(defaultSpace.id);
            }
        }
    }, [web?.spaceId, spaces, currentSpaceId, setCurrentSpaceId]);

    // Update current space object when spaces or currentSpaceId changes
    useEffect(() => {
        if (currentSpaceId && spaces.length > 0) {
            const space = spaces.find(s => s.id === currentSpaceId);
            if (space) {
                setCurrentSpace(space);
            }
        }
    }, [currentSpaceId, spaces, setCurrentSpace]);

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    const handleCreateSpace = () => {
        setCreateSpaceModalOpen(true);
    };

    // Provide current space to other components
    const getCurrentSpace = () => currentSpace;

    const handleLogoClick = () => {
        if (currentSpace) {
            const spaceUrlName = currentSpace.name.toLowerCase().replace(/\s+/g, '-');
            router.push(`/${spaceUrlName}`);
        } else {
            router.push('/');
        }
    };

    // Generate breadcrumb items based on current path
    const getBreadcrumbItems = () => {
        const items = [];

        // Always start with current space (or fallback to Dashboard)
        if (currentSpace) {
            const spaceUrlName = currentSpace.name.toLowerCase().replace(/\s+/g, '-');
            const isOnSpaceDashboard = pathname === `/${spaceUrlName}` || (pathname === '/' && currentSpace.isDefault);

            items.push({
                label: (
                    <div className="flex items-center gap-2">
                        {currentSpace.emoji && (
                            <span className="text-sm">{currentSpace.emoji}</span>
                        )}
                        <span>{currentSpace.name}</span>
                    </div>
                ),
                href: `/${spaceUrlName}`,
                isActive: isOnSpaceDashboard
            });
        } else {
            items.push({
                label: 'Dashboard',
                href: '/',
                isActive: pathname === '/'
            });
        }

        // If we're on a web detail page
        if (currentWebId) {
            items.push({
                label: displayWebTitle || `Web ${currentWebId}`,
                href: `/w/${currentWebId}`,
                isActive: true
            });
        }

        return items;
    };

    // Generate tab items based on current page
    const getTabItems = () => {
        // Check if we're on a web detail page (any route starting with /w/)
        if (pathname.startsWith('/w/') && currentWebId) {
            // Web detail page tabs
            const baseUrl = `/w/${currentWebId}`;
            return [
                { label: 'Dashboard', href: `${baseUrl}`, exact: true },
                { label: 'Insights', href: `${baseUrl}/insights` },
                { label: 'Chat', href: `${baseUrl}/chat` },
                { label: 'Messages', href: `${baseUrl}/messages` },
                { label: 'Raw Data', href: `${baseUrl}/raw` },
            ];
        }
        // Space page tabs
        const spaceUrlName = currentSpace?.name.toLowerCase().replace(/\s+/g, '-') || '';
        const baseUrl = `/${spaceUrlName}`;
        return [
            { label: 'Dashboard', href: `${baseUrl}`, exact: true },
            { label: 'Analytics', href: `${baseUrl}/analytics` },
            { label: 'Activity', href: `${baseUrl}/activity` },
            { label: 'Settings', href: `${baseUrl}/settings` },
        ];
    };

    const breadcrumbItems = getBreadcrumbItems();
    const tabItems = getTabItems();

    const isTabActive = (tab: { href: string; exact?: boolean }) => {
        if (tab.exact) {
            return pathname === tab.href;
        }
        return pathname.startsWith(tab.href);
    };

    // Show skeleton breadcrumbs while loading spaces
    const showBreadcrumbSkeleton = spacesLoading || (!currentSpace && spaces.length === 0);

    return (
        <>
            <nav className="z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {/* Top navigation bar */}
                <div className="flex h-14 items-center justify-between px-4">
                    {/* Left side - Logo and Breadcrumbs */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 -ml-2">
                            <WebsAsciiLogo
                                size="small"
                                className="scale-75 -translate-x-1 hover:opacity-80 transition-opacity"
                                onClick={handleLogoClick}
                            />
                        </div>

                        <>
                            <span className="text-muted-foreground text-sm flex-shrink-0 -ml-3">/</span>
                            {/* Breadcrumbs container with fade effect */}
                            <div className="relative min-w-0 flex-1 max-w-md">
                                <div className="overflow-hidden ml-1">
                                    {showBreadcrumbSkeleton ? (
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    ) : (
                                        <Breadcrumb>
                                            <BreadcrumbList>
                                                {breadcrumbItems.map((item, index) => (
                                                    <React.Fragment key={item.href}>
                                                        <BreadcrumbItem>
                                                            {item.isActive ? (
                                                                <BreadcrumbPage className="text-foreground font-medium flex items-center gap-2">
                                                                    {item.label}
                                                                    {/* Always show spaces menu for first breadcrumb, but non-functional on space overview */}
                                                                    {index === 0 && (
                                                                        <SpacesMenu
                                                                            currentSpaceId={web?.spaceId || currentSpace?.id || null}
                                                                            onNavigate={item.isActive ? undefined : handleNavigate}
                                                                            onCreateSpace={handleCreateSpace}
                                                                        />
                                                                    )}
                                                                </BreadcrumbPage>
                                                            ) : (
                                                                <BreadcrumbLink asChild>
                                                                    <Link
                                                                        href={item.href}
                                                                            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                                                                        >
                                                                            {item.label}
                                                                            {/* Always show spaces menu for first breadcrumb */}
                                                                            {index === 0 && (
                                                                                <SpacesMenu
                                                                                    currentSpaceId={web?.spaceId || currentSpace?.id || null}
                                                                                    onNavigate={handleNavigate}
                                                                                    onCreateSpace={handleCreateSpace}
                                                                                />
                                                                            )}
                                                                    </Link>
                                                                </BreadcrumbLink>
                                                            )}
                                                        </BreadcrumbItem>
                                                        {index < breadcrumbItems.length - 1 && (
                                                            <BreadcrumbSeparator>
                                                                <span className="text-muted-foreground">/</span>
                                                            </BreadcrumbSeparator>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                                </BreadcrumbList>
                                            </Breadcrumb>
                                    )}
                                </div>
                                {/* Fade gradient overlay */}
                                <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-background/95 to-transparent pointer-events-none" />
                            </div>
                        </>
                    </div>

                    {/* Right side - Feedback and User menu */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <FeedbackMenu className="h-8" />
                        <DocsMenu />
                        <NotificationsWrapper onNavigate={handleNavigate} />
                        <UserMenu />
                    </div>
                </div>

                {/* Tab navigation - clean style without borders/bg */}
                <div className="border-b">
                    <div className="flex items-center px-4">
                        <div className="flex items-center">
                            {tabItems.map((tab) => (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={cn(
                                        "px-3 py-2 text-sm font-medium transition-colors relative",
                                        isTabActive(tab)
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {tab.label}
                                    {isTabActive(tab) && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Modals */}
            <CreateSpaceModal
                open={createSpaceModalOpen}
                onOpenChange={setCreateSpaceModalOpen}
            />
        </>
    );
} 