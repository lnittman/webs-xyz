'use client';

import React, { useEffect } from 'react';
import { useTransitionRouter } from 'next-view-transitions';
import { AccountOverviewNavigation } from '@/components/account/account-overview-navigation';

export default function AccountPage() {
    const router = useTransitionRouter();

    useEffect(() => {
        // On desktop (640px+), redirect to spaces tab
        const handleResize = () => {
            if (window.innerWidth >= 640) {
                router.replace('/account/spaces');
            }
        };

        // Check on mount
        handleResize();

        // Listen for resize events
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [router]);

    return (
        <>
            {/* Mobile only: Show navigation menu */}
            <div className="block sm:hidden">
                <AccountOverviewNavigation />
            </div>
        </>
    );
} 