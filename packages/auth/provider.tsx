'use client';

import type { ComponentProps } from 'react';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import type { Theme } from '@clerk/types';
import { useTheme } from 'next-themes';

import { keys } from './keys';

export const AuthProvider = (
  properties: ComponentProps<typeof ClerkProvider>
) => {
  const env = keys();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const baseTheme = isDark ? dark : undefined;

  const elements: Theme['elements'] = {
    formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    rootBox: 'w-full mx-auto',
    card: 'bg-card hover:bg-card/80 border-border',
    socialButtonsIconButton: 'bg-muted hover:bg-muted/80',
    dividerRow: 'text-white',
    dividerText: 'text-white',
    formFieldInput: 'bg-card border-border',
    footerActionLink: 'text-primary hover:text-primary/80',
    identityPreview: 'bg-card',
    formFieldLabel: 'text-white',
    formButtonReset: 'text-white hover:text-white/80',
    navbar: 'hidden',
    socialButtonsBlockButton: 'text-white',
    formFieldLabelRow: 'text-white',
    headerTitle: 'text-white',
    headerSubtitle: 'text-white',
    profileSectionTitle: 'text-white',
    otpCodeFieldInput: 'text-white',
    dividerLine: 'bg-border',
    navbarButton: 'text-foreground',
    organizationSwitcherTrigger__open: 'bg-background',
    organizationPreviewMainIdentifier: 'text-foreground',
    organizationSwitcherTriggerIcon: 'text-muted-foreground',
    organizationPreview__organizationSwitcherTrigger: 'gap-2',
    organizationPreviewAvatarContainer: 'shrink-0',
  };

  const variables: Theme['variables'] = {
    colorPrimary: 'var(--primary)',
    colorText: '#ffffff',
    colorTextSecondary: '#ffffff',
    colorBackground: 'var(--background)',
    colorInputBackground: 'var(--card)',
    colorInputText: '#ffffff',
    colorTextOnPrimaryBackground: '#000000',
  };

  return (
    <ClerkProvider
      {...properties}
      publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{ baseTheme, elements, variables }}
      signInUrl={env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
      afterSignInUrl={env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
      afterSignUpUrl={env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
    />
  );
};