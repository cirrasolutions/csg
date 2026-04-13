'use client'

import { useState, useEffect } from 'react'
import { enrollMfa, verifyMfaEnrollment } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'
import { Shield, Check, Copy } from 'lucide-react'
import Image from 'next/image'

export default function MfaSetupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function initMfa() {
      const result = await enrollMfa()
      
      if (result.error) {
        setError(result.error)
      } else {
        setQrCode(result.qrCode || null)
        setSecret(result.secret || null)
        setFactorId(result.factorId || null)
      }
      setIsLoading(false)
    }
    
    initMfa()
  }, [])

  async function handleVerify() {
    if (!factorId || !verificationCode) return
    
    setIsVerifying(true)
    setError(null)
    
    const result = await verifyMfaEnrollment(factorId, verificationCode)
    
    if (result.error) {
      setError(result.error)
      setIsVerifying(false)
    } else {
      router.push('/admin')
    }
  }

  function copySecret() {
    if (secret) {
      navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Setup Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <Image 
                  src={qrCode} 
                  alt="MFA QR Code" 
                  width={200} 
                  height={200}
                  className="rounded"
                />
              </div>
            )}
            
            {secret && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Or enter this code manually:
                </p>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-sm font-mono break-all">{secret}</code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={copySecret}
                    className="shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
            
            <Field>
              <FieldLabel htmlFor="verificationCode">Verification Code</FieldLabel>
              <Input
                id="verificationCode"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </Field>
            
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            
            <Button 
              onClick={handleVerify} 
              className="w-full" 
              disabled={isVerifying || verificationCode.length !== 6}
            >
              {isVerifying ? <Spinner className="mr-2" /> : null}
              Verify & Enable 2FA
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => router.push('/admin')}
            >
              Skip for Now
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
