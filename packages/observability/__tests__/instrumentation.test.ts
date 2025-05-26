import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@sentry/nextjs', () => ({ init: vi.fn() }))
vi.mock('../keys', () => ({ keys: () => ({ NEXT_PUBLIC_SENTRY_DSN: 'dsn' }) }))

import { initializeSentry } from '../instrumentation'

const { init } = require('@sentry/nextjs') as { init: (opts: unknown) => void }

const originalRuntime = process.env.NEXT_RUNTIME

describe('initializeSentry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    process.env.NEXT_RUNTIME = originalRuntime
  })

  it('initializes when runtime is nodejs', () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    initializeSentry()
    expect(init).toHaveBeenCalledWith({ dsn: 'dsn' })
  })

  it('initializes when runtime is edge', () => {
    process.env.NEXT_RUNTIME = 'edge'
    initializeSentry()
    expect(init).toHaveBeenCalledWith({ dsn: 'dsn' })
  })

  it('skips when runtime is other', () => {
    process.env.NEXT_RUNTIME = 'other'
    initializeSentry()
    expect(init).not.toHaveBeenCalled()
  })
})
