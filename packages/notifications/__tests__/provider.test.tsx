import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@knocklabs/react', () => ({
  KnockProvider: vi.fn(({ children }: any) => <div>{children}</div>),
  KnockFeedProvider: vi.fn(({ children }: any) => <div>{children}</div>),
}))

const load = async (env: Record<string, string>) => {
  vi.doMock('../keys', () => ({ keys: () => env }))
  const mod = await import('../components/provider')
  return mod.NotificationsProvider
}

describe('NotificationsProvider', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns children when env vars missing', async () => {
    const Provider = await load({})
    const { container } = render(<Provider userId="1">child</Provider>)
    expect(container.textContent).toBe('child')
  })

  it('wraps children when env vars present', async () => {
    const Provider = await load({
      NEXT_PUBLIC_KNOCK_API_KEY: 'k',
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'f',
    })
    const { KnockProvider } = require('@knocklabs/react')
    render(<Provider userId="1">child</Provider>)
    expect(KnockProvider).toHaveBeenCalled()
  })
})
