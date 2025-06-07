"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lightning,
    Check,
    X,
    Clock,
    Info,
    Warning,
    CheckCircle,
    XCircle,
    Archive,
    Gear,
    ChatCircle,
    Tray,
    TrashSimple
} from "@phosphor-icons/react/dist/ssr";
import {
    useKnockClient,
    useNotifications,
    useNotificationStore,
} from "@repo/notifications/client";
import ReactMarkdown from 'react-markdown';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/design/components/ui/dropdown-menu";
import { cn } from "@repo/design/lib/utils";

// Import keys from notifications package
import { keys } from '@repo/notifications/keys';

type TabType = 'inbox' | 'archive' | 'comments';

interface NotificationsMenuProps {
    onNavigate?: (path: string) => void;
}

export function NotificationsMenu({ onNavigate }: NotificationsMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('inbox');
    const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);

    // Knock hooks
    const knockClient = useKnockClient();
    const feedChannelId = keys().NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

    const feed = feedChannelId ? useNotifications(knockClient, feedChannelId, {
        archived: activeTab === 'archive' ? 'include' : 'exclude'
    }) : null;

    const { items, metadata } = useNotificationStore(feed || {} as any);

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Unread count from Knock
    const unreadCount = metadata?.unread_count || 0;

    // Close menu when resizing to mobile to prevent UI issues
    useEffect(() => {
        const handleResize = () => {
            if (menuOpen && window.innerWidth < 768) { // Close on mobile breakpoint
                setMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [menuOpen]);

    const markAsRead = async (item: any) => {
        if (!feed) return;
        try {
            await feed.markAsRead(item);
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const archiveNotification = async (item: any, e: React.MouseEvent) => {
        if (!feed) return;
        e.stopPropagation();
        try {
            await feed.markAsArchived(item);
        } catch (err) {
            console.error('Failed to archive:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!feed) return;
        try {
            await feed.markAllAsRead();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const deleteAllArchived = async () => {
        if (!feed) return;
        try {
            // Get all archived notifications and delete them
            const archivedNotifications = items?.filter((item: any) => item.archived_at) || [];
            for (const notification of archivedNotifications) {
                // Use the correct Knock method for deleting notifications
                await feed.markAsInteracted(notification);
            }
        } catch (err) {
            console.error('Failed to delete archived notifications:', err);
        }
    };

    const handleSettingsClick = () => {
        setMenuOpen(false);
        if (onNavigate) {
            onNavigate('/settings?tab=notifications');
        }
    };

    const handleActionClick = async (action: any, e: React.MouseEvent) => {
        e.stopPropagation();

        // Handle different action types
        if (action.url) {
            // Navigate to URL
            if (action.url.startsWith('/')) {
                if (onNavigate) {
                    onNavigate(action.url);
                }
                setMenuOpen(false);
            } else {
                window.open(action.url, '_blank');
            }
        } else if (action.method && action.endpoint) {
            // API call action
            try {
                await fetch(action.endpoint, {
                    method: action.method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: action.payload ? JSON.stringify(action.payload) : undefined,
                });
            } catch (error) {
                console.error('Action failed:', error);
            }
        }
    };

    const getNotificationIcon = (categories: string[]) => {
        if (categories.includes('success')) {
            return <CheckCircle className="w-4 h-4 text-green-500" weight="duotone" />;
        } else if (categories.includes('warning')) {
            return <Warning className="w-4 h-4 text-yellow-500" weight="duotone" />;
        } else if (categories.includes('error')) {
            return <XCircle className="w-4 h-4 text-red-500" weight="duotone" />;
        } else {
            return <Info className="w-4 h-4 text-blue-500" weight="duotone" />;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const getFilteredNotifications = () => {
        if (!items) return [];

        switch (activeTab) {
            case 'inbox':
                return items.filter((item: any) => !item.archived_at);
            case 'archive':
                return items.filter((item: any) => item.archived_at);
            case 'comments':
                return []; // Disabled for now
            default:
                return items.filter((item: any) => !item.archived_at);
        }
    };

    const filteredNotifications = getFilteredNotifications();

    // Fetch notifications when tab changes
    useEffect(() => {
        if (!feedChannelId || !feed) return;

        const fetchNotifications = async () => {
            setLoading(true);
            setError(null);
            try {
                await feed.fetch();
            } catch (err) {
                setError('Failed to load notifications');
                console.error('Failed to fetch notifications:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [activeTab, feed, feedChannelId]);

    // Don't render if no feed channel ID is configured
    if (!feedChannelId) {
        return null;
    }

    return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "relative h-8 w-8 bg-transparent text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200",
                        "hover:bg-accent hover:text-foreground hover:border-foreground/20",
                        "focus:outline-none",
                        menuOpen ? "bg-accent/80 text-foreground border-foreground/30" : ""
                    )}
                    aria-label="Notifications"
                >
                    <Lightning className="w-4 h-4" weight="duotone" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeOut",
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                }}
                                className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className="p-0 bg-popover border-border/50 rounded-lg font-mono overflow-hidden z-[90]"
                style={{ width: '384px', minWidth: '384px', height: '720px', minHeight: '720px' }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        mass: 0.8
                    }}
                    className="h-full flex flex-col"
                >
                    {/* Header with tabs and settings */}
                    <div className="px-3 py-2 border-b border-border flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setActiveTab('inbox')}
                                    className={cn(
                                        "px-2 py-1 text-xs rounded transition-all duration-200",
                                        activeTab === 'inbox'
                                            ? "bg-accent text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Inbox
                                </button>
                                <button
                                    onClick={() => setActiveTab('archive')}
                                    className={cn(
                                        "px-2 py-1 text-xs rounded transition-all duration-200",
                                        activeTab === 'archive'
                                            ? "bg-accent text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Archive
                                </button>
                                <button
                                    onClick={() => setActiveTab('comments')}
                                    disabled
                                    className={cn(
                                        "px-2 py-1 text-xs rounded transition-all duration-200 opacity-50 cursor-not-allowed",
                                        "text-muted-foreground"
                                    )}
                                >
                                    Comments
                                </button>
                            </div>
                            <button
                                onClick={handleSettingsClick}
                                className="p-1 text-muted-foreground hover:text-foreground transition-all duration-200 rounded"
                                title="Notification settings"
                            >
                                <Gear className="w-4 h-4" weight="duotone" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications list */}
                    <div className="flex-1 flex flex-col relative min-h-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 flex flex-col"
                            >
                                {loading ? (
                                    <div className="flex-1 flex flex-col items-center justify-center px-3 py-8">
                                        <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center mb-4">
                                            <ChatCircle className="w-8 h-8 text-muted-foreground/60 animate-pulse" weight="duotone" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">Loading notifications...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex-1 flex flex-col items-center justify-center px-3 py-8">
                                        <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center mb-4">
                                            <Warning className="w-8 h-8 text-red-500/60" weight="duotone" />
                                        </div>
                                        <p className="text-sm text-red-500">{error}</p>
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center px-3 py-8">
                                        {activeTab === 'inbox' ? (
                                            <>
                                                <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center mb-4">
                                                    <Tray className="w-8 h-8 text-muted-foreground/60" weight="duotone" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">No new notifications</p>
                                            </>
                                        ) : activeTab === 'archive' ? (
                                            <>
                                                <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center mb-4">
                                                    <TrashSimple className="w-8 h-8 text-muted-foreground/60" weight="duotone" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">No archived notifications</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center mb-4">
                                                    <ChatCircle className="w-8 h-8 text-muted-foreground/60" weight="duotone" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">Comments coming soon</p>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto">
                                        {filteredNotifications.map((notification: any, index: number) => (
                                            <div key={notification.id}>
                                                <div
                                                    className={cn(
                                                        "px-3 py-3 hover:bg-accent/50 cursor-pointer transition-all duration-200 relative",
                                                        !notification.read_at && "bg-accent/20"
                                                    )}
                                                    onClick={() => markAsRead(notification)}
                                                    onMouseEnter={() => setHoveredNotification(notification.id)}
                                                    onMouseLeave={() => setHoveredNotification(null)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {getNotificationIcon(notification.data?.categories || [])}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 relative pr-8">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {notification.data?.title || 'Notification'}
                                                                </p>
                                                                {!notification.read_at && (
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 transition-all duration-200" />
                                                                )}
                                                                {/* Archive button - absolutely positioned */}
                                                                {activeTab === 'inbox' && (
                                                                    <motion.button
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{
                                                                            opacity: hoveredNotification === notification.id ? 1 : 0
                                                                        }}
                                                                        transition={{ duration: 0.2 }}
                                                                        onClick={(e) => archiveNotification(notification, e)}
                                                                        className={cn(
                                                                            "absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-all duration-200 rounded",
                                                                            hoveredNotification !== notification.id && "pointer-events-none"
                                                                        )}
                                                                        title="Archive notification"
                                                                    >
                                                                        <Archive className="w-4 h-4" weight="duotone" />
                                                                    </motion.button>
                                                                )}
                                                            </div>
                                                            {notification.data?.body && (
                                                                <div className="text-xs text-muted-foreground mt-0.5 prose prose-xs prose-invert max-w-none">
                                                                    <ReactMarkdown
                                                                        components={{
                                                                            a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
                                                                                <a
                                                                                    href={href}
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        if (href?.startsWith('/')) {
                                                                                            if (onNavigate) {
                                                                                                onNavigate(href);
                                                                                            }
                                                                                            setMenuOpen(false);
                                                                                        } else {
                                                                                            window.open(href, '_blank');
                                                                                        }
                                                                                    }}
                                                                                    className="text-blue-500 hover:text-blue-400 underline transition-colors duration-200"
                                                                                >
                                                                                    {children}
                                                                                </a>
                                                                            ),
                                                                        }}
                                                                    >
                                                                        {notification.data.body}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            )}
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {formatTimestamp(notification.inserted_at)}
                                                            </p>
                                                            {/* Action buttons */}
                                                            {notification.data?.actions && notification.data.actions.length > 0 && (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    {notification.data.actions.map((action: any, actionIndex: number) => (
                                                                        <button
                                                                            key={actionIndex}
                                                                            onClick={(e) => handleActionClick(action, e)}
                                                                            className={cn(
                                                                                "px-2 py-1 text-xs rounded transition-all duration-200",
                                                                                action.primary
                                                                                    ? "bg-foreground text-background hover:bg-foreground/90"
                                                                                    : "bg-accent text-foreground hover:bg-accent/80"
                                                                            )}
                                                                        >
                                                                            {action.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {index < filteredNotifications.length - 1 && <DropdownMenuSeparator className="my-0" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer - show for inbox and archive tabs */}
                    {(activeTab === 'inbox' || activeTab === 'archive') && (
                        <div className="border-t border-border bg-muted/20 flex-shrink-0">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'inbox' ? (
                                        <button
                                            onClick={markAllAsRead}
                                            disabled={unreadCount === 0}
                                            className={cn(
                                                "w-full text-sm transition-all duration-200 py-3 px-3 text-center",
                                                unreadCount > 0
                                                    ? "text-muted-foreground hover:text-foreground"
                                                    : "text-muted-foreground/50 cursor-not-allowed"
                                            )}
                                        >
                                            {unreadCount > 0 ? 'Mark all as read' : 'All caught up'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={deleteAllArchived}
                                            disabled={filteredNotifications.length === 0}
                                            className={cn(
                                                "w-full text-sm transition-all duration-200 py-3 px-3 text-center",
                                                filteredNotifications.length > 0
                                                    ? "text-red-600 hover:text-red-500"
                                                    : "text-muted-foreground/50 cursor-not-allowed"
                                            )}
                                        >
                                            {filteredNotifications.length > 0 ? 'Delete all' : 'Nothing to delete'}
                                        </button>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 