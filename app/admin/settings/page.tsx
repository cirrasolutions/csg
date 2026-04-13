import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Bell, Globe, Database } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const hasMfaEnabled = factors?.totp && factors.totp.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  {hasMfaEnabled ? 'Enabled' : 'Add an extra layer of security'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasMfaEnabled ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-accent font-medium">2FA is enabled</span>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link href="/auth/mfa-setup">
                  Enable 2FA
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Bell className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure email and push notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Configure</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>NetSuite Integration</CardTitle>
                <CardDescription>Connect to your NetSuite account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Configure API</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Database className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle>Data Export</CardTitle>
                <CardDescription>Export your data in various formats</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Export Data</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user?.user_metadata?.full_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{user?.user_metadata?.role?.replace('_', ' ') || 'System Admin'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Created</p>
              <p className="font-medium">{new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
