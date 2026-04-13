import { createClient } from '@/lib/supabase/server'
import { MissingReportsTable } from '@/components/admin/missing-reports-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getMissingReports() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('missing_reports')
    .select(`
      *,
      consignment:consignments(id, tracking_number, sender_name, receiver_name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching missing reports:', error)
    return []
  }
  
  return data || []
}

export default async function MissingReportsPage() {
  const reports = await getMissingReports()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Missing Reports</h1>
          <p className="text-muted-foreground">Track and resolve missing consignment reports</p>
        </div>
        <Button asChild>
          <Link href="/admin/missing-reports/new">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Link>
        </Button>
      </div>

      <MissingReportsTable reports={reports} />
    </div>
  )
}
