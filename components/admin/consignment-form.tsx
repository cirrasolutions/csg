'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import type { ConsignmentType, Truck } from '@/lib/types'

interface ConsignmentFormProps {
  type: ConsignmentType
  trucks: Truck[]
}

function generateTrackingNumber() {
  const prefix = 'LT'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export function ConsignmentForm({ type, trucks }: ConsignmentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const consignmentData = {
      tracking_number: generateTrackingNumber(),
      type,
      status: 'pending' as const,
      sender_name: formData.get('sender_name') as string,
      sender_address: formData.get('sender_address') as string,
      sender_city: formData.get('sender_city') as string,
      sender_state: formData.get('sender_state') as string,
      sender_country: formData.get('sender_country') as string,
      sender_postal_code: formData.get('sender_postal_code') as string,
      sender_phone: formData.get('sender_phone') as string,
      receiver_name: formData.get('receiver_name') as string,
      receiver_address: formData.get('receiver_address') as string,
      receiver_city: formData.get('receiver_city') as string,
      receiver_state: formData.get('receiver_state') as string,
      receiver_country: formData.get('receiver_country') as string,
      receiver_postal_code: formData.get('receiver_postal_code') as string,
      receiver_phone: formData.get('receiver_phone') as string,
      parcels_count: parseInt(formData.get('parcels_count') as string) || 1,
      total_weight_kg: parseFloat(formData.get('total_weight_kg') as string) || null,
      pickup_date: formData.get('pickup_date') as string || null,
      expected_delivery_date: formData.get('expected_delivery_date') as string || null,
      truck_id: formData.get('truck_id') as string || null,
      special_instructions: formData.get('special_instructions') as string || null,
      created_by: user?.id,
    }

    const { error: insertError } = await supabase
      .from('consignments')
      .insert(consignmentData)

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push(`/admin/${type}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sender Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="sender_name">Name / Company</FieldLabel>
                <Input id="sender_name" name="sender_name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="sender_address">Address</FieldLabel>
                <Input id="sender_address" name="sender_address" required />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="sender_city">City</FieldLabel>
                  <Input id="sender_city" name="sender_city" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sender_state">State</FieldLabel>
                  <Input id="sender_state" name="sender_state" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="sender_country">Country</FieldLabel>
                  <Input id="sender_country" name="sender_country" required defaultValue="USA" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sender_postal_code">Postal Code</FieldLabel>
                  <Input id="sender_postal_code" name="sender_postal_code" />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="sender_phone">Phone</FieldLabel>
                <Input id="sender_phone" name="sender_phone" type="tel" />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receiver Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="receiver_name">Name / Company</FieldLabel>
                <Input id="receiver_name" name="receiver_name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="receiver_address">Address</FieldLabel>
                <Input id="receiver_address" name="receiver_address" required />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="receiver_city">City</FieldLabel>
                  <Input id="receiver_city" name="receiver_city" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="receiver_state">State</FieldLabel>
                  <Input id="receiver_state" name="receiver_state" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="receiver_country">Country</FieldLabel>
                  <Input id="receiver_country" name="receiver_country" required defaultValue="USA" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="receiver_postal_code">Postal Code</FieldLabel>
                  <Input id="receiver_postal_code" name="receiver_postal_code" />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="receiver_phone">Phone</FieldLabel>
                <Input id="receiver_phone" name="receiver_phone" type="tel" />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="parcels_count">Number of Parcels</FieldLabel>
                <Input 
                  id="parcels_count" 
                  name="parcels_count" 
                  type="number" 
                  min="1" 
                  required 
                  defaultValue="1"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="total_weight_kg">Total Weight (kg)</FieldLabel>
                <Input 
                  id="total_weight_kg" 
                  name="total_weight_kg" 
                  type="number" 
                  step="0.01" 
                  min="0"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="truck_id">Assign Truck</FieldLabel>
                <select 
                  id="truck_id" 
                  name="truck_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a truck (optional)</option>
                  {trucks.filter(t => t.status === 'available').map((truck) => (
                    <option key={truck.id} value={truck.id}>
                      {truck.registration_number} - {truck.driver_name || 'No driver'}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="pickup_date">Pickup Date</FieldLabel>
                <Input id="pickup_date" name="pickup_date" type="date" />
              </Field>
              <Field>
                <FieldLabel htmlFor="expected_delivery_date">Expected Delivery Date</FieldLabel>
                <Input id="expected_delivery_date" name="expected_delivery_date" type="date" />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="special_instructions">Special Instructions</FieldLabel>
              <Textarea 
                id="special_instructions" 
                name="special_instructions" 
                placeholder="Any special handling instructions..."
                rows={3}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Spinner className="mr-2" />}
          Create Consignment
        </Button>
      </div>
    </form>
  )
}
