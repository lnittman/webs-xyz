import { Metadata } from "next";

import { auth, currentUser } from '@repo/auth/server';
import { secure } from '@repo/security';
import { NotificationsProvider } from '@repo/notifications/components/provider';

import { env } from '../../../env';
import { ClientLayout } from '@/components/shared/layout/client-layout';
import { PostHogIdentifier } from '@/components/shared/posthog-identifier';

export const metadata: Metadata = {
  title: "webs"
};

import type { ReactNode } from 'react';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

// Font initialization script that runs before React hydration
const fontInitScript = `
  (function() {
    const savedFont = localStorage.getItem('preferred-font');
    if (savedFont) {
      const fontClasses = {
        'iosevka-term': 'font-iosevka-term',
        'geist-mono': 'font-geist-mono',
        'jetbrains-mono': 'font-jetbrains-mono',
        'fira-code': 'font-fira-code',
        'commit-mono': 'font-commit-mono',
        'departure-mono': 'font-departure-mono',
        'fragment-mono': 'font-fragment-mono',
        'server-mono': 'font-server-mono',
        'sfmono-square': 'font-sfmono-square',
        'tx02-mono': 'font-tx02-mono'
      };
      const className = fontClasses[savedFont];
      if (className) {
        document.documentElement.classList.add(className);
      }
    }
  })();
`;

const AppLayout = async ({ children }: AppLayoutProperties) => {
  if (env.ARCJET_KEY) {
    await secure(['CATEGORY:PREVIEW']);
  }

  const user = await currentUser();
  const { redirectToSignIn } = await auth();

  if (!user) {
    return redirectToSignIn();
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: fontInitScript }} />
      <NotificationsProvider userId={user.id}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <PostHogIdentifier />
      </NotificationsProvider>
    </>
  );
};

export default AppLayout;
