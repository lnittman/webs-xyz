import { describe, it, expect, vi } from 'vitest'

vi.mock('@repo/observability/error', () => ({ parseError: vi.fn(() => 'boom') }))
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

import { cn, capitalize, handleError } from '../lib/utils'
import { parseError } from '@repo/observability/error'
import { toast } from 'sonner'

describe('utils', () => {
  it('cn merges classes', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('capitalizes string', () => {
    expect(capitalize('test')).toBe('Test')
  })

  it('handles errors', () => {
    handleError('err')
    expect(parseError).toHaveBeenCalledWith('err')
    expect(toast.error).toHaveBeenCalledWith('boom')
  })
})
