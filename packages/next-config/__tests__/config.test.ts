import { describe, it, expect, vi } from 'vitest'

vi.mock('@next/bundle-analyzer', () => () => (c: any) => ({ ...c, analyzed: true }))

import { config, withAnalyzer } from '../index'

describe('next-config', () => {
  it('has skipTrailingSlashRedirect enabled', () => {
    expect(config.skipTrailingSlashRedirect).toBe(true)
  })

  it('wraps config with analyzer', () => {
    const result = withAnalyzer({ value: 1 } as any)
    expect((result as any).analyzed).toBe(true)
  })
})
