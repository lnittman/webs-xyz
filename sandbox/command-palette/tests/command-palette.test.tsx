import { render } from '@testing-library/react'
import { CommandPalette } from '../src/CommandPalette'

describe('CommandPalette', () => {
  it('renders without crashing', () => {
    render(<CommandPalette />)
  })
})
