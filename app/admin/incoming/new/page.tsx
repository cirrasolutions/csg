import { createClient } from '@/lib/supabase/server'
import { ConsignmentForm } from '@/components/admin/consignment-form'

async function getTrucks() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('trucks')
    .select('*')
    .order('registration_number')
  return data || []
}

export default async function NewIncomingConsignmentPage() {
  const trucks = await getTrucks()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Incoming Consignment</h1>
        <p className="text-muted-foreground">Enter details for a new incoming shipment</p>
      </div>

      <ConsignmentForm type="incoming" trucks={trucks} />
    </div>
  )
}
