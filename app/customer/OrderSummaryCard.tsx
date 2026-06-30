'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const statusConfig: Record<string, { dot: string; label: string; bg: string; text: string }> = {
  pending: { dot: '#BA7517', label: 'On the way', bg: '#FAEEDA', text: '#854F0B' },
  delivered: { dot: '#0F6E56', label: 'Delivered', bg: '#E1F5EE', text: '#0F6E56' },
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
      <div className="bg-white rounded-2xl p-4 space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F1FB] flex items-center justify-center text-lg overflow-hidden">
            {order.products?.photo_url ? (
              <img src={order.products.photo_url} alt="" className="w-full h-full object-cover" />
            ) : '🥛'}
          </div>
          <p className="font-medium text-[15px] text-[#2C2C2A]">{order.products?.name}</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity((q: number) => Math.max(1, q - 1))}
            className="w-12 h-12 rounded-xl bg-[#F5F2EA] text-[#2C2C2A] text-xl font-medium active:scale-95"
          >
            −
          </button>
          <span className="text-xl font-medium text-[#2C2C2A] w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((q: number) => q + 1)}
            className="w-12 h-12 rounded-xl bg-[#F5F2EA] text-[#2C2C2A] text-xl font-medium active:scale-95"
          >
            +
          </button>
        </div>

        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any note?"
          className="w-full px-4 py-3 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[14px]"
        />

        <div className="flex gap-2.5">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-[#F5F2EA] text-[#2C2C2A] py-3 rounded-xl font-medium text-[14px]"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-[#1E4D8C] text-white py-3 rounded-xl font-medium text-[14px] disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  if (showCancelConfirm) {
    return (
      <div className="bg-white rounded-2xl p-4 space-y-3">
        <p className="font-medium text-[15px] text-[#2C2C2A]">
          Skip {order.products?.name} ({order.quantity}) for {isPastCutoff ? 'tomorrow' : 'today'}?
        </p>
        <p className="text-[13px] text-[#8a8578]">Can't undo this after the cutoff time.</p>
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={() => setShowCancelConfirm(false)}
            className="flex-1 bg-[#F5F2EA] text-[#2C2C2A] py-3 rounded-xl font-medium text-[14px]"
          >
            Keep order
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-[#B0463C] text-white py-3 rounded-xl font-medium text-[14px] disabled:opacity-50"
          >
            {loading ? 'Skipping...' : 'Yes, skip'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl px-4 py-3.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F1FB] flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
            {order.products?.photo_url ? (
              <img src={order.products.photo_url} alt="" className="w-full h-full object-cover" />
            ) : '🥛'}
          </div>
          <div>
            <p className="font-medium text-[14px] text-[#2C2C2A]">{order.products?.name} · {order.quantity}</p>
            <p className="text-[12px] text-[#8a8578] mt-0.5">
              {order.products?.unit}{order.notes ? ` · ${order.notes}` : ''}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-full"
          style={{ background: status.bg }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
          <span className="text-[11px] font-medium" style={{ color: status.text }}>{status.label}</span>
        </div>
      </div>

      {canEdit && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-[#F0EDE5]">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 bg-[#F5F2EA] text-[#1E4D8C] py-2.5 rounded-xl font-medium text-[13px] active:scale-95 transition-transform"
          >
            Change amount
          </button>
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 bg-[#F5F2EA] text-[#B0463C] py-2.5 rounded-xl font-medium text-[13px] active:scale-95 transition-transform"
          >
            Skip today
          </button>
        </div>
      )}

      {isDelivered && (
        <p className="text-[12px] text-[#8a8578] mt-3 pt-3 border-t border-[#F0EDE5]">
          Already delivered — can't be changed
        </p>
      )}
    </div>
  )
}