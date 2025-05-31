'use client';

import { useEffect, useState, Suspense } from 'react';
import { NotificationsMenu } from './notifications-menu';
import { ensureWelcomeNotification } from '@/app/actions/notifications';
import { Skeleton } from '@repo/design/components/ui/skeleton';

interface NotificationsWrapperProps {
    onNavigate?: (path: string) => void;
}

// Skeleton component for the notifications button
function NotificationsSkeleton() {
    return (
        <div className="h-8 w-8 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );
}

// Main notifications content component
function NotificationsContent({ onNavigate }: NotificationsWrapperProps) {
    const [hasCheckedWelcome, setHasCheckedWelcome] = useState(false);

    // Check if user has no notifications and send welcome notification
    useEffect(() => {
        if (hasCheckedWelcome) return;

        // Check if we've already checked this session
        const sessionKey = 'webs-welcome-checked';
        if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
            setHasCheckedWelcome(true);
            return;
        }

        const checkAndSendWelcome = async () => {
            console.log('Checking welcome notification...');
            try {
                const result = await ensureWelcomeNotification();
                console.log('Welcome notification result:', result);

                if ('success' in result && result.success) {
                    console.log('Welcome notification processed:', result.message);
                } else if ('error' in result) {
                    console.error('Failed to process welcome notification:', result.error);
                }
            } catch (error) {
                console.error('Failed to check/send welcome notification:', error);
            } finally {
                setHasCheckedWelcome(true);
                // Mark as checked for this session
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(sessionKey, 'true');
                }
            }
        };

        // Delay the check to ensure the user is properly authenticated
        const timer = setTimeout(checkAndSendWelcome, 2000);

        return () => clearTimeout(timer);
    }, [hasCheckedWelcome]);

    return <NotificationsMenu onNavigate={onNavigate} />;
}

// Main exported component with Suspense wrapper
export function NotificationsWrapper({ onNavigate }: NotificationsWrapperProps) {
    return (
        <Suspense fallback={<NotificationsSkeleton />}>
            <NotificationsContent onNavigate={onNavigate} />
        </Suspense>
    );
} 