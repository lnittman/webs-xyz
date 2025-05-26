import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

const createMock = () => {
  const create = vi.fn()
  const message = { create }
  return { message }
}

vi.mock('svix', () => ({
  Svix: vi.fn().mockImplementation(() => createMock()),
}))

vi.mock('@repo/auth/server', () => ({
  auth: vi.fn(),
}))

const token = 'testsk_123'

const load = async () => {
  const mod = await import('../lib/svix')
  return mod
}

describe('svix helpers', () => {
  const originalEnv = process.env.SVIX_TOKEN
  beforeEach(() => {
    vi.resetModules()
    process.env.SVIX_TOKEN = token
  })
  afterEach(() => {
    process.env.SVIX_TOKEN = originalEnv
  })

  it('throws when token missing', async () => {
    process.env.SVIX_TOKEN = ''
    const { send } = await load()
    await expect(send('event', {})).rejects.toThrow('SVIX_TOKEN is not set')
  })

  it('skips when no org', async () => {
    const { auth } = await import('@repo/auth/server')
    ;(auth as any).mockResolvedValue({ orgId: null })
    const { send } = await load()
    await expect(send('event', {})).resolves.toBeUndefined()
  })

  it('sends message with proper payload', async () => {
    const { auth } = await import('@repo/auth/server')
    ;(auth as any).mockResolvedValue({ orgId: 'org1' })
    const { send } = await load()
    const { Svix } = await import('svix')
    const instance = (Svix as any).mock.results[0].value
    await send('evt', { foo: 'bar' })
    expect(instance.message.create).toHaveBeenCalledWith('org1', expect.objectContaining({
      eventType: 'evt',
      payload: { eventType: 'evt', foo: 'bar' },
    }))
  })
})
