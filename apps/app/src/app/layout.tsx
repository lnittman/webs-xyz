import type { ReactNode } from 'react';
import { ViewTransitions } from 'next-view-transitions';

import { DesignSystemProvider } from '@repo/design';
import { fonts } from '@repo/design/lib/fonts';
import { Toolbar } from '@repo/feature-flags/components/toolbar';

import '../styles/globals.css';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <ViewTransitions>
    <html lang="en" className={fonts} suppressHydrationWarning>
      <body>
        <DesignSystemProvider>
          {children}
        </DesignSystemProvider>
        <Toolbar />
      </body>
    </html>
  </ViewTransitions>
);

export default RootLayout;
