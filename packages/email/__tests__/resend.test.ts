import { describe, it, expect, vi } from 'vitest'

const Constructor = vi.fn()
vi.mock('resend', () => ({ Resend: vi.fn().mockImplementation(Constructor) }))
vi.mock('../keys', () => ({
  keys: () => ({ RESEND_TOKEN: 're_test' }),
}))

import { resend } from '../index'

describe('resend', () => {
  it('creates Resend instance with token', () => {
    expect(Constructor).toHaveBeenCalledWith('re_test')
  })
})
