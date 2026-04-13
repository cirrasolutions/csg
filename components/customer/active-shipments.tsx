'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Consignment, ConsignmentStatus } from '@/lib/types'
import { Package, ArrowRight, MapPin } from 'lucide-react'
import { Empty } from '@/components/ui/empty'
import Link from 'next/link'

interface ActiveShipmentsProps {
  shipments: Consignment[]
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

export function ActiveShipments({ shipments }: ActiveShipmentsProps) {
  if (shipments.length === 0) {
    return (
      <Empty>
        <Empty.Icon>
          <Package className="h-10 w-10" />
        </Empty.Icon>
        <Empty.Title>No active shipments</Empty.Title>
        <Empty.Description>
          {"You don't have any shipments in progress"}
        </Empty.Description>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <div
          key={shipment.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{shipment.tracking_number}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{shipment.sender_city}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{shipment.receiver_city}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {shipment.parcels_count} parcel{shipment.parcels_count !== 1 ? 's' : ''}
                {shipment.expected_delivery_date && (
                  <> · Expected: {new Date(shipment.expected_delivery_date).toLocaleDateString()}</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant="outline" 
              className={cn('capitalize', statusColors[shipment.status])}
            >
              {statusLabels[shipment.status]}
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href={`/customer/track?tracking=${shipment.tracking_number}`}>
                <MapPin className="h-4 w-4 mr-2" />
                Track
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
