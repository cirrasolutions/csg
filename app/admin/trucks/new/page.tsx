'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

export default function NewTruckPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const truckData = {
      registration_number: formData.get('registration_number') as string,
      make: formData.get('make') as string || null,
      model: formData.get('model') as string || null,
      year: parseInt(formData.get('year') as string) || null,
      capacity_kg: parseFloat(formData.get('capacity_kg') as string) || null,
      capacity_volume_m3: parseFloat(formData.get('capacity_volume_m3') as string) || null,
      driver_name: formData.get('driver_name') as string || null,
      driver_phone: formData.get('driver_phone') as string || null,
      driver_license: formData.get('driver_license') as string || null,
      status: 'available' as const,
    }

    const { error: insertError } = await supabase
      .from('trucks')
      .insert(truckData)

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push('/admin/trucks')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Truck</h1>
        <p className="text-muted-foreground">Enter truck and driver details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="registration_number">Registration Number</FieldLabel>
                  <Input id="registration_number" name="registration_number" required placeholder="ABC-1234" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="make">Make</FieldLabel>
                    <Input id="make" name="make" placeholder="Volvo" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="model">Model</FieldLabel>
                    <Input id="model" name="model" placeholder="FH16" />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="year">Year</FieldLabel>
                  <Input id="year" name="year" type="number" min="1990" max="2030" placeholder="2023" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="capacity_kg">Capacity (kg)</FieldLabel>
                    <Input id="capacity_kg" name="capacity_kg" type="number" step="0.01" placeholder="10000" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="capacity_volume_m3">Volume (m3)</FieldLabel>
                    <Input id="capacity_volume_m3" name="capacity_volume_m3" type="number" step="0.01" placeholder="50" />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="driver_name">Driver Name</FieldLabel>
                  <Input id="driver_name" name="driver_name" placeholder="John Smith" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="driver_phone">Driver Phone</FieldLabel>
                  <Input id="driver_phone" name="driver_phone" type="tel" placeholder="+1 555-0123" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="driver_license">License Number</FieldLabel>
                  <Input id="driver_license" name="driver_license" placeholder="DL123456" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2" />}
            Add Truck
          </Button>
        </div>
      </form>
    </div>
  )
}
