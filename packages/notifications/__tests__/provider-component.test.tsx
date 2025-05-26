import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const keysMock = vi.fn()
vi.mock('../keys', () => ({ keys: keysMock }))
vi.mock('@knocklabs/react', () => ({
  KnockProvider: ({ children }: any) => <div data-testid="knock">{children}</div>,
  KnockFeedProvider: ({ children }: any) => <div data-testid="feed">{children}</div>,
}))

const load = async () => {
  vi.resetModules()
  return (await import('../components/provider')).NotificationsProvider
}

describe('NotificationsProvider', () => {
  it('renders children when keys missing', async () => {
    keysMock.mockReturnValue({})
    const Provider = await load()
    render(<Provider userId="1"><span data-testid="child" /></Provider>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.queryByTestId('knock')).not.toBeInTheDocument()
  })

  it('wraps children when keys present', async () => {
    keysMock.mockReturnValue({
      NEXT_PUBLIC_KNOCK_API_KEY: 'k',
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'c',
    })
    const Provider = await load()
    render(<Provider userId="1"><span data-testid="child" /></Provider>)
    expect(screen.getByTestId('knock')).toBeInTheDocument()
    expect(screen.getByTestId('feed')).toBeInTheDocument()
  })
})
