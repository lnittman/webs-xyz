import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('@repo/analytics/posthog/server', () => ({
  analytics: { isFeatureEnabled: vi.fn() },
}))

vi.mock('@repo/auth/server', () => ({
  auth: vi.fn(),
}))

vi.mock('flags/next', () => ({
  flag: vi.fn((config) => config),
}))

import { createFlag } from '../lib/create-flag'

describe('createFlag', () => {
  const { analytics } = require('@repo/analytics/posthog/server')
  const { auth } = require('@repo/auth/server')

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns default for anonymous user', async () => {
    ;(auth as any).mockResolvedValue({ userId: null })
    const flag = createFlag('test')
    await expect(flag.decide()).resolves.toBe(false)
  })

  it('returns enabled value for user', async () => {
    ;(auth as any).mockResolvedValue({ userId: '1' })
    ;(analytics.isFeatureEnabled as any).mockResolvedValue(true)
    const flag = createFlag('test')
    await expect(flag.decide()).resolves.toBe(true)
  })

  it('falls back to default when undefined', async () => {
    ;(auth as any).mockResolvedValue({ userId: '1' })
    ;(analytics.isFeatureEnabled as any).mockResolvedValue(undefined)
    const flag = createFlag('test')
    await expect(flag.decide()).resolves.toBe(false)
  })
})
