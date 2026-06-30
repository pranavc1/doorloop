'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
      <div className="bg-white rounded-xl border-2 border-blue-200 px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          {order.products?.photo_url ? (
            <img src={order.products.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">🥛</div>
          )}
          <p className="font-medium text-slate-800">{order.products?.name}</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity((q: number) => Math.max(1, q - 1))}
            className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold active:scale-95"
          >
            −
          </button>
          <span className="text-xl font-bold text-slate-800 w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((q: number) => q + 1)}
            className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold active:scale-95"
          >
            +
          </button>
        </div>

        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    )
  }

  if (showCancelConfirm) {
    return (
      <div className="bg-white rounded-xl border-2 border-red-200 px-4 py-4 space-y-3">
        <p className="font-medium text-slate-800">
          Cancel {order.products?.name} ({order.quantity}) for {isPastCutoff ? 'tomorrow' : 'today'}?
        </p>
        <p className="text-sm text-slate-400">This can't be undone after the cutoff time.</p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCancelConfirm(false)}
            className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-medium"
          >
            Keep order
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Cancelling...' : 'Yes, cancel'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl px-4 py-3 border border-slate-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {order.products?.photo_url ? (
            <img src={order.products.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">🥛</div>
          )}
          <div>
            <p className="font-medium text-slate-800">{order.products?.name}</p>
            <p className="text-sm text-slate-400">{order.products?.unit} × {order.quantity}</p>
            {order.notes && (
              <p className="text-xs text-blue-600 mt-0.5">📝 {order.notes}</p>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {order.status}
        </span>
      </div>

      {canEdit && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="text-sm font-medium text-red-500"
          >
            Cancel order
          </button>
        </div>
      )}

      {isDelivered && (
        <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
          Already delivered — can't be changed
        </p>
      )}
    </div>
  )
}