'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthResult = {
  error?: string
  success?: boolean
  requiresMfa?: boolean
  factorId?: string
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if MFA is enrolled
  const { data: factors } = await supabase.auth.mfa.listFactors()
  
  if (factors && factors.totp && factors.totp.length > 0) {
    const totpFactor = factors.totp[0]
    return { 
      requiresMfa: true, 
      factorId: totpFactor.id 
    }
  }

  revalidatePath('/', 'layout')
  
  // Redirect based on user role
  const userRole = data.user?.user_metadata?.role
  if (userRole === 'customer') {
    redirect('/customer')
  } else {
    redirect('/admin')
  }
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string || 'customer'
  const companyName = formData.get('companyName') as string
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        full_name: fullName,
        phone,
        role,
        company_name: companyName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user && !data.session) {
    // Email confirmation required
    redirect('/auth/sign-up-success')
  }

  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function verifyMfaCode(factorId: string, code: string): Promise<AuthResult> {
  const supabase = await createClient()
  
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  })

  if (challengeError) {
    return { error: challengeError.message }
  }

  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  
  // Redirect based on user role
  const { data: { user } } = await supabase.auth.getUser()
  const userRole = user?.user_metadata?.role
  if (userRole === 'customer') {
    redirect('/customer')
  } else {
    redirect('/admin')
  }
}

export async function enrollMfa(): Promise<{ qrCode?: string; secret?: string; factorId?: string; error?: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'LogiTrack Authenticator',
  })

  if (error) {
    return { error: error.message }
  }

  return {
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    factorId: data.id,
  }
}

export async function verifyMfaEnrollment(factorId: string, code: string): Promise<AuthResult> {
  const supabase = await createClient()
  
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  })

  if (challengeError) {
    return { error: challengeError.message }
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function unenrollMfa(factorId: string): Promise<AuthResult> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.mfa.unenroll({
    factorId,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
