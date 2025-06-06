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
  icons: {
    icon: '/logo/1.png',
    shortcut: '/logo/1.png',
    apple: '/logo/1.png',
  },
});

// Dynamic favicon rotation script
const faviconRotationScript = `
  (function() {
    const logos = [1, 2, 3, 4, 5, 6, 7, 10]; // Available logo numbers
    let currentIndex = 0;
    
    function updateFavicon() {
      const logoNumber = logos[currentIndex];
      const favicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
      
      if (favicon) {
        favicon.href = '/logo/' + logoNumber + '.png';
      } else {
        // Create favicon if it doesn't exist
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = '/logo/' + logoNumber + '.png';
        document.head.appendChild(newFavicon);
      }
      
      currentIndex = (currentIndex + 1) % logos.length;
    }
    
    // Start rotation after page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
          updateFavicon();
          setInterval(updateFavicon, 3000); // Rotate every 3 seconds
        }, 1000); // Wait 1 second before starting
      });
    } else {
      setTimeout(function() {
        updateFavicon();
        setInterval(updateFavicon, 3000);
      }, 1000);
    }
  })();
`;

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <ViewTransitions>
    <html lang="en" className={fonts} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: faviconRotationScript }} />
      </head>
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
