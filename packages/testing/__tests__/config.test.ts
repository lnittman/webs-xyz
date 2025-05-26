import { describe, it, expect } from 'vitest'

import config from '../index.js'

describe('testing config', () => {
  it('sets jsdom environment', () => {
    expect(config.test?.environment).toBe('jsdom')
  })
})
