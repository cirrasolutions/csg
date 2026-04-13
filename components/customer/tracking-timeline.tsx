'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Consignment, DeliveryUpdate, DeliveryUpdateStatus } from '@/lib/types'
import { Clock, Package, Truck, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'

interface TrackingTimelineProps {
  consignment: Consignment
  updates: DeliveryUpdate[]
}

const statusIcons: Record<DeliveryUpdateStatus, React.ElementType> = {
  order_placed: Package,
  picked_up: Package,
  in_transit: Truck,
  at_hub: MapPin,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  delivery_attempted: AlertCircle,
  exception: AlertCircle,
}

const statusLabels: Record<DeliveryUpdateStatus, string> = {
  order_placed: 'Order Placed',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  at_hub: 'At Distribution Hub',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  delivery_attempted: 'Delivery Attempted',
  exception: 'Exception',
}

export function TrackingTimeline({ consignment, updates }: TrackingTimelineProps) {
  // Create default timeline if no updates exist
  const defaultUpdates: { status: DeliveryUpdateStatus; date: string; location?: string }[] = [
    { 
      status: 'order_placed', 
      date: consignment.created_at,
      location: consignment.sender_city
    },
  ]

  if (consignment.status !== 'pending') {
    defaultUpdates.push({
      status: 'picked_up',
      date: consignment.pickup_date || consignment.created_at,
      location: consignment.sender_city
    })
  }

  if (['in_transit', 'out_for_delivery', 'delivered'].includes(consignment.status)) {
    defaultUpdates.push({
      status: 'in_transit',
      date: consignment.pickup_date || consignment.created_at,
      location: 'In Transit'
    })
  }

  if (['out_for_delivery', 'delivered'].includes(consignment.status)) {
    defaultUpdates.push({
      status: 'out_for_delivery',
      date: consignment.expected_delivery_date || consignment.created_at,
      location: consignment.receiver_city
    })
  }

  if (consignment.status === 'delivered') {
    defaultUpdates.push({
      status: 'delivered',
      date: consignment.actual_delivery_date || consignment.created_at,
      location: consignment.receiver_city
    })
  }

  const timelineItems = updates.length > 0 
    ? updates.map(u => ({
        status: u.status,
        date: u.created_at,
        location: u.location,
        notes: u.notes
      }))
    : defaultUpdates

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Shipment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {timelineItems.map((item, index) => {
            const Icon = statusIcons[item.status] || Package
            const isFirst = index === 0
            const isLast = index === timelineItems.length - 1
            
            return (
              <div key={index} className="relative pl-8 pb-8 last:pb-0">
                {/* Vertical line */}
                {!isLast && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
                )}
                
                {/* Icon */}
                <div 
                  className={cn(
                    "absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full",
                    isFirst 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-3 w-3" />
                </div>
                
                {/* Content */}
                <div>
                  <p className={cn(
                    "font-medium",
                    isFirst ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {statusLabels[item.status]}
                  </p>
                  {item.location && (
                    <p className="text-sm text-muted-foreground">{item.location}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.date).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground mt-1 italic">{item.notes}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
