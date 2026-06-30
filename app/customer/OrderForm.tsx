'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'

const tileColors = ['#E1F5EE', '#FAECE7', '#FBEAF0', '#E6F1FB', '#FAEEDA', '#EEEDFE']

export default function OrderForm({ products, userId, orderDate }: {
  products: Product[],
  userId: string,
  orderDate: string
}) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [mode, setMode] = useState<'once' | 'daily'>('once')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function openTile(p: Product) {
    setActiveProduct(p)
    setQuantity(1)
    setNotes('')
    setMode('once')
    setError('')
  }

  async function handleOrder() {
    if (!activeProduct) return
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (mode === 'daily') {
      // Create subscription
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          product_id: activeProduct.id,
          quantity,
          notes: notes || null,
        })
        .select()
        .single()

      if (subError) {
        setError(subError.message)
        setLoading(false)
        return
      }

      // Also create today/tomorrow's order linked to this subscription
      const { error: orderError } = await supabase.from('orders').insert({
        user_id: userId,
        product_id: activeProduct.id,
        quantity,
        date: orderDate,
        notes: notes || null,
        status: 'pending',
        subscription_id: sub.id,
      })

      if (orderError) {
        setError(orderError.message)
        setLoading(false)
        return
      }
    } else {
      // One-time order
      const { error } = await supabase.from('orders').insert({
        user_id: userId,
        product_id: activeProduct.id,
        quantity,
        date: orderDate,
        notes: notes || null,
        status: 'pending',
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    setSuccess(true)
    setTimeout(() => { setSuccess(false); window.location.reload() }, 1100)
  }

  if (activeProduct) {
    return (
      <div className="bg-white rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F1FB] flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
            {activeProduct.photo_url ? (
              <img src={activeProduct.photo_url} alt="" className="w-full h-full object-cover" />
            ) : '🥛'}
          </div>
          <div>
            <p className="font-medium text-[15px] text-[#2C2C2A]">{activeProduct.name}</p>
            <p className="text-[12px] text-[#8a8578]">{activeProduct.unit} · ₹{activeProduct.price}</p>
          </div>
        </div>

        {/* One-time / Daily toggle */}
        <div className="flex bg-[#FBF8F2] rounded-xl p-1">
          <button
            onClick={() => setMode('once')}
            className={`flex-1 text-center py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              mode === 'once' ? 'bg-white text-[#2C2C2A]' : 'text-[#8a8578]'
            }`}
          >
            One-time
          </button>
          <button
            onClick={() => setMode('daily')}
            className={`flex-1 text-center py-2.5 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'daily' ? 'bg-white text-[#2C2C2A]' : 'text-[#8a8578]'
            }`}
          >
            <span>🔁</span> Daily
          </button>
        </div>

        {mode === 'daily' && (
          <p className="text-[12px] text-[#1E4D8C] bg-[#E6F1FB] px-3 py-2.5 rounded-xl">
            We'll order this for you every day automatically. You can pause or cancel anytime.
          </p>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-12 h-12 rounded-xl bg-[#F5F2EA] text-[#2C2C2A] text-xl font-medium active:scale-95 transition-transform"
          >
            −
          </button>
          <span className="text-xl font-medium text-[#2C2C2A] w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="w-12 h-12 rounded-xl bg-[#F5F2EA] text-[#2C2C2A] text-xl font-medium active:scale-95 transition-transform"
          >
            +
          </button>
          <p className="text-[#8a8578] text-[13px] ml-1">= ₹{(activeProduct.price * quantity).toFixed(0)}{mode === 'daily' ? '/day' : ''}</p>
        </div>

        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any note? e.g. leave at door"
          className="w-full px-4 py-3 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[14px]"
        />

        {error && (
          <div className="bg-red-50 text-red-700 text-[13px] px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="flex gap-2.5">
          <button
            onClick={() => setActiveProduct(null)}
            className="flex-1 bg-[#F5F2EA] text-[#2C2C2A] py-3.5 rounded-xl font-medium text-[14px]"
          >
            Back
          </button>
          <button
            onClick={handleOrder}
            disabled={loading || success}
            className="flex-1 bg-[#1E4D8C] text-white py-3.5 rounded-xl font-medium text-[14px] disabled:opacity-50 active:scale-95 transition-transform"
          >
            {success ? '✓ Done!' : loading ? 'Saving...' : mode === 'daily' ? 'Start subscription' : 'Confirm order'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 px-1.5 -mx-1.5">
      {products.map((p, i) => (
        <button
          key={p.id}
          onClick={() => openTile(p)}
          className="flex-shrink-0 w-[92px] bg-white rounded-2xl px-2.5 py-3 text-center active:scale-95 transition-transform"
        >
          <div
            className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-lg overflow-hidden"
            style={{ background: tileColors[i % tileColors.length] }}
          >
            {p.photo_url ? (
              <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
            ) : '🥛'}
          </div>
          <p className="text-[12px] font-medium text-[#2C2C2A] leading-tight">{p.name}</p>
          <p className="text-[11px] text-[#8a8578] mt-0.5">₹{p.price}</p>
        </button>
      ))}
    </div>
  )
}