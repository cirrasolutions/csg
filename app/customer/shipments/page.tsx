import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerShipmentsTable } from '@/components/customer/shipments-table'

async function getCustomerShipments(userId: string) {
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
    .order('created_at', { ascending: false })
  
  return data || []
}

export default async function CustomerShipmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const shipments = await getCustomerShipments(user!.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Shipments</h1>
        <p className="text-muted-foreground">View all your past and current shipments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerShipmentsTable shipments={shipments} />
        </CardContent>
      </Card>
    </div>
  )
}
