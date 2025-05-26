import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ModeToggle } from '../components/mode-toggle'

const setTheme = vi.fn()
vi.mock('next-themes', () => ({ useTheme: () => ({ setTheme }) }))

// Mock icons to avoid DOM issues
vi.mock('@radix-ui/react-icons', () => ({ SunIcon: () => null, MoonIcon: () => null }))

// Mock dropdown primitives to simplify rendering
vi.mock('../components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <button>{children}</button>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
}))

vi.mock('../components/ui/button', () => ({ Button: ({ children }: any) => <button>{children}</button> }))

describe('ModeToggle', () => {
  it('changes theme on selection', () => {
    render(<ModeToggle />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Dark'))
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
