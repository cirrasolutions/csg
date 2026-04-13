'use client'

import { useState } from 'react'
import { signUp } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { Truck, Building2, User } from 'lucide-react'

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<'system' | 'customer' | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    formData.set('role', userType === 'system' ? 'system_admin' : 'customer')
    
    const result = await signUp(formData)
    
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Truck className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Choose your account type to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={() => setUserType('system')}
              className="w-full p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left flex items-start gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">System User</h3>
                <p className="text-sm text-muted-foreground">
                  For logistics company staff to manage consignments, trucks, and deliveries
                </p>
              </div>
            </button>
            
            <button
              onClick={() => setUserType('customer')}
              className="w-full p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left flex items-start gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Customer</h3>
                <p className="text-sm text-muted-foreground">
                  Track your shipments, get delivery updates, and view consignment details
                </p>
              </div>
            </button>
            
            <div className="pt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            {userType === 'system' ? (
              <Building2 className="h-7 w-7 text-primary" />
            ) : (
              <User className="h-7 w-7 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {userType === 'system' ? 'System User Registration' : 'Customer Registration'}
          </CardTitle>
          <CardDescription>
            Fill in your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Acme Logistics"
                  required
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                />
              </Field>
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2" /> : null}
                Create Account
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                className="w-full"
                onClick={() => setUserType(null)}
              >
                Back
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
