import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { ViewTransitions } from 'next-view-transitions';

import { DesignSystemProvider } from '@repo/design';
import { fonts } from '@repo/design/lib/fonts';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { createMetadata } from '@repo/seo/metadata';

import '../styles/globals.css';

const title = 'spin your space';
const description = 'AI-native web analysis and insights platform. Analyze, understand, and extract meaningful insights from any website using advanced AI technology.';

export const metadata: Metadata = createMetadata({
  title,
  description,
  image: '/logo/5.png',
  keywords: ['web analysis', 'AI', 'website insights', 'data extraction', 'web scraping'],
  openGraph: {
    type: 'website',
    url: 'https://webs.xyz',
  },
  twitter: {
    card: 'summary_large_image',
  },
});

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
