import { describe, expect, it, vi } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

vi.mock('../log', () => ({
  log: { error: vi.fn() },
}))

import { parseError } from '../error'

describe('parseError', () => {
  it('returns message from Error objects', () => {
    const message = 'fail'
    const result = parseError(new Error(message))
    expect(result).toBe(message)
  })

  it('handles plain objects with message', () => {
    const result = parseError({ message: 'oops' })
    expect(result).toBe('oops')
  })

  it('handles strings', () => {
    expect(parseError('boom')).toBe('boom')
  })

  it('swallows capture errors', () => {
    const { captureException } = require('@sentry/nextjs') as { captureException: (e: unknown) => void }
    ;(captureException as any).mockImplementation(() => { throw new Error('oops') })
    expect(parseError('x')).toBe('x')
  })
})
