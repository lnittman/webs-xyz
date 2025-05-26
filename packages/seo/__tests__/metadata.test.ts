import { describe, it, expect } from 'vitest'

import { createMetadata } from '../metadata'

describe('createMetadata', () => {
  it('merges custom fields', () => {
    const meta = createMetadata({ title: 't', description: 'd', image: '/i.png' })
    expect(meta.title).toBe('t | webs')
    expect(meta.openGraph?.images?.[0]).toEqual(expect.objectContaining({ url: '/i.png' }))
  })
})
