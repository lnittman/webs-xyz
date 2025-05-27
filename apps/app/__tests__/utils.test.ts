import { describe, it, expect } from 'vitest'
import { cn } from '../src/lib/utils'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, undefined, '', 'b')).toBe('a b')
  })
})
