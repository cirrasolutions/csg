'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Navigation } from 'lucide-react'
import type { Consignment, GpsTracking } from '@/lib/types'

interface TrackingMapProps {
  consignment: Consignment
  gpsHistory: GpsTracking[]
}

export function TrackingMap({ consignment, gpsHistory }: TrackingMapProps) {
  const lastLocation = gpsHistory[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Live Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Map placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          
          {/* Origin marker */}
          <div className="absolute left-[15%] top-[30%] flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full p-2">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium mt-1 bg-background px-2 py-0.5 rounded">
              {consignment.sender_city}
            </span>
          </div>
          
          {/* Destination marker */}
          <div className="absolute right-[15%] bottom-[30%] flex flex-col items-center">
            <div className="bg-accent text-accent-foreground rounded-full p-2">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium mt-1 bg-background px-2 py-0.5 rounded">
              {consignment.receiver_city}
            </span>
          </div>
          
          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line 
              x1="20%" 
              y1="35%" 
              x2="80%" 
              y2="65%" 
              stroke="oklch(0.45 0.15 240)" 
              strokeWidth="2" 
              strokeDasharray="8 4"
              opacity="0.5"
            />
          </svg>
          
          {/* Current position (if in transit) */}
          {['in_transit', 'out_for_delivery'].includes(consignment.status) && (
            <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute -inset-3 bg-accent/20 rounded-full animate-ping" />
                <div className="relative bg-accent text-accent-foreground rounded-full p-3">
                  <Navigation className="h-5 w-5" />
                </div>
              </div>
            </div>
          )}
          
          {/* Map placeholder text */}
          {!lastLocation && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Live tracking available when shipment is in transit
                </p>
              </div>
            </div>
          )}
        </div>
        
        {lastLocation && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm">
              <span className="text-muted-foreground">Last updated: </span>
              <span className="font-medium">
                {new Date(lastLocation.recorded_at).toLocaleString()}
              </span>
            </p>
            {lastLocation.speed_kmh && (
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">Speed: </span>
                <span className="font-medium">{lastLocation.speed_kmh} km/h</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
