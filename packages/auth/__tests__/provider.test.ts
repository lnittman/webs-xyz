import { describe, it, expect, vi } from 'vitest'

const clerk = vi.fn()
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: vi.fn((props: any) => {
    clerk(props)
    return null
  }),
}))

vi.mock('./keys', () => ({
  keys: () => ({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/up',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/home',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/welcome',
  }),
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))

import { AuthProvider } from '../provider'

describe('AuthProvider', () => {
  it('passes env vars to ClerkProvider', () => {
    AuthProvider({ children: 'x' } as any)
    expect(clerk).toHaveBeenCalledWith(
      expect.objectContaining({
        publishableKey: 'pk',
        signInUrl: '/in',
        signUpUrl: '/up',
        afterSignInUrl: '/home',
        afterSignUpUrl: '/welcome',
      })
    )
  })
})
