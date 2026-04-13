import { createClient } from '@/lib/supabase/server'
import { TrackingMap } from '@/components/admin/tracking-map'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getActiveTrucks() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('trucks')
    .select('*')
    .eq('status', 'in_transit')
    .not('current_latitude', 'is', null)
  
  return data || []
}

async function getActiveConsignments() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('consignments')
    .select(`
      *,
      truck:trucks(*)
    `)
    .in('status', ['in_transit', 'out_for_delivery'])
  
  return data || []
}

export default async function TrackingPage() {
  const trucks = await getActiveTrucks()
  const consignments = await getActiveConsignments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">GPS Tracking</h1>
        <p className="text-muted-foreground">Real-time location of your fleet</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Trucks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trucks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consignments.filter(c => c.status === 'in_transit').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out for Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consignments.filter(c => c.status === 'out_for_delivery').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tracking Points Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <TrackingMap trucks={trucks} consignments={consignments} />
    </div>
  )
}
