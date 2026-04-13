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
import type { MissingReport, MissingReportStatus } from '@/lib/types'
import { Search, MoreHorizontal, Eye, Edit, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Empty } from '@/components/ui/empty'

interface MissingReportsTableProps {
  reports: (MissingReport & { 
    consignment?: { 
      id: string
      tracking_number: string
      sender_name: string
      receiver_name: string 
    } | null 
  })[]
}

const statusColors: Record<MissingReportStatus, string> = {
  open: 'bg-destructive/10 text-destructive border-destructive/20',
  investigating: 'bg-warning/10 text-warning border-warning/20',
  found: 'bg-accent/10 text-accent border-accent/20',
  closed: 'bg-muted text-muted-foreground border-muted',
}

const statusLabels: Record<MissingReportStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  found: 'Found',
  closed: 'Closed',
}

export function MissingReportsTable({ reports }: MissingReportsTableProps) {
  const [search, setSearch] = useState('')

  const filteredReports = reports.filter((r) => 
    r.consignment?.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  )

  if (reports.length === 0) {
    return (
      <Empty className="py-12">
        <Empty.Icon>
          <AlertTriangle className="h-10 w-10" />
        </Empty.Icon>
        <Empty.Title>No missing reports</Empty.Title>
        <Empty.Description>
          No missing consignment reports have been filed
        </Empty.Description>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by tracking # or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Consignment</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Estimated Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  {report.consignment ? (
                    <div className="text-sm">
                      <p className="font-medium">{report.consignment.tracking_number}</p>
                      <p className="text-muted-foreground">
                        {report.consignment.sender_name} → {report.consignment.receiver_name}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unknown</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="truncate">{report.description}</p>
                </TableCell>
                <TableCell>
                  {report.estimated_value 
                    ? `$${report.estimated_value.toLocaleString()}`
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={cn('capitalize', statusColors[report.status])}
                  >
                    {statusLabels[report.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(report.created_at).toLocaleDateString()}
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
                        <Link href={`/admin/missing-reports/${report.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/missing-reports/${report.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Update Status
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
