"use client"

import { CommandDialog, CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator } from "@repo/design-system/components/ui/command"
import { useModals } from "@repo/design-system/sacred"

interface CommandPaletteModalProps {
  onSelect: (path: string) => void
}

export function CommandPaletteModal({ onSelect }: CommandPaletteModalProps) {
  const { close } = useModals()

  const handleSelect = (value: string) => {
    close()
    onSelect(value)
  }

  return (
    <CommandDialog open onOpenChange={close}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect("/")}>Home</CommandItem>
          <CommandItem onSelect={() => handleSelect("/search")}>Search</CommandItem>
          <CommandItem onSelect={() => handleSelect("/history")}>History</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Help">
          <CommandItem onSelect={() => handleSelect("/legal/privacy")}>Privacy</CommandItem>
          <CommandItem onSelect={() => handleSelect("/legal/terms")}>Terms</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
