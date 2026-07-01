import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service role to bypass RLS — safe because this is our own server code
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Tomorrow's date in IST
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istNow = new Date(now.getTime() + istOffset)
  const tomorrow = new Date(istNow.getTime() + 24 * 60 * 60 * 1000)
  const tomorrowDate = tomorrow.toISOString().split('T')[0]

  const { data: subscriptions, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('is_active', true)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: 'No active subscriptions', created: 0 })
  }

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (const sub of subscriptions) {
    if (sub.is_paused && sub.paused_from && sub.paused_to) {
      if (tomorrowDate >= sub.paused_from && tomorrowDate <= sub.paused_to) {
        skipped++
        continue
      }
    }

    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', sub.user_id)
      .eq('product_id', sub.product_id)
      .eq('date', tomorrowDate)
      .neq('status', 'cancelled')
      .single()

    if (existing) {
      skipped++
      continue
    }

    const { error: insertError } = await supabase.from('orders').insert({
      user_id: sub.user_id,
      product_id: sub.product_id,
      quantity: sub.quantity,
      date: tomorrowDate,
      notes: sub.notes,
      status: 'pending',
      subscription_id: sub.id,
    })

    if (insertError) {
      errors.push(`sub ${sub.id}: ${insertError.message}`)
    } else {
      created++
    }
  }

  return NextResponse.json({ date: tomorrowDate, created, skipped, errors })
}