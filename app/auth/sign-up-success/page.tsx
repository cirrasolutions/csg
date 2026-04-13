import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Mail className="h-7 w-7 text-accent" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            {"We've sent you a confirmation link to verify your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the link in your email to complete your registration. 
            If you don&apos;t see it, check your spam folder.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">
              Return to Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
