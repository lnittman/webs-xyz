import { describe, it, expect, afterEach } from 'vitest'

vi.mock('@logtail/next', () => ({ log: 'logtail' }))

const originalEnv = process.env.NODE_ENV

describe('log export', () => {
  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.resetModules()
  })

  it('uses console when not production', async () => {
    process.env.NODE_ENV = 'development'
    const mod = await import('../log')
    expect(mod.log).toBe(console)
  })

  it('uses logtail in production', async () => {
    process.env.NODE_ENV = 'production'
    const mod = await import('../log')
    expect(mod.log).toBe('logtail')
  })
})
