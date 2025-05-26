import { describe, it, expect } from 'vitest'

import base from '../base.json'
import nextjs from '../nextjs.json'

describe('typescript config', () => {
  it('enables strict mode', () => {
    expect(base.compilerOptions?.strict).toBe(true)
  })

  it('extends base config', () => {
    expect(nextjs.extends).toBe('./base.json')
  })
})
