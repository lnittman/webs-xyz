# Command Palette: Integration Guide

The Command Palette provides a keyboard shortcut (`⌘K`/`Ctrl+K`) that opens a modal for quick navigation. It uses the `ModalProvider` and `ModalStack` from the sacred design system so it plays nicely with other modals.

## Integration Steps

1. Copy the files from `sandbox/command-palette/src` into a shared package.
2. Wrap your application with `ModalProvider` and include `<ModalStack />` near the end of your layout.
3. Render `<CommandPalette />` once within the layout so it can register the keyboard shortcut.

After integration, pressing `⌘K` will open the palette and allow quick navigation.
