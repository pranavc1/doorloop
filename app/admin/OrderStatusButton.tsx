'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OrderStatusButton({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function toggleStatus() {
    setLoading(true)
    const supabase = createClient()
    const newStatus = status === 'delivered' ? 'pending' : 'delivered'
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    setStatus(newStatus)
    setLoading(false)
  }

  async function cancelOrder() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
    setStatus('cancelled')
    setLoading(false)
  }

  if (status === 'cancelled') {
    return (
      <div className="flex gap-2 mt-3">
        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">cancelled</span>
        <button
          onClick={toggleStatus}
          disabled={loading}
          className="text-xs text-blue-600 underline"
        >
          Restore
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={toggleStatus}
        disabled={loading}
        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors active:scale-95 ${
          status === 'delivered'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        {loading ? '...' : status === 'delivered' ? 'Mark pending' : 'Mark delivered'}
      </button>
      <button
        onClick={cancelOrder}
        disabled={loading}
        className="px-3 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 active:scale-95"
      >
        Cancel
      </button>
    </div>
  )
}