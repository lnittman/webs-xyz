'use client';

import { usePathname } from 'next/navigation';
import { Link } from 'next-view-transitions';
import { useTransitionRouter } from 'next-view-transitions';
import { UserMenu } from './user-menu';
import { NotificationsWrapper } from './notifications-wrapper';
import { DocsMenu } from './docs-menu';
import { FeedbackMenu } from './feedback-menu';
import { WebsAsciiLogo } from './webs-ascii';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@repo/design/components/ui/breadcrumb';
import React from 'react';

interface NavigationProps {
    webTitle?: string;
    webId?: string;
}

export function Navigation({ webTitle, webId }: NavigationProps) {
    const pathname = usePathname();
    const router = useTransitionRouter();

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    // Generate breadcrumb items based on current path
    const getBreadcrumbItems = () => {
        const items = [];

        // Always start with home
        items.push({
            label: 'Dashboard',
            href: '/',
            isActive: pathname === '/'
        });

        // If we're on a web detail page
        if (webId) {
            items.push({
                label: webTitle || `Web ${webId}`,
                href: `/w/${webId}`,
                isActive: true
            });
        }

        return items;
    };

    const breadcrumbItems = getBreadcrumbItems();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4">
                {/* Left side - Logo and Breadcrumbs */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <WebsAsciiLogo size="small" className="scale-75" />
                    </Link>

                    {breadcrumbItems.length > 1 && (
                        <>
                            <span className="text-muted-foreground text-sm">/</span>
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {breadcrumbItems.map((item, index) => (
                                        <React.Fragment key={item.href}>
                                            <BreadcrumbItem>
                                                {index === breadcrumbItems.length - 1 ? (
                                                    <BreadcrumbPage className="text-foreground font-medium">
                                                        {item.label}
                                                    </BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink asChild>
                                                        <Link
                                                            href={item.href}
                                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            {item.label}
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
                        </>
                    )}
                </div>

                {/* Right side - Feedback and User menu */}
                <div className="flex items-center gap-2">
                    <FeedbackMenu className="h-8" />
                    <DocsMenu />
                    <NotificationsWrapper onNavigate={handleNavigate} />
                    <UserMenu />
                </div>
            </div>
        </nav>
    );
} 