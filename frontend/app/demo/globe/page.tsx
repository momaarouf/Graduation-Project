"use client"

import { GlobePolaroids } from "@/src/components/ui/globe-polaroids"

export default function GlobePolaoridsDemo() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen p-8 overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-500">
      <div className="w-full max-w-lg">
        <GlobePolaroids />
      </div>
    </div>
  )
}
