import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const init = vi.fn()
vi.mock('posthog-js', () => ({ default: { init } }))
vi.mock('../keys', () => ({ keys: () => ({ NEXT_PUBLIC_POSTHOG_KEY: 'pk', NEXT_PUBLIC_POSTHOG_HOST: 'https://host' }) }))
vi.mock('posthog-js/react', () => ({ PostHogProvider: ({ children }: any) => <div data-testid="provider">{children}</div> }))

import { PostHogProvider } from '../posthog/client'

describe('PostHogProvider', () => {
  it('initializes posthog and renders children', () => {
    render(
      <PostHogProvider>
        <span data-testid="child">ok</span>
      </PostHogProvider>
    )

    expect(init).toHaveBeenCalledWith('pk', expect.objectContaining({
      api_host: '/ingest',
      ui_host: 'https://host',
      person_profiles: 'identified_only',
    }))
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
