import { describe, it, expect, vi } from 'vitest'

const design = vi.fn()
vi.mock('../providers/theme', () => ({ ThemeProvider: vi.fn(({ children }: any) => children) }))
vi.mock('@repo/auth/provider', () => ({ AuthProvider: vi.fn(({ children }: any) => children) }))
vi.mock('../sacred', () => ({ ModalProvider: vi.fn(({ children }: any) => children), ModalStack: () => null }))
vi.mock('../components/ui/tooltip', () => ({ TooltipProvider: vi.fn(({ children }: any) => children) }))
vi.mock('../components/ui/sonner', () => ({ Toaster: () => null }))

import { DesignSystemProvider } from '../index'

describe('DesignSystemProvider', () => {
  it('renders children', () => {
    const result = DesignSystemProvider({ children: 'ok' } as any)
    expect(result).toBe('ok')
  })
})
