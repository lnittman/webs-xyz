import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

const protect = vi.fn()
const withRule = vi.fn(() => ({ protect }))
const arcjetMock = vi.fn(() => ({ withRule }))

vi.mock('@arcjet/next', () => ({
  default: arcjetMock,
  detectBot: vi.fn(() => 'rule'),
  request: vi.fn(() => Promise.resolve('req')),
  shield: vi.fn(() => 'shield'),
}))

const load = async () => {
  const mod = await import('../index')
  return mod.secure
}

describe('secure', () => {
  const originalKey = process.env.ARCJET_KEY
  beforeEach(() => {
    vi.resetModules()
    process.env.ARCJET_KEY = 'ajkey_x'
    protect.mockResolvedValue({ isDenied: () => false })
  })
  afterEach(() => {
    process.env.ARCJET_KEY = originalKey
  })

  it('returns early without key', async () => {
    process.env.ARCJET_KEY = ''
    const secure = await load()
    await expect(secure(['bot'])).resolves.toBeUndefined()
    expect(arcjetMock).not.toHaveBeenCalled()
  })

  it('allows when decision not denied', async () => {
    const secure = await load()
    await expect(secure(['bot'])).resolves.toBeUndefined()
    expect(arcjetMock).toHaveBeenCalled()
  })

  it('throws bot error', async () => {
    protect.mockResolvedValue({ isDenied: () => true, reason: { isBot: () => true, isRateLimit: () => false } })
    const secure = await load()
    await expect(secure(['bot'])).rejects.toThrow('No bots allowed')
  })

  it('throws rate limit error', async () => {
    protect.mockResolvedValue({ isDenied: () => true, reason: { isBot: () => false, isRateLimit: () => true } })
    const secure = await load()
    await expect(secure(['bot'])).rejects.toThrow('Rate limit exceeded')
  })

  it('throws access denied', async () => {
    protect.mockResolvedValue({ isDenied: () => true, reason: { isBot: () => false, isRateLimit: () => false } })
    const secure = await load()
    await expect(secure(['bot'])).rejects.toThrow('Access denied')
  })
})
