'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import type { Consignment } from '@/lib/types'

export default function NewMissingReportPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consignments, setConsignments] = useState<Consignment[]>([])

  useEffect(() => {
    async function fetchConsignments() {
      const supabase = createClient()
      const { data } = await supabase
        .from('consignments')
        .select('*')
        .order('tracking_number')
      setConsignments(data || [])
    }
    fetchConsignments()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()

    const reportData = {
      consignment_id: formData.get('consignment_id') as string,
      description: formData.get('description') as string,
      items_missing: formData.get('items_missing') as string || null,
      estimated_value: parseFloat(formData.get('estimated_value') as string) || null,
      status: 'open' as const,
      reported_by: user?.id,
    }

    const { error: insertError } = await supabase
      .from('missing_reports')
      .insert(reportData)

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push('/admin/missing-reports')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Missing Report</h1>
        <p className="text-muted-foreground">Report a missing or damaged consignment</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="consignment_id">Consignment</FieldLabel>
                <select 
                  id="consignment_id" 
                  name="consignment_id"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a consignment</option>
                  {consignments.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tracking_number} - {c.sender_name} → {c.receiver_name}
                    </option>
                  ))}
                </select>
              </Field>
              
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea 
                  id="description" 
                  name="description" 
                  required
                  placeholder="Describe what is missing or damaged..."
                  rows={4}
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="items_missing">Items Missing</FieldLabel>
                <Textarea 
                  id="items_missing" 
                  name="items_missing" 
                  placeholder="List specific items if known..."
                  rows={3}
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="estimated_value">Estimated Value ($)</FieldLabel>
                <Input 
                  id="estimated_value" 
                  name="estimated_value" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder="0.00"
                />
              </Field>
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Spinner className="mr-2" />}
                  Submit Report
                </Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
