import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@knocklabs/react', () => ({
  NotificationIconButton: vi.fn(() => <button>icon</button>),
  NotificationFeedPopover: vi.fn(() => <div>popover</div>),
}))

const load = async (env: Record<string, string>) => {
  vi.doMock('../keys', () => ({ keys: () => env }))
  const mod = await import('../components/trigger')
  return mod.NotificationsTrigger
}

describe('NotificationsTrigger', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns null when api key missing', async () => {
    const Trigger = await load({})
    const { container } = render(<Trigger />)
    expect(container.firstChild).toBeNull()
  })

  it('renders button when api key present', async () => {
    const Trigger = await load({ NEXT_PUBLIC_KNOCK_API_KEY: 'k' })
    const { NotificationIconButton } = require('@knocklabs/react')
    render(<Trigger />)
    expect(NotificationIconButton).toHaveBeenCalled()
  })
})
