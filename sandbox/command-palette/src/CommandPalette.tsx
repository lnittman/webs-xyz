"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useModals } from "@repo/design/sacred"
import { CommandPaletteModal } from "./CommandPaletteModal"

/**
 * CommandPalette component registers a global hotkey (`⌘K` / `Ctrl+K`)
 * that opens the CommandPaletteModal using the sacred modal system.
 */
export const CommandPalette = () => {
  const router = useRouter()
  const { open } = useModals()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        open(CommandPaletteModal, { onSelect: (path: string) => router.push(path) })
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, router])

  return null
}

export default CommandPalette
