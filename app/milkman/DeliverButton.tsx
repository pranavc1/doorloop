'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DeliverButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function markDelivered() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId)
    setDone(true)
    setTimeout(() => window.location.reload(), 800)
  }

  return (
    <button
      onClick={markDelivered}
      disabled={loading || done}
      className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-base disabled:opacity-50 active:scale-95 transition-transform"
    >
      {done ? '✓ Marked delivered!' : loading ? 'Updating...' : 'Mark as delivered'}
    </button>
  )
}