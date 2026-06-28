import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if profile exists and get role
  const { data: profile } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.name) {
    redirect('/onboarding')
  }

  if (profile.role === 'admin') redirect('/admin')
  if (profile.role === 'milkman') redirect('/milkman')
  redirect('/customer')
}