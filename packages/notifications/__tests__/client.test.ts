import { describe, it, expect, vi } from 'vitest'

const KnockMock = vi.fn()
vi.mock('@knocklabs/node', () => ({ Knock: vi.fn().mockImplementation(KnockMock) }))
vi.mock('../keys', () => ({ keys: () => ({ KNOCK_SECRET_API_KEY: 'k' }) }))

import { notifications } from '../index'

describe('notifications', () => {
  it('instantiates Knock with secret key', () => {
    expect(KnockMock).toHaveBeenCalledWith('k')
  })
})
