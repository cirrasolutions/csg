'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Consignment, ConsignmentStatus } from '@/lib/types'
import { Package, ArrowRight } from 'lucide-react'
import { Empty } from '@/components/ui/empty'

interface RecentConsignmentsProps {
  consignments: Consignment[]
}

const statusColors: Record<ConsignmentStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  picked_up: 'bg-primary/10 text-primary border-primary/20',
  in_transit: 'bg-accent/10 text-accent border-accent/20',
  out_for_delivery: 'bg-accent/10 text-accent border-accent/20',
  delivered: 'bg-accent/10 text-accent border-accent/20',
  cancelled: 'bg-muted text-muted-foreground border-muted',
  returned: 'bg-destructive/10 text-destructive border-destructive/20',
}

const statusLabels: Record<ConsignmentStatus, string> = {
  pending: 'Pending',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

export function RecentConsignments({ consignments }: RecentConsignmentsProps) {
  if (consignments.length === 0) {
    return (
      <Empty>
        <Empty.Icon>
          <Package className="h-10 w-10" />
        </Empty.Icon>
        <Empty.Title>No consignments yet</Empty.Title>
        <Empty.Description>
          Create your first consignment to get started
        </Empty.Description>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      {consignments.map((consignment) => (
        <div
          key={consignment.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{consignment.tracking_number}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{consignment.sender_city}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{consignment.receiver_city}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{consignment.parcels_count} parcels</p>
              <p className="text-xs text-muted-foreground">
                {new Date(consignment.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={cn('capitalize', statusColors[consignment.status])}
            >
              {statusLabels[consignment.status]}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
