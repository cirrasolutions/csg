import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Webhook endpoint for NetSuite to push updates
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get('x-netsuite-webhook-secret')
    if (webhookSecret !== process.env.NETSUITE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
    }

    const payload = await request.json()
    const supabase = await createClient()

    // Handle different event types from NetSuite
    switch (payload.eventType) {
      case 'consignment.updated':
        await handleConsignmentUpdate(supabase, payload.data)
        break
      case 'consignment.delivered':
        await handleConsignmentDelivered(supabase, payload.data)
        break
      case 'customer.created':
        await handleCustomerCreated(supabase, payload.data)
        break
      case 'customer.updated':
        await handleCustomerUpdated(supabase, payload.data)
        break
      default:
        console.log('Unknown webhook event type:', payload.eventType)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      message: (error as Error).message
    }, { status: 500 })
  }
}

async function handleConsignmentUpdate(supabase: Awaited<ReturnType<typeof createClient>>, data: {
  netsuiteId: string
  status?: string
  trackingNumber?: string
}) {
  const { netsuiteId, status, trackingNumber } = data
  
  // Find and update the consignment
  const { error } = await supabase
    .from('consignments')
    .update({
      status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('netsuite_id', netsuiteId)

  if (error) {
    console.error('Failed to update consignment from NetSuite:', error)
  }
}

async function handleConsignmentDelivered(supabase: Awaited<ReturnType<typeof createClient>>, data: {
  netsuiteId: string
  deliveryDate: string
}) {
  const { netsuiteId, deliveryDate } = data
  
  const { error } = await supabase
    .from('consignments')
    .update({
      status: 'delivered',
      actual_delivery_date: deliveryDate,
      updated_at: new Date().toISOString(),
    })
    .eq('netsuite_id', netsuiteId)

  if (error) {
    console.error('Failed to mark consignment as delivered:', error)
  }
}

async function handleCustomerCreated(supabase: Awaited<ReturnType<typeof createClient>>, data: {
  netsuiteId: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
}) {
  const { netsuiteId, name, email, phone, address, city, country } = data
  
  // Check if company already exists
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('netsuite_id', netsuiteId)
    .single()

  if (existing) {
    return // Already exists
  }

  const { error } = await supabase
    .from('companies')
    .insert({
      name,
      type: 'customer',
      email,
      phone,
      address,
      city,
      country,
      netsuite_id: netsuiteId,
    })

  if (error) {
    console.error('Failed to create company from NetSuite:', error)
  }
}

async function handleCustomerUpdated(supabase: Awaited<ReturnType<typeof createClient>>, data: {
  netsuiteId: string
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
}) {
  const { netsuiteId, ...updateData } = data
  
  const { error } = await supabase
    .from('companies')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('netsuite_id', netsuiteId)

  if (error) {
    console.error('Failed to update company from NetSuite:', error)
  }
}
