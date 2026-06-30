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
  isLocked,
}: {
  order: any
  isPastCutoff: boolean
  isLocked: boolean
}) {
  const [editTarget, setEditTarget] = useState<'none' | 'today' | 'subscription'>('none')
  const [quantity, setQuantity] = useState(order.quantity)
  const [notes, setNotes] = useState(order.notes || '')
  const [loading, setLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const isDelivered = order.status === 'delivered'
  const canEdit = !isDelivered && !isLocked
  const isSubscribed = !!order.subscription_id
  const status = statusConfig[order.status] || statusConfig.pending

  async function handleSaveToday() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ quantity, notes: notes || null })
      .eq('id', order.id)
    setLoading(false)
    setEditTarget('none')
    window.location.reload()
  }

  async function handleSaveSubscription() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('subscriptions')
      .update({ quantity, notes: notes || null })
      .eq('id', order.subscription_id)
    // also update today's order to match immediately
    await supabase
      .from('orders')
      .update({ quantity, notes: notes || null })
      .eq('id', order.id)
    setLoading(false)
    setEditTarget('none')
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

  if (editTarget === 'today' || editTarget === 'subscription') {
    return (
      <div className="bg-white rounded-2xl p-4 space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F1FB] flex items-center justify-center text-lg overflow-hidden">
            {order.products?.photo_url ? (
              <img src={order.products.photo_url} alt="" className="w-full h-full object-cover" />
            ) : '🥛'}
          </div>
          <div>
            <p className="font-medium text-[15px] text-[#2C2C2A]">{order.products?.name}</p>
            <p className="text-[12px] text-[#8a8578]">
              {editTarget === 'subscription' ? 'Changing your daily subscription' : 'Changing just tomorrow'}
            </p>
          </div>
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
            onClick={() => setEditTarget('none')}
            className="flex-1 bg-[#F5F2EA] text-[#2C2C2A] py-3 rounded-xl font-medium text-[14px]"
          >
            Discard
          </button>
          <button
            onClick={editTarget === 'subscription' ? handleSaveSubscription : handleSaveToday}
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
        <p className="text-[13px] text-[#8a8578]">
          {isSubscribed ? "Your subscription continues — this only skips this one day." : "Can't undo this after the cutoff time."}
        </p>
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
          <div className="w-11 h-11 rounded-xl bg-[#E6F1FB] flex items-center justify-center text-lg overflow-hidden flex-shrink-0 relative">
            {order.products?.photo_url ? (
              <img src={order.products.photo_url} alt="" className="w-full h-full object-cover" />
            ) : '🥛'}
            {isSubscribed && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1E4D8C] border-2 border-white flex items-center justify-center text-[8px]">
                🔁
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-[14px] text-[#2C2C2A]">{order.products?.name} · {order.quantity}</p>
            <p className="text-[12px] text-[#8a8578] mt-0.5">
              {order.products?.unit} · ₹{((order.products?.price || 0) * order.quantity).toFixed(0)}
              {isSubscribed ? ' · Daily' : ''}
              {order.notes ? ` · ${order.notes}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-full" style={{ background: status.bg }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
          <span className="text-[11px] font-medium" style={{ color: status.text }}>{status.label}</span>
        </div>
      </div>

      {canEdit && !isSubscribed && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-[#F0EDE5]">
          <button
            onClick={() => { setEditTarget('today') }}
            className="flex-1 bg-[#F5F2EA] text-[#1E4D8C] py-2.5 rounded-xl font-medium text-[13px] active:scale-95 transition-transform"
          >
            Change quantity
          </button>
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 bg-[#F5F2EA] text-[#B0463C] py-2.5 rounded-xl font-medium text-[13px] active:scale-95 transition-transform"
          >
            Skip today
          </button>
        </div>
      )}

      {canEdit && isSubscribed && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-[#F0EDE5]">
          <button
            onClick={() => setEditTarget('today')}
            className="flex-1 bg-[#F5F2EA] text-[#1E4D8C] py-2.5 rounded-xl font-medium text-[12px] active:scale-95 transition-transform"
          >
            Just for tomorrow
          </button>
          <button
            onClick={() => setEditTarget('subscription')}
            className="flex-1 bg-[#F5F2EA] text-[#1E4D8C] py-2.5 rounded-xl font-medium text-[12px] active:scale-95 transition-transform"
          >
            Edit subscription
          </button>
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex-shrink-0 bg-[#F5F2EA] text-[#B0463C] py-2.5 px-3 rounded-xl font-medium text-[12px] active:scale-95 transition-transform"
          >
            Skip
          </button>
        </div>
      )}

      {isDelivered && (
        <p className="text-[12px] text-[#8a8578] mt-3 pt-3 border-t border-[#F0EDE5]">
          Already delivered — can't be changed
        </p>
      )}

      {!isDelivered && isLocked && (
  <p className="text-[12px] text-[#8a8578] mt-3 pt-3 border-t border-[#F0EDE5]">
    Cutoff time has passed — your order is locked in
  </p>
)}
    </div>
  )
}