'use client';

import { useTransitionRouter } from 'next-view-transitions';
import { UserMenu } from './user-menu';
import { WebsAsciiLogo } from './webs-ascii';

interface HeaderProps {
    showStatus?: boolean;
    children?: React.ReactNode;
}

export function Header({ showStatus = true, children }: HeaderProps) {
    const router = useTransitionRouter();

    const handleLogoClick = () => {
        router.push('/');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="h-14 px-2 flex items-center justify-between">
                <div className="flex items-center">
                    <WebsAsciiLogo
                        size="small"
                        onClick={handleLogoClick}
                        className="scale-75"
                    />
                </div>

                {children && (
                    <div className="flex-1 flex justify-center">
                        {children}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <UserMenu />
                </div>
            </div>
        </header>
    );
} 