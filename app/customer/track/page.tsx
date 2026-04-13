import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrackingSearchForm } from '@/components/customer/tracking-search'
import { TrackingTimeline } from '@/components/customer/tracking-timeline'
import { TrackingMap } from '@/components/customer/tracking-map'
import { Package, MapPin, Calendar, Truck, User, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConsignmentStatus } from '@/lib/types'

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
  pending: 'Pending Pickup',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

interface TrackPageProps {
  searchParams: Promise<{ tracking?: string }>
}

async function getConsignment(trackingNumber: string) {
  const supabase = await createClient()
  
  const { data: consignment } = await supabase
    .from('consignments')
    .select(`
      *,
      truck:trucks(id, registration_number, driver_name, driver_phone)
    `)
    .eq('tracking_number', trackingNumber)
    .single()
  
  return consignment
}

async function getDeliveryUpdates(consignmentId: string) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('delivery_updates')
    .select('*')
    .eq('consignment_id', consignmentId)
    .order('created_at', { ascending: false })
  
  return data || []
}

async function getGpsHistory(consignmentId: string) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('gps_tracking')
    .select('*')
    .eq('consignment_id', consignmentId)
    .order('recorded_at', { ascending: false })
    .limit(50)
  
  return data || []
}

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const params = await searchParams
  const trackingNumber = params.tracking
  
  const consignment = trackingNumber ? await getConsignment(trackingNumber) : null
  const deliveryUpdates = consignment ? await getDeliveryUpdates(consignment.id) : []
  const gpsHistory = consignment ? await getGpsHistory(consignment.id) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Track Shipment</h1>
        <p className="text-muted-foreground">Enter your tracking number to see real-time updates</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TrackingSearchForm />
        </CardContent>
      </Card>

      {trackingNumber && !consignment && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Shipment Not Found</h3>
            <p className="text-muted-foreground mt-1">
              {"We couldn't find a shipment with tracking number"} <strong>{trackingNumber}</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please check the tracking number and try again
            </p>
          </CardContent>
        </Card>
      )}

      {consignment && (
        <>
          {/* Shipment Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{consignment.tracking_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {consignment.parcels_count} parcel{consignment.parcels_count !== 1 ? 's' : ''}
                      {consignment.total_weight_kg && ` · ${consignment.total_weight_kg} kg`}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn('text-lg px-4 py-1', statusColors[consignment.status as ConsignmentStatus])}
                >
                  {statusLabels[consignment.status as ConsignmentStatus]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-medium">{consignment.sender_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {consignment.sender_city}, {consignment.sender_country}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <MapPin className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-medium">{consignment.receiver_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {consignment.receiver_city}, {consignment.receiver_country}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Delivery</p>
                    <p className="font-medium">
                      {consignment.expected_delivery_date 
                        ? new Date(consignment.expected_delivery_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'TBD'
                      }
                    </p>
                  </div>
                </div>
                {consignment.truck && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Truck className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{consignment.truck.registration_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {consignment.truck.driver_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map and Timeline */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TrackingMap 
              consignment={consignment}
              gpsHistory={gpsHistory}
            />
            <TrackingTimeline 
              consignment={consignment}
              updates={deliveryUpdates}
            />
          </div>
        </>
      )}
    </div>
  )
}
