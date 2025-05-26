import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIsMobile } from '../hooks/use-mobile'

function TestComp() {
  const isMobile = useIsMobile()
  return <span data-testid="result">{String(isMobile)}</span>
}

describe('useIsMobile', () => {
  const originalMatch = window.matchMedia
  const originalWidth = window.innerWidth

  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'innerWidth', { value: originalWidth, writable: true })
    window.matchMedia = originalMatch
  })

  it('returns true when width below breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true })
    window.matchMedia = vi.fn().mockReturnValue({ addEventListener: vi.fn(), removeEventListener: vi.fn() })
    render(<TestComp />)
    expect(screen.getByTestId('result').textContent).toBe('true')
  })

  it('returns false when width above breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true })
    window.matchMedia = vi.fn().mockReturnValue({ addEventListener: vi.fn(), removeEventListener: vi.fn() })
    render(<TestComp />)
    expect(screen.getByTestId('result').textContent).toBe('false')
  })

  it('updates on change event', () => {
    let handler: () => void = () => {}
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true })
    window.matchMedia = vi.fn().mockReturnValue({
      addEventListener: vi.fn((_e, fn) => { handler = fn }),
      removeEventListener: vi.fn(),
    })
    render(<TestComp />)
    expect(screen.getByTestId('result').textContent).toBe('false')
    window.innerWidth = 500
    handler()
    expect(screen.getByTestId('result').textContent).toBe('true')
  })
})
