import { createClient } from '@/lib/supabase/server'
import { ConsignmentsTable } from '@/components/admin/consignments-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getConsignments() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('consignments')
    .select(`
      *,
      truck:trucks(id, registration_number, driver_name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching consignments:', error)
    return []
  }
  
  return data || []
}

export default async function ConsignmentsPage() {
  const consignments = await getConsignments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Consignments</h1>
          <p className="text-muted-foreground">Manage all your shipments</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/incoming/new">
              <Plus className="h-4 w-4 mr-2" />
              New Incoming
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/outgoing/new">
              <Plus className="h-4 w-4 mr-2" />
              New Outgoing
            </Link>
          </Button>
        </div>
      </div>

      <ConsignmentsTable consignments={consignments} />
    </div>
  )
}
