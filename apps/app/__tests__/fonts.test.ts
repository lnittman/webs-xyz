import { describe, it, expect, beforeEach } from 'vitest'
import { applyFont, getFontValue } from '../src/lib/fonts'

describe('fonts utilities', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    document.documentElement.style.removeProperty('--font-mono')
  })

  it('returns font family for id', () => {
    expect(getFontValue('geist-mono')).toContain('GeistMono')
  })

  it('returns default for unknown id', () => {
    expect(getFontValue('unknown')).toContain('IosevkaTerm')
  })

  it('applies font class and variable', () => {
    applyFont('geist-mono')
    expect(document.documentElement.classList.contains('font-geist-mono')).toBe(true)
    expect(document.documentElement.style.getPropertyValue('--font-mono')).toContain('GeistMono')
  })
})
