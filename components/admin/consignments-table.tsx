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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Consignment, ConsignmentStatus } from '@/lib/types'
import { Search, MoreHorizontal, Eye, Edit, MapPin, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { Empty } from '@/components/ui/empty'
import { Package } from 'lucide-react'

interface ConsignmentsTableProps {
  consignments: (Consignment & { truck?: { id: string; registration_number: string; driver_name: string | null } | null })[]
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

export function ConsignmentsTable({ consignments }: ConsignmentsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ConsignmentStatus | 'all'>('all')

  const filteredConsignments = consignments.filter((c) => {
    const matchesSearch = 
      c.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
      c.sender_name.toLowerCase().includes(search.toLowerCase()) ||
      c.receiver_name.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (consignments.length === 0) {
    return (
      <Empty className="py-12">
        <Empty.Icon>
          <Package className="h-10 w-10" />
        </Empty.Icon>
        <Empty.Title>No consignments yet</Empty.Title>
        <Empty.Description>
          Create your first consignment to start tracking shipments
        </Empty.Description>
        <Empty.Actions>
          <Button asChild>
            <Link href="/admin/outgoing/new">Create Consignment</Link>
          </Button>
        </Empty.Actions>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking #, sender, or receiver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {statusFilter === 'all' ? 'All Status' : statusLabels[statusFilter]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              All Status
            </DropdownMenuItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <DropdownMenuItem 
                key={value} 
                onClick={() => setStatusFilter(value as ConsignmentStatus)}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From / To</TableHead>
              <TableHead>Parcels</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Truck</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConsignments.map((consignment) => (
              <TableRow key={consignment.id}>
                <TableCell className="font-medium">
                  {consignment.tracking_number}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {consignment.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{consignment.sender_city}</p>
                    <p className="text-muted-foreground">{consignment.receiver_city}</p>
                  </div>
                </TableCell>
                <TableCell>{consignment.parcels_count}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={cn('capitalize', statusColors[consignment.status])}
                  >
                    {statusLabels[consignment.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {consignment.truck ? (
                    <div className="text-sm">
                      <p className="font-medium">{consignment.truck.registration_number}</p>
                      <p className="text-muted-foreground">{consignment.truck.driver_name}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(consignment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/consignments/${consignment.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/consignments/${consignment.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/tracking?consignment=${consignment.id}`}>
                          <MapPin className="h-4 w-4 mr-2" />
                          Track
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
