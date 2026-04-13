'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function TrackingSearchForm() {
  const router = useRouter()
  const [trackingNumber, setTrackingNumber] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (trackingNumber.trim()) {
      router.push(`/customer/track?tracking=${encodeURIComponent(trackingNumber.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Enter tracking number (e.g., LT1234567890)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button type="submit">
        Track
      </Button>
    </form>
  )
}
