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
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-medium">cancelled</span>
        <button onClick={toggleStatus} disabled={loading} className="text-[12px] text-[#1E4D8C] font-medium">
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
        className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-colors active:scale-95 ${
          status === 'delivered' ? 'bg-[#FAEEDA] text-[#854F0B]' : 'bg-[#E1F5EE] text-[#0F6E56]'
        }`}
      >
        {loading ? '...' : status === 'delivered' ? 'Mark pending' : 'Mark delivered'}
      </button>
      <button
        onClick={cancelOrder}
        disabled={loading}
        className="px-3 py-2.5 rounded-xl text-[13px] font-medium bg-red-50 text-red-700 active:scale-95"
      >
        Cancel
      </button>
    </div>
  )
}