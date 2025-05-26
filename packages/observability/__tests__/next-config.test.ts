import { describe, it, expect, vi } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  withSentryConfig: vi.fn((cfg, opts) => ({ cfg, opts }))
}))
vi.mock('@logtail/next', () => ({
  withLogtail: vi.fn((cfg) => ({ cfg }))
}))
vi.mock('../keys', () => ({ keys: () => ({ SENTRY_ORG: 'org', SENTRY_PROJECT: 'proj' }) }))

import { withSentry, withLogging, sentryConfig } from '../next-config'

const { withSentryConfig } = require('@sentry/nextjs')
const { withLogtail } = require('@logtail/next')

describe('next-config helpers', () => {
  it('wraps config with Sentry', () => {
    const result = withSentry({ foo: 1 }) as any
    expect(withSentryConfig).toHaveBeenCalledWith({ foo: 1, transpilePackages: ['@sentry/nextjs'] }, sentryConfig)
    expect(result.cfg).toEqual({ foo: 1, transpilePackages: ['@sentry/nextjs'] })
  })

  it('wraps config with Logtail', () => {
    const result = withLogging({ bar: 2 }) as any
    expect(withLogtail).toHaveBeenCalledWith({ bar: 2 })
    expect(result.cfg).toEqual({ bar: 2 })
  })
})
