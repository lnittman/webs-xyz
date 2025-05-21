import { useEffect, useState } from 'react'

/** Hook to detect client side rendering */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])
  return isClient
}
