'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { MapPin, Truck as TruckIcon, Navigation } from 'lucide-react'
import type { Truck, Consignment } from '@/lib/types'

interface TrackingMapProps {
  trucks: Truck[]
  consignments: (Consignment & { truck?: Truck | null })[]
}

export function TrackingMap({ trucks, consignments }: TrackingMapProps) {
  const hasActiveTracking = trucks.length > 0 || consignments.some(c => c.truck)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Map placeholder - In production, integrate with Google Maps or Mapbox */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="text-center z-10">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">Map Integration</p>
              <p className="text-sm text-muted-foreground mt-1">
                Connect Google Maps or Mapbox API for live tracking
              </p>
            </div>
            
            {/* Simulated truck markers */}
            {trucks.map((truck, index) => (
              <div 
                key={truck.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${20 + (index * 25)}%`,
                  top: `${30 + (index * 15)}%`,
                }}
              >
                <div className="relative">
                  <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping" />
                  <div className="relative bg-primary text-primary-foreground rounded-full p-2">
                    <TruckIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Active Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasActiveTracking ? (
            <Empty>
              <Empty.Icon>
                <TruckIcon className="h-8 w-8" />
              </Empty.Icon>
              <Empty.Title>No active tracking</Empty.Title>
              <Empty.Description>
                No vehicles are currently in transit
              </Empty.Description>
            </Empty>
          ) : (
            <div className="space-y-4">
              {trucks.map((truck) => (
                <div 
                  key={truck.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <TruckIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{truck.registration_number}</p>
                      <p className="text-xs text-muted-foreground">{truck.driver_name || 'No driver'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    Active
                  </Badge>
                </div>
              ))}
              
              {consignments.filter(c => c.truck).map((consignment) => (
                <div 
                  key={consignment.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{consignment.tracking_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {consignment.sender_city} → {consignment.receiver_city}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize bg-primary/10 text-primary border-primary/20">
                    {consignment.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
