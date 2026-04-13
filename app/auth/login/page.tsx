'use client'

import { useState } from 'react'
import { signIn, verifyMfaCode } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { Truck, Shield } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState('')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    const result = await signIn(formData)
    
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result.requiresMfa && result.factorId) {
      setMfaRequired(true)
      setFactorId(result.factorId)
      setIsLoading(false)
    }
  }

  async function handleMfaVerify() {
    if (!factorId || !mfaCode) return
    
    setIsLoading(true)
    setError(null)
    
    const result = await verifyMfaCode(factorId, mfaCode)
    
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  if (mfaRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="mfaCode">Verification Code</FieldLabel>
                <Input
                  id="mfaCode"
                  type="text"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </Field>
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              
              <Button 
                onClick={handleMfaVerify} 
                className="w-full" 
                disabled={isLoading || mfaCode.length !== 6}
              >
                {isLoading ? <Spinner className="mr-2" /> : null}
                Verify
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  setMfaRequired(false)
                  setFactorId(null)
                  setMfaCode('')
                }}
              >
                Back to Login
              </Button>
            </FieldGroup>
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
            <Truck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to LogiTrack</CardTitle>
          <CardDescription>
            Sign in to manage your logistics operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <FieldGroup>
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </Field>
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2" /> : null}
                Sign In
              </Button>
            </FieldGroup>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{"Don't have an account? "}</span>
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
