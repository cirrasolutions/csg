import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomerHeader } from '@/components/customer/header'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
