import type { ReactNode } from 'react';
import { ViewTransitions } from 'next-view-transitions';

import { DesignSystemProvider } from '@repo/design';
import { fonts } from '@repo/design/lib/fonts';
import { Toolbar } from '@repo/feature-flags/components/toolbar';

import '../styles/globals.css';
import { env } from '../../env';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <ViewTransitions>
    <html lang="en" className={fonts} suppressHydrationWarning>
      <body>
        <DesignSystemProvider
          privacyUrl={new URL(
            '/legal/privacy',
            env.NEXT_PUBLIC_WEB_URL
          ).toString()}
          termsUrl={new URL('/legal/terms', env.NEXT_PUBLIC_WEB_URL).toString()}
          helpUrl={env.NEXT_PUBLIC_DOCS_URL}
        >
          {children}
        </DesignSystemProvider>
        <Toolbar />
      </body>
    </html>
  </ViewTransitions>
);

export default RootLayout;
