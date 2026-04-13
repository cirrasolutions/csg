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
import type { Truck, TruckStatus } from '@/lib/types'
import { Search, MoreHorizontal, Eye, Edit, MapPin, Truck as TruckIcon } from 'lucide-react'
import Link from 'next/link'
import { Empty } from '@/components/ui/empty'

interface TrucksTableProps {
  trucks: Truck[]
}

const statusColors: Record<TruckStatus, string> = {
  available: 'bg-accent/10 text-accent border-accent/20',
  in_transit: 'bg-primary/10 text-primary border-primary/20',
  maintenance: 'bg-warning/10 text-warning border-warning/20',
  retired: 'bg-muted text-muted-foreground border-muted',
}

const statusLabels: Record<TruckStatus, string> = {
  available: 'Available',
  in_transit: 'In Transit',
  maintenance: 'Maintenance',
  retired: 'Retired',
}

export function TrucksTable({ trucks }: TrucksTableProps) {
  const [search, setSearch] = useState('')

  const filteredTrucks = trucks.filter((t) => 
    t.registration_number.toLowerCase().includes(search.toLowerCase()) ||
    t.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.make?.toLowerCase().includes(search.toLowerCase())
  )

  if (trucks.length === 0) {
    return (
      <Empty className="py-12">
        <Empty.Icon>
          <TruckIcon className="h-10 w-10" />
        </Empty.Icon>
        <Empty.Title>No trucks yet</Empty.Title>
        <Empty.Description>
          Add your first truck to start managing your fleet
        </Empty.Description>
        <Empty.Actions>
          <Button asChild>
            <Link href="/admin/trucks/new">Add Truck</Link>
          </Button>
        </Empty.Actions>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by registration, driver, or make..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration</TableHead>
              <TableHead>Make / Model</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Location Update</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrucks.map((truck) => (
              <TableRow key={truck.id}>
                <TableCell className="font-medium">
                  {truck.registration_number}
                </TableCell>
                <TableCell>
                  {truck.make && truck.model ? (
                    <span>{truck.make} {truck.model} {truck.year && `(${truck.year})`}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {truck.driver_name ? (
                    <div className="text-sm">
                      <p className="font-medium">{truck.driver_name}</p>
                      <p className="text-muted-foreground">{truck.driver_phone}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {truck.capacity_kg ? `${truck.capacity_kg} kg` : '-'}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={cn('capitalize', statusColors[truck.status])}
                  >
                    {statusLabels[truck.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {truck.last_location_update 
                    ? new Date(truck.last_location_update).toLocaleString()
                    : '-'
                  }
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
                        <Link href={`/admin/trucks/${truck.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/trucks/${truck.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/tracking?truck=${truck.id}`}>
                          <MapPin className="h-4 w-4 mr-2" />
                          Track Location
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
