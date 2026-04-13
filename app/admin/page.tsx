import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Truck, MapPin, AlertTriangle, ArrowUp, ArrowDown, Clock } from 'lucide-react'
import { RecentConsignments } from '@/components/admin/recent-consignments'
import { DeliveryChart } from '@/components/admin/delivery-chart'

async function getDashboardStats() {
  const supabase = await createClient()
  
  const [
    { count: totalConsignments },
    { count: inTransit },
    { count: delivered },
    { count: pending },
    { count: totalTrucks },
    { count: activeTrucks },
    { count: openMissingReports },
  ] = await Promise.all([
    supabase.from('consignments').select('*', { count: 'exact', head: true }),
    supabase.from('consignments').select('*', { count: 'exact', head: true }).eq('status', 'in_transit'),
    supabase.from('consignments').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
    supabase.from('consignments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('trucks').select('*', { count: 'exact', head: true }),
    supabase.from('trucks').select('*', { count: 'exact', head: true }).eq('status', 'in_transit'),
    supabase.from('missing_reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ])
  
  return {
    totalConsignments: totalConsignments || 0,
    inTransit: inTransit || 0,
    delivered: delivered || 0,
    pending: pending || 0,
    totalTrucks: totalTrucks || 0,
    activeTrucks: activeTrucks || 0,
    openMissingReports: openMissingReports || 0,
  }
}

async function getRecentConsignments() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('consignments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  return data || []
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  const recentConsignments = await getRecentConsignments()

  const statCards = [
    {
      title: 'Total Consignments',
      value: stats.totalConsignments,
      icon: Package,
      description: 'All time shipments',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'In Transit',
      value: stats.inTransit,
      icon: MapPin,
      description: 'Currently moving',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Pending Pickup',
      value: stats.pending,
      icon: Clock,
      description: 'Awaiting dispatch',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: ArrowDown,
      description: 'Successfully completed',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Active Trucks',
      value: `${stats.activeTrucks}/${stats.totalTrucks}`,
      icon: Truck,
      description: 'Fleet utilization',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Missing Reports',
      value: stats.openMissingReports,
      icon: AlertTriangle,
      description: 'Open cases',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your logistics operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <DeliveryChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Consignments</CardTitle>
            <a href="/admin/consignments" className="text-sm text-primary hover:underline">
              View all
            </a>
          </CardHeader>
          <CardContent>
            <RecentConsignments consignments={recentConsignments} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
