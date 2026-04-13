import { createClient } from '@/lib/supabase/server'
import { ConsignmentsTable } from '@/components/admin/consignments-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getOutgoingConsignments() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('consignments')
    .select(`
      *,
      truck:trucks(id, registration_number, driver_name)
    `)
    .eq('type', 'outgoing')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching consignments:', error)
    return []
  }
  
  return data || []
}

export default async function OutgoingConsignmentsPage() {
  const consignments = await getOutgoingConsignments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outgoing Consignments</h1>
          <p className="text-muted-foreground">Manage outgoing shipments</p>
        </div>
        <Button asChild>
          <Link href="/admin/outgoing/new">
            <Plus className="h-4 w-4 mr-2" />
            New Outgoing
          </Link>
        </Button>
      </div>

      <ConsignmentsTable consignments={consignments} />
    </div>
  )
}
