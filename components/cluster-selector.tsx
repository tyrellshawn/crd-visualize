"use client"
import { Button } from "@/components/ui/button"

export default function ClusterSelector() {
  return (
    <div className="flex items-center space-x-4">
      <Button variant="outline" className="w-[250px] justify-between" disabled>
        Demo Environment
      </Button>
    </div>
  )
}

