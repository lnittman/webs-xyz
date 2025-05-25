# Command Palette: Integration Guide

## Overview
Adds a keyboard-triggered command menu for navigating the Webs interface. It relies on the sacred modal system for consistent behavior.

## Prerequisites
- `@repo/design` installed
- Next.js 13+ environment

## Integration Steps

### Step 1: Setup the modal context
```tsx
import { ModalProvider, ModalStack } from '@repo/design/sacred'
import { CommandPalette } from 'path/to/CommandPalette'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      {children}
      <ModalStack />
      <CommandPalette />
    </ModalProvider>
  )
}
```

### Step 2: Customize commands
Open `CommandPaletteModal.tsx` and adjust the command list or pull options from an API.

## Configuration Options
Currently the commands are static. Extend the modal props to accept a dynamic list or integrate fuzzy search.

## Usage Examples
Press `⌘K` (or `Ctrl+K`) anywhere in the app to open the palette and choose a destination.
