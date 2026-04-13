import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Truck, MapPin, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { TrackingSearchForm } from '@/components/customer/tracking-search'
import { ActiveShipments } from '@/components/customer/active-shipments'

async function getCustomerStats(userId: string) {
  const supabase = await createClient()
  
  // Get user profile to find their company
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .single()

  if (!profile?.company_id) {
    return { totalShipments: 0, inTransit: 0, delivered: 0, pending: 0 }
  }

  const [
    { count: totalShipments },
    { count: inTransit },
    { count: delivered },
    { count: pending },
  ] = await Promise.all([
    supabase.from('consignments').select('*', { count: 'exact', head: true })
      .or(`sender_company_id.eq.${profile.company_id},receiver_company_id.eq.${profile.company_id}`),
    supabase.from('consignments').select('*', { count: 'exact', head: true })
      .or(`sender_company_id.eq.${profile.company_id},receiver_company_id.eq.${profile.company_id}`)
      .eq('status', 'in_transit'),
    supabase.from('consignments').select('*', { count: 'exact', head: true })
      .or(`sender_company_id.eq.${profile.company_id},receiver_company_id.eq.${profile.company_id}`)
      .eq('status', 'delivered'),
    supabase.from('consignments').select('*', { count: 'exact', head: true })
      .or(`sender_company_id.eq.${profile.company_id},receiver_company_id.eq.${profile.company_id}`)
      .eq('status', 'pending'),
  ])
  
  return {
    totalShipments: totalShipments || 0,
    inTransit: inTransit || 0,
    delivered: delivered || 0,
    pending: pending || 0,
  }
}

async function getActiveShipments(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .single()

  if (!profile?.company_id) {
    return []
  }

  const { data } = await supabase
    .from('consignments')
    .select('*')
    .or(`sender_company_id.eq.${profile.company_id},receiver_company_id.eq.${profile.company_id}`)
    .in('status', ['pending', 'picked_up', 'in_transit', 'out_for_delivery'])
    .order('created_at', { ascending: false })
    .limit(5)
  
  return data || []
}

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const stats = await getCustomerStats(user!.id)
  const activeShipments = await getActiveShipments(user!.id)

  const statCards = [
    {
      title: 'Total Shipments',
      value: stats.totalShipments,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'In Transit',
      value: stats.inTransit,
      icon: Truck,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: MapPin,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Customer'}
        </h1>
        <p className="text-muted-foreground">Track and manage your shipments</p>
      </div>

      {/* Quick Track */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Track a Shipment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingSearchForm />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Shipments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Shipments</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/customer/shipments" className="flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ActiveShipments shipments={activeShipments} />
        </CardContent>
      </Card>
    </div>
  )
}
