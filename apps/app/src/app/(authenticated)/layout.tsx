import { Metadata } from "next";

import { auth, currentUser } from '@repo/auth/server';
import { SidebarProvider } from '@repo/design/components/ui/sidebar';
import { secure } from '@repo/security';

import { env } from '../../../env';

export const metadata: Metadata = {
  title: "webs"
};

import type { ReactNode } from 'react';
import { PostHogIdentifier } from '@/components/shared/posthog-identifier';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

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
    <SidebarProvider>
      {children}
      <PostHogIdentifier />
    </SidebarProvider>
  );
};

export default AppLayout;
