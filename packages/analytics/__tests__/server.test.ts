import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('posthog-node', () => ({
  PostHog: vi.fn().mockImplementation(function (key, options) {
    this.key = key
    this.options = options
  }),
}))

vi.mock('../keys', () => ({
  keys: () => ({
    NEXT_PUBLIC_POSTHOG_KEY: 'phc_test',
    NEXT_PUBLIC_POSTHOG_HOST: 'https://host',
  }),
}))

const load = async () => {
  const mod = await import('../posthog/server')
  return {
    analytics: mod.analytics,
    PostHog: (await import('posthog-node')).PostHog,
  }
}

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('initializes PostHog with env keys', async () => {
    const { PostHog } = await load()
    expect(PostHog).toHaveBeenCalledWith('phc_test', expect.objectContaining({
      host: 'https://host',
      flushAt: 1,
      flushInterval: 0,
    }))
  })
})
