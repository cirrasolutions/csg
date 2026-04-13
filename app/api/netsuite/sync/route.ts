import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncAllPendingRecords } from '@/lib/netsuite/sync'

export async function POST() {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role
    if (userRole !== 'system_admin' && userRole !== 'dispatcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if NetSuite is configured
    if (!process.env.NETSUITE_ACCOUNT_ID) {
      return NextResponse.json({ 
        error: 'NetSuite not configured',
        message: 'Please set NETSUITE_ACCOUNT_ID, NETSUITE_CONSUMER_KEY, NETSUITE_CONSUMER_SECRET, NETSUITE_TOKEN_ID, and NETSUITE_TOKEN_SECRET environment variables.'
      }, { status: 400 })
    }

    const result = await syncAllPendingRecords()

    return NextResponse.json({
      success: true,
      synced: {
        consignments: result.consignments,
        companies: result.companies,
        trucks: result.trucks,
      },
      errors: result.errors,
    })
  } catch (error) {
    console.error('NetSuite sync error:', error)
    return NextResponse.json({ 
      error: 'Sync failed',
      message: (error as Error).message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get sync status
    const { data: syncLogs, error } = await supabase
      .from('netsuite_sync_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get counts of unsynced records
    const [
      { count: unsyncedConsignments },
      { count: unsyncedCompanies },
      { count: unsyncedTrucks },
    ] = await Promise.all([
      supabase.from('consignments').select('*', { count: 'exact', head: true }).is('netsuite_id', null),
      supabase.from('companies').select('*', { count: 'exact', head: true }).is('netsuite_id', null),
      supabase.from('trucks').select('*', { count: 'exact', head: true }).is('netsuite_id', null),
    ])

    return NextResponse.json({
      configured: !!process.env.NETSUITE_ACCOUNT_ID,
      pending: {
        consignments: unsyncedConsignments || 0,
        companies: unsyncedCompanies || 0,
        trucks: unsyncedTrucks || 0,
      },
      recentLogs: syncLogs,
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get sync status',
      message: (error as Error).message
    }, { status: 500 })
  }
}
