import { describe, it, expect, vi } from 'vitest'

const neonCfg = { webSocketConstructor: undefined }
class PrismaClient {
  constructor(public config: any) {}
}

vi.mock('@neondatabase/serverless', () => ({
  Pool: vi.fn(),
  neonConfig: neonCfg,
}))
vi.mock('@prisma/adapter-neon', () => ({ PrismaNeon: vi.fn() }))
vi.mock('./generated/client', () => ({ PrismaClient }))
vi.mock('./keys', () => ({ keys: () => ({ DATABASE_URL: 'postgres' }) }))

import '../index'

describe('database', () => {
  it('sets websocket constructor', () => {
    expect(neonCfg.webSocketConstructor).toBeDefined()
  })
})
