import { createClient } from '@/lib/supabase/server'
import { TrucksTable } from '@/components/admin/trucks-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getTrucks() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('trucks')
    .select('*')
    .order('registration_number')
  
  if (error) {
    console.error('Error fetching trucks:', error)
    return []
  }
  
  return data || []
}

export default async function TrucksPage() {
  const trucks = await getTrucks()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trucks</h1>
          <p className="text-muted-foreground">Manage your fleet</p>
        </div>
        <Button asChild>
          <Link href="/admin/trucks/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Truck
          </Link>
        </Button>
      </div>

      <TrucksTable trucks={trucks} />
    </div>
  )
}
