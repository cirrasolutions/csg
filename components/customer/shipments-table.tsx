'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Consignment, ConsignmentStatus } from '@/lib/types'
import { Search, MapPin, ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'
import { Empty } from '@/components/ui/empty'

interface CustomerShipmentsTableProps {
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

export function CustomerShipmentsTable({ shipments }: CustomerShipmentsTableProps) {
  const [search, setSearch] = useState('')

  const filteredShipments = shipments.filter((s) => 
    s.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
    s.sender_city.toLowerCase().includes(search.toLowerCase()) ||
    s.receiver_city.toLowerCase().includes(search.toLowerCase())
  )

  if (shipments.length === 0) {
    return (
      <Empty className="py-12">
        <Empty.Icon>
          <Package className="h-10 w-10" />
        </Empty.Icon>
        <Empty.Title>No shipments yet</Empty.Title>
        <Empty.Description>
          {"You don't have any shipments associated with your account"}
        </Empty.Description>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by tracking # or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking #</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Parcels</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="font-medium">
                  {shipment.tracking_number}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{shipment.sender_city}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span>{shipment.receiver_city}</span>
                  </div>
                </TableCell>
                <TableCell>{shipment.parcels_count}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={cn('capitalize', statusColors[shipment.status])}
                  >
                    {statusLabels[shipment.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(shipment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/customer/track?tracking=${shipment.tracking_number}`}>
                      <MapPin className="h-4 w-4 mr-1" />
                      Track
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
