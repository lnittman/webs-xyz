import { describe, it, expect, vi, beforeEach } from 'vitest'

const init = vi.fn()
vi.mock('@sentry/nextjs', () => ({ init }))
vi.mock('../keys', () => ({ keys: () => ({ NEXT_PUBLIC_SENTRY_DSN: 'dsn' }) }))

const load = async () => {
  vi.resetModules()
  const mod = await import('../instrumentation')
  return mod.initializeSentry
}

describe('initializeSentry', () => {
  beforeEach(() => {
    init.mockClear()
    delete process.env.NEXT_RUNTIME
  })

  it('initializes when runtime is nodejs', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    const initializeSentry = await load()
    initializeSentry()
    expect(init).toHaveBeenCalledWith({ dsn: 'dsn' })
  })

  it('initializes when runtime is edge', async () => {
    process.env.NEXT_RUNTIME = 'edge'
    const initializeSentry = await load()
    initializeSentry()
    expect(init).toHaveBeenCalledWith({ dsn: 'dsn' })
  })

  it('does nothing for other runtimes', async () => {
    const initializeSentry = await load()
    initializeSentry()
    expect(init).not.toHaveBeenCalled()
  })
})
