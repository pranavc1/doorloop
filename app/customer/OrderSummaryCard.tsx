'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const statusConfig: Record<string, { dot: string; label: string; text: string }> = {
  pending: { dot: 'bg-amber-500', label: 'Pending', text: 'text-amber-700' },
  delivered: { dot: 'bg-green-600', label: 'Delivered', text: 'text-green-700' },
}

export default function OrderSummaryCard({
  order,
  isPastCutoff,
}: {
  order: any
  isPastCutoff: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [quantity, setQuantity] = useState(order.quantity)
  const [notes, setNotes] = useState(order.notes || '')
  const [loading, setLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const isDelivered = order.status === 'delivered'
  const canEdit = !isDelivered
  const status = statusConfig[order.status] || statusConfig.pending

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ quantity, notes: notes || null })
      .eq('id', order.id)
    setLoading(false)
    setIsEditing(false)
    window.location.reload()
  }

  async function handleCancel() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order.id)
    setLoading(false)
    window.location.reload()
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border-2 border-blue-300 px-5 py-5 space-y-4">
        <div className="flex items-center gap-3">
          {order.products?.photo_url ? (
            <img src={order.products.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#F5F4F0] flex items-center justify-center text-xl">🥛</div>
          )}
          <p className="font-semibold text-[#1C1917] text-lg">{order.products?.name}</p>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setQuantity((q: number) => Math.max(1, q - 1))}
            className="w-14 h-14 rounded-xl bg-[#F5F4F0] text-[#1C1917] text-2xl font-bold active:scale-95"
          >
            −
          </button>
          <span className="text-2xl font-bold text-[#1C1917] w-10 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((q: number) => q + 1)}
            className="w-14 h-14 rounded-xl bg-[#F5F4F0] text-[#1C1917] text-2xl font-bold active:scale-95"
          >
            +
          </button>
        </div>

        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full px-4 py-3.5 rounded-xl border border-[#EDEAE3] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />

        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-[#F5F4F0] text-[#1C1917] py-3.5 rounded-xl font-semibold text-base"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-base disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    )
  }

  if (showCancelConfirm) {
    return (
      <div className="bg-white rounded-2xl border-2 border-red-300 px-5 py-5 space-y-3">
        <p className="font-semibold text-[#1C1917] text-lg">
          Cancel {order.products?.name} ({order.quantity}) for {isPastCutoff ? 'tomorrow' : 'today'}?
        </p>
        <p className="text-base text-[#78716C]">This can't be undone after the cutoff time.</p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => setShowCancelConfirm(false)}
            className="flex-1 bg-[#F5F4F0] text-[#1C1917] py-3.5 rounded-xl font-semibold text-base"
          >
            Keep order
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-3.5 rounded-xl font-semibold text-base disabled:opacity-50"
          >
            {loading ? 'Cancelling...' : 'Yes, cancel'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl px-5 py-4 border border-[#EDEAE3]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {order.products?.photo_url ? (
            <img src={order.products.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#F5F4F0] flex items-center justify-center text-xl">🥛</div>
          )}
          <div>
            <p className="font-semibold text-[#1C1917] text-base">{order.products?.name}</p>
            <p className="text-sm text-[#78716C]">{order.products?.unit} × {order.quantity}</p>
            {order.notes && (
              <p className="text-sm text-blue-600 mt-0.5">📝 {order.notes}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className={`text-sm font-semibold ${status.text}`}>{status.label}</span>
        </div>
      </div>

      {canEdit && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-[#EDEAE3]">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 bg-[#EFF4FF] text-blue-700 py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
          >
            Edit order
          </button>
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
          >
            Cancel order
          </button>
        </div>
      )}

      {isDelivered && (
        <p className="text-sm text-[#78716C] mt-3 pt-3 border-t border-[#EDEAE3]">
          Already delivered — can't be changed
        </p>
      )}
    </div>
  )
}