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
} from "@knocklabs/react";
import ReactMarkdown from 'react-markdown';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@repo/design/components/ui/sheet";
import { cn } from "@repo/design/lib/utils";
import { keys } from '../keys';

type TabType = 'inbox' | 'archive' | 'comments';

interface MobileNotificationsSheetProps {
    onNavigate?: (path: string) => void;
}

export function MobileNotificationsSheet({ onNavigate }: MobileNotificationsSheetProps) {
    const [isOpen, setIsOpen] = useState(false);
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
            const archivedNotifications = items?.filter((item: any) => item.archived_at) || [];
            for (const notification of archivedNotifications) {
                await feed.markAsInteracted(notification);
            }
        } catch (err) {
            console.error('Failed to delete archived notifications:', err);
        }
    };

    const handleSettingsClick = () => {
        setIsOpen(false);
        if (onNavigate) {
            onNavigate('/settings?tab=notifications');
        }
    };

    const handleActionClick = async (action: any, e: React.MouseEvent) => {
        e.stopPropagation();

        if (action.url) {
            if (action.url.startsWith('/')) {
                if (onNavigate) {
                    onNavigate(action.url);
                }
                setIsOpen(false);
            } else {
                window.open(action.url, '_blank');
            }
        } else if (action.method && action.endpoint) {
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
                return [];
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
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button
                    className={cn(
                        "relative h-8 w-8 bg-transparent text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200",
                        "hover:bg-accent hover:text-foreground hover:border-foreground/20",
                        "focus:outline-none",
                        isOpen ? "bg-accent/80 text-foreground border-foreground/30" : ""
                    )}
                    aria-label="Notifications"
                >
                    <Lightning className="w-4 h-4" weight="duotone" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium transition-all duration-200">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </SheetTrigger>

            <SheetContent
                side="bottom"
                className="p-0 bg-popover border-border/50 rounded-t-lg font-mono overflow-hidden h-[60vh]"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        mass: 0.8
                    }}
                    className="h-full flex flex-col"
                >
                    {/* Header with tabs and settings */}
                    <div className="px-6 py-4 border-b border-border flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setActiveTab('inbox')}
                                    className={cn(
                                        "px-3 py-1.5 text-sm rounded transition-all duration-200",
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
                                        "px-3 py-1.5 text-sm rounded transition-all duration-200",
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
                                        "px-3 py-1.5 text-sm rounded transition-all duration-200 opacity-50 cursor-not-allowed",
                                        "text-muted-foreground"
                                    )}
                                >
                                    Comments
                                </button>
                            </div>
                            <button
                                onClick={handleSettingsClick}
                                className="h-8 w-8 bg-muted/50 text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
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
                                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                                        <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mb-6">
                                            <Lightning className="w-10 h-10 text-muted-foreground/50 animate-pulse" weight="duotone" />
                                        </div>
                                        <h3 className="text-lg font-medium text-foreground mb-2">Loading notifications...</h3>
                                        <p className="text-sm text-muted-foreground text-center">
                                            Please wait while we fetch your latest updates.
                                        </p>
                                    </div>
                                ) : error ? (
                                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                                        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                                            <Warning className="w-10 h-10 text-red-500/60" weight="duotone" />
                                        </div>
                                        <h3 className="text-lg font-medium text-foreground mb-2">Something went wrong</h3>
                                        <p className="text-sm text-red-500 text-center max-w-xs mb-4">{error}</p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                                        {activeTab === 'inbox' ? (
                                            <>
                                                <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mb-6">
                                                    <Tray className="w-10 h-10 text-muted-foreground/50" weight="duotone" />
                                                </div>
                                                <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                                                <p className="text-sm text-muted-foreground text-center max-w-xs">
                                                    You're all set. New notifications will appear here when they arrive.
                                                </p>
                                            </>
                                        ) : activeTab === 'archive' ? (
                                            <>
                                                <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mb-6">
                                                    <Archive className="w-10 h-10 text-muted-foreground/50" weight="duotone" />
                                                </div>
                                                <h3 className="text-lg font-medium text-foreground mb-2">No archived notifications</h3>
                                                <p className="text-sm text-muted-foreground text-center max-w-xs">
                                                    Notifications you archive will be stored here for later reference.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mb-6">
                                                    <ChatCircle className="w-10 h-10 text-muted-foreground/50" weight="duotone" />
                                                </div>
                                                <h3 className="text-lg font-medium text-foreground mb-2">Comments coming soon</h3>
                                                <p className="text-sm text-muted-foreground text-center max-w-xs">
                                                    Stay tuned for comment notifications and discussions.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto">
                                        {filteredNotifications.map((notification: any, index: number) => (
                                            <div key={notification.id}>
                                                <div
                                                    className={cn(
                                                        "px-6 py-4 hover:bg-accent/50 cursor-pointer transition-all duration-200 relative",
                                                        !notification.read_at && "bg-accent/20"
                                                    )}
                                                    onClick={() => markAsRead(notification)}
                                                    onMouseEnter={() => setHoveredNotification(notification.id)}
                                                    onMouseLeave={() => setHoveredNotification(null)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {getNotificationIcon(notification.data?.categories || [])}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {notification.data?.title || 'Notification'}
                                                                </p>
                                                                {!notification.read_at && (
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 transition-all duration-200" />
                                                                )}
                                                            </div>
                                                            {notification.data?.body && (
                                                                <div className="text-xs text-muted-foreground mt-1 prose prose-xs prose-invert max-w-none">
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
                                                                                            setIsOpen(false);
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
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                {formatTimestamp(notification.inserted_at)}
                                                            </p>
                                                            {/* Action buttons */}
                                                            {notification.data?.actions && notification.data.actions.length > 0 && (
                                                                <div className="flex items-center gap-2 mt-3">
                                                                    {notification.data.actions.map((action: any, actionIndex: number) => (
                                                                        <button
                                                                            key={actionIndex}
                                                                            onClick={(e) => handleActionClick(action, e)}
                                                                            className={cn(
                                                                                "px-3 py-1.5 text-xs rounded transition-all duration-200",
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
                                                    {/* Archive button */}
                                                    {activeTab === 'inbox' && (
                                                        <motion.button
                                                            initial={{ opacity: 0 }}
                                                            animate={{
                                                                opacity: hoveredNotification === notification.id ? 1 : 0
                                                            }}
                                                            transition={{ duration: 0.2 }}
                                                            onClick={(e) => archiveNotification(notification, e)}
                                                            className={cn(
                                                                "absolute right-6 top-4 h-8 w-8 bg-muted/50 text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200 hover:bg-muted/80 hover:text-foreground",
                                                                hoveredNotification !== notification.id && "pointer-events-none"
                                                            )}
                                                            title="Archive notification"
                                                        >
                                                            <Archive className="w-4 h-4" weight="duotone" />
                                                        </motion.button>
                                                    )}
                                                </div>
                                                {index < filteredNotifications.length - 1 && (
                                                    <div className="border-b border-border mx-6" />
                                                )}
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
                                                "w-full text-sm transition-all duration-200 py-4 px-6 text-center",
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
                                                "w-full text-sm transition-all duration-200 py-4 px-6 text-center",
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
            </SheetContent>
        </Sheet>
    );
} 