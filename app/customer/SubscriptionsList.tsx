'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Subscription = {
  id: string
  product_id: string
  quantity: number
  notes: string | null
  is_paused: boolean
  paused_from: string | null
  paused_to: string | null
  created_at: string
  products: {
    name: string
    unit: string
    photo_url: string | null
  } | null
}

export default function SubscriptionsList({ subscriptions }: { subscriptions: Subscription[] }) {
  if (subscriptions.length === 0) return null

  return (
    <div className="space-y-2.5">
      {subscriptions.map(sub => (
        <SubscriptionCard key={sub.id} sub={sub} />
      ))}
    </div>
  )
}

function SubscriptionCard({ sub }: { sub: Subscription }) {
  const [showPause, setShowPause] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [pauseFrom, setPauseFrom] = useState('')
  const [pauseTo, setPauseTo] = useState('')
  const [loading, setLoading] = useState(false)

  const isCurrentlyPaused =
    sub.is_paused &&
    sub.paused_from &&
    sub.paused_to &&
    new Date() >= new Date(sub.paused_from) &&
    new Date() <= new Date(sub.paused_to)

  async function handlePause() {
    if (!pauseFrom || !pauseTo) return
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('subscriptions')
      .update({ is_paused: true, paused_from: pauseFrom, paused_to: pauseTo })
      .eq('id', sub.id)
    setLoading(false)
    window.location.reload()
  }

  async function handleResume() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('subscriptions')
      .update({ is_paused: false, paused_from: null, paused_to: null })
      .eq('id', sub.id)
    setLoading(false)
    window.location.reload()
  }

  async function handleCancel() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('subscriptions').delete().eq('id', sub.id)
    setLoading(false)
    window.location.reload()
  }

  if (showCancelConfirm) {
    return (
      <div className="bg-white rounded-2xl p-4 space-y-3">
        <p className="font-medium text-[14px] text-[#2C2C2A]">
          Cancel your {sub.products?.name} subscription?
        </p>
        <p className="text-[12px] text-[#8a8578]">
          You'll stop getting this automatically. Today's order won't be affected.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowCancelConfirm(false)}
            className="flex-1 bg-[#F5F2EA] text-[#2C2C2A] py-3 rounded-xl font-medium text-[13px]"
          >
            Keep it
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-[#B0463C] text-white py-3 rounded-xl font-medium text-[13px] disabled:opacity-50"
          >
            {loading ? 'Cancelling...' : 'Yes, cancel'}
          </button>
        </div>
      </div>
    )
  }

  if (showPause) {
    return (
      <div className="bg-white rounded-2xl p-4 space-y-3">
        <p className="font-medium text-[14px] text-[#2C2C2A]">Pause {sub.products?.name}</p>
        <div className="flex gap-2.5">
          <div className="flex-1">
            <label className="block text-[11px] text-[#8a8578] mb-1">From</label>
            <input
              type="date"
              value={pauseFrom}
              onChange={e => setPauseFrom(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] text-[#8a8578] mb-1">To</label>
            <input
              type="date"
              value={pauseTo}
              onChange={e => setPauseTo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C]"
            />
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowPause(false)}
            className="flex-1 bg-[#F5F2EA] text-[#2C2C2A] py-3 rounded-xl font-medium text-[13px]"
          >
            Cancel
          </button>
          <button
            onClick={handlePause}
            disabled={loading || !pauseFrom || !pauseTo}
            className="flex-1 bg-[#1E4D8C] text-white py-3 rounded-xl font-medium text-[13px] disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Confirm pause'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E6F1FB] flex items-center justify-center text-base overflow-hidden flex-shrink-0">
          {sub.products?.photo_url ? (
            <img src={sub.products.photo_url} alt="" className="w-full h-full object-cover" />
          ) : '🥛'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-[#2C2C2A]">{sub.products?.name} · {sub.quantity} daily</p>
          <p className="text-[12px] text-[#8a8578] mt-0.5">
            {isCurrentlyPaused
              ? `Paused until ${new Date(sub.paused_to!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
              : 'Active'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-[#F0EDE5]">
        {isCurrentlyPaused ? (
          <button
            onClick={handleResume}
            disabled={loading}
            className="flex-1 bg-[#E1F5EE] text-[#0F6E56] py-2.5 rounded-xl font-medium text-[12px] active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? '...' : 'Resume now'}
          </button>
        ) : (
          <button
            onClick={() => setShowPause(true)}
            className="flex-1 bg-[#F5F2EA] text-[#1E4D8C] py-2.5 rounded-xl font-medium text-[12px] active:scale-95 transition-transform"
          >
            Pause dates
          </button>
        )}
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="flex-1 bg-[#F5F2EA] text-[#B0463C] py-2.5 rounded-xl font-medium text-[12px] active:scale-95 transition-transform"
        >
          Cancel sub
        </button>
      </div>
    </div>
  )
}