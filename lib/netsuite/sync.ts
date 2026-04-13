import { createClient } from '@/lib/supabase/server'
import { getNetSuiteClient } from './client'
import type { Consignment, Company, Truck } from '@/lib/types'

type SyncAction = 'create' | 'update' | 'delete'
type SyncStatus = 'pending' | 'success' | 'failed'

interface SyncResult {
  success: boolean
  netsuiteId?: string
  error?: string
}

async function logSync(
  entityType: string,
  entityId: string,
  action: SyncAction,
  status: SyncStatus,
  netsuiteId?: string,
  requestPayload?: Record<string, unknown>,
  responsePayload?: Record<string, unknown>,
  errorMessage?: string
) {
  const supabase = await createClient()
  
  await supabase.from('netsuite_sync_log').insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    status,
    netsuite_id: netsuiteId,
    request_payload: requestPayload,
    response_payload: responsePayload,
    error_message: errorMessage,
    completed_at: status !== 'pending' ? new Date().toISOString() : null,
  })
}

// Sync Consignment to NetSuite
export async function syncConsignmentToNetSuite(
  consignment: Consignment,
  action: SyncAction = 'create'
): Promise<SyncResult> {
  try {
    const client = getNetSuiteClient()
    
    // Map consignment to NetSuite custom record format
    const netsuiteData = {
      custrecord_lt_tracking_number: consignment.tracking_number,
      custrecord_lt_status: consignment.status,
      custrecord_lt_type: consignment.type,
      custrecord_lt_sender_name: consignment.sender_name,
      custrecord_lt_sender_address: consignment.sender_address,
      custrecord_lt_sender_city: consignment.sender_city,
      custrecord_lt_sender_country: consignment.sender_country,
      custrecord_lt_receiver_name: consignment.receiver_name,
      custrecord_lt_receiver_address: consignment.receiver_address,
      custrecord_lt_receiver_city: consignment.receiver_city,
      custrecord_lt_receiver_country: consignment.receiver_country,
      custrecord_lt_parcels_count: consignment.parcels_count,
      custrecord_lt_total_weight: consignment.total_weight_kg,
      custrecord_lt_pickup_date: consignment.pickup_date,
      custrecord_lt_expected_delivery: consignment.expected_delivery_date,
      custrecord_lt_actual_delivery: consignment.actual_delivery_date,
    }

    let result
    if (action === 'create') {
      result = await client.createRecord('customrecord_lt_consignment', netsuiteData)
    } else if (action === 'update' && consignment.netsuite_id) {
      result = await client.updateRecord('customrecord_lt_consignment', consignment.netsuite_id, netsuiteData)
    } else if (action === 'delete' && consignment.netsuite_id) {
      result = await client.deleteRecord('customrecord_lt_consignment', consignment.netsuite_id)
    }

    if (result?.error) {
      await logSync('consignment', consignment.id, action, 'failed', undefined, netsuiteData, undefined, result.error)
      return { success: false, error: result.error }
    }

    const netsuiteId = result?.data?.id || consignment.netsuite_id
    await logSync('consignment', consignment.id, action, 'success', netsuiteId, netsuiteData, result?.data as Record<string, unknown>)

    // Update local record with NetSuite ID
    if (netsuiteId && action === 'create') {
      const supabase = await createClient()
      await supabase
        .from('consignments')
        .update({ netsuite_id: netsuiteId })
        .eq('id', consignment.id)
    }

    return { success: true, netsuiteId }
  } catch (error) {
    const errorMessage = (error as Error).message
    await logSync('consignment', consignment.id, action, 'failed', undefined, undefined, undefined, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Sync Company to NetSuite (as Customer or Vendor)
export async function syncCompanyToNetSuite(
  company: Company,
  action: SyncAction = 'create'
): Promise<SyncResult> {
  try {
    const client = getNetSuiteClient()
    
    const recordType = company.type === 'customer' ? 'customer' : 'vendor'
    
    const netsuiteData = {
      companyname: company.name,
      email: company.email,
      phone: company.phone,
      addr1: company.address,
      city: company.city,
      state: company.state,
      country: company.country,
      zip: company.postal_code,
    }

    let result
    if (action === 'create') {
      result = await client.createRecord(recordType, netsuiteData)
    } else if (action === 'update' && company.netsuite_id) {
      result = await client.updateRecord(recordType, company.netsuite_id, netsuiteData)
    }

    if (result?.error) {
      await logSync('company', company.id, action, 'failed', undefined, netsuiteData, undefined, result.error)
      return { success: false, error: result.error }
    }

    const netsuiteId = result?.data?.id || company.netsuite_id
    await logSync('company', company.id, action, 'success', netsuiteId, netsuiteData, result?.data as Record<string, unknown>)

    if (netsuiteId && action === 'create') {
      const supabase = await createClient()
      await supabase
        .from('companies')
        .update({ netsuite_id: netsuiteId })
        .eq('id', company.id)
    }

    return { success: true, netsuiteId }
  } catch (error) {
    const errorMessage = (error as Error).message
    await logSync('company', company.id, action, 'failed', undefined, undefined, undefined, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Sync Truck to NetSuite (as Asset)
export async function syncTruckToNetSuite(
  truck: Truck,
  action: SyncAction = 'create'
): Promise<SyncResult> {
  try {
    const client = getNetSuiteClient()
    
    const netsuiteData = {
      custrecord_lt_truck_reg: truck.registration_number,
      custrecord_lt_truck_make: truck.make,
      custrecord_lt_truck_model: truck.model,
      custrecord_lt_truck_year: truck.year,
      custrecord_lt_truck_capacity: truck.capacity_kg,
      custrecord_lt_truck_driver: truck.driver_name,
      custrecord_lt_truck_driver_phone: truck.driver_phone,
      custrecord_lt_truck_status: truck.status,
    }

    let result
    if (action === 'create') {
      result = await client.createRecord('customrecord_lt_truck', netsuiteData)
    } else if (action === 'update' && truck.netsuite_id) {
      result = await client.updateRecord('customrecord_lt_truck', truck.netsuite_id, netsuiteData)
    }

    if (result?.error) {
      await logSync('truck', truck.id, action, 'failed', undefined, netsuiteData, undefined, result.error)
      return { success: false, error: result.error }
    }

    const netsuiteId = result?.data?.id || truck.netsuite_id
    await logSync('truck', truck.id, action, 'success', netsuiteId, netsuiteData, result?.data as Record<string, unknown>)

    if (netsuiteId && action === 'create') {
      const supabase = await createClient()
      await supabase
        .from('trucks')
        .update({ netsuite_id: netsuiteId })
        .eq('id', truck.id)
    }

    return { success: true, netsuiteId }
  } catch (error) {
    const errorMessage = (error as Error).message
    await logSync('truck', truck.id, action, 'failed', undefined, undefined, undefined, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Bulk sync all unsynced records
export async function syncAllPendingRecords(): Promise<{
  consignments: number
  companies: number
  trucks: number
  errors: string[]
}> {
  const supabase = await createClient()
  const errors: string[] = []
  let consignmentCount = 0
  let companyCount = 0
  let truckCount = 0

  // Sync consignments without NetSuite ID
  const { data: consignments } = await supabase
    .from('consignments')
    .select('*')
    .is('netsuite_id', null)
    .limit(100)

  for (const consignment of consignments || []) {
    const result = await syncConsignmentToNetSuite(consignment)
    if (result.success) {
      consignmentCount++
    } else if (result.error) {
      errors.push(`Consignment ${consignment.tracking_number}: ${result.error}`)
    }
  }

  // Sync companies without NetSuite ID
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .is('netsuite_id', null)
    .limit(100)

  for (const company of companies || []) {
    const result = await syncCompanyToNetSuite(company)
    if (result.success) {
      companyCount++
    } else if (result.error) {
      errors.push(`Company ${company.name}: ${result.error}`)
    }
  }

  // Sync trucks without NetSuite ID
  const { data: trucks } = await supabase
    .from('trucks')
    .select('*')
    .is('netsuite_id', null)
    .limit(100)

  for (const truck of trucks || []) {
    const result = await syncTruckToNetSuite(truck)
    if (result.success) {
      truckCount++
    } else if (result.error) {
      errors.push(`Truck ${truck.registration_number}: ${result.error}`)
    }
  }

  return {
    consignments: consignmentCount,
    companies: companyCount,
    trucks: truckCount,
    errors,
  }
}
