import { describe, expect, it, vi, beforeEach } from 'vitest'

class FakeRedis {}
class FakeRatelimit {
  static slidingWindow = vi.fn((l, t) => ({ l, t }))
  constructor(config: any) {
    this.config = config
  }
}

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => new FakeRedis()),
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: FakeRatelimit,
}))

vi.mock('../keys', () => ({
  keys: () => ({
    UPSTASH_REDIS_REST_URL: 'https://url',
    UPSTASH_REDIS_REST_TOKEN: 'token',
  }),
}))

import { createRateLimiter } from '../index'

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses defaults when options missing', () => {
    const limiter = createRateLimiter({}) as any
    expect(limiter.config.prefix).toBe('next-forge')
    expect(FakeRatelimit.slidingWindow).toHaveBeenCalled()
  })

  it('passes through provided options', () => {
    const limiter = createRateLimiter({ prefix: 'p', limiter: 'l' } as any) as any
    expect(limiter.config.prefix).toBe('p')
    expect(limiter.config.limiter).toBe('l')
  })
})
