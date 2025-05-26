import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { JsonLd } from '../json-ld'

describe('JsonLd', () => {
  it('renders script with JSON', () => {
    const code = { '@context': 'https://schema.org', '@type': 'Thing', name: 'x' }
    const { container } = render(<JsonLd code={code} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    expect(script?.innerHTML).toBe(JSON.stringify(code))
  })
})
