import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const keysMock = vi.fn()
vi.mock('../keys', () => ({ keys: keysMock }))
vi.mock('@knocklabs/react', () => ({
  NotificationIconButton: ({ onClick }: any) => <button data-testid="icon" onClick={onClick} />,
  NotificationFeedPopover: () => <div data-testid="feed" />,
}))
vi.mock('@knocklabs/react/dist/index.css', () => ({}))
vi.mock('../styles.css', () => ({}))

const load = async () => {
  vi.resetModules()
  return (await import('../components/trigger')).NotificationsTrigger
}

describe('NotificationsTrigger', () => {
  it('returns null when api key missing', async () => {
    keysMock.mockReturnValue({})
    const Trigger = await load()
    const { container } = render(<Trigger />)
    expect(container.firstChild).toBeNull()
  })

  it('renders icon button when api key provided', async () => {
    keysMock.mockReturnValue({ NEXT_PUBLIC_KNOCK_API_KEY: 'k' })
    const Trigger = await load()
    render(<Trigger />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
