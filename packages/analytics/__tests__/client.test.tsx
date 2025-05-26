import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('posthog-js', () => ({ default: { init: vi.fn() } }))
vi.mock('posthog-js/react', () => ({
  PostHogProvider: vi.fn(({ children }: any) => <div>{children}</div>)
}))
vi.mock('../keys', () => ({ keys: () => ({ NEXT_PUBLIC_POSTHOG_KEY: 'pk', NEXT_PUBLIC_POSTHOG_HOST: 'host' }) }))

import { PostHogProvider } from '../posthog/client'

const posthog = (require('posthog-js') as any).default

describe('PostHogProvider', () => {
  it('initializes posthog on mount', () => {
    render(<PostHogProvider>child</PostHogProvider>)
    expect(posthog.init).toHaveBeenCalledWith('pk', expect.objectContaining({
      api_host: '/ingest',
      ui_host: 'host',
    }))
  })
})
