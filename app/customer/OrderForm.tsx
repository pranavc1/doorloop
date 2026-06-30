'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'

export default function OrderForm({ products, userId, orderDate }: {
  products: Product[],
  userId: string,
  orderDate: string
}) {
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const selected = products.find(p => p.id === selectedProduct)

  async function handleOrder() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error } = await supabase.from('orders').insert({
      user_id: userId,
      product_id: selectedProduct,
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

    setSuccess(true)
    setTimeout(() => { setSuccess(false); window.location.reload() }, 1200)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EDEAE3] p-5 space-y-5">

      <div>
        <label className="block text-base font-semibold text-[#1C1917] mb-2.5">Choose product</label>
        <div className="space-y-2.5">
          {products.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p.id)}
              className={`w-full flex justify-between items-center px-4 py-3.5 rounded-xl border-2 transition-colors ${
                selectedProduct === p.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-[#EDEAE3] bg-[#FAFAF9]'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="w-11 h-11 rounded-lg object-cover" />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-[#EDEAE3] flex items-center justify-center text-lg">🥛</div>
                )}
                <div>
                  <p className={`font-semibold text-base ${selectedProduct === p.id ? 'text-blue-700' : 'text-[#1C1917]'}`}>
                    {p.name}
                  </p>
                  <p className="text-sm text-[#78716C]">{p.unit}</p>
                </div>
              </div>
              <p className={`font-bold text-base ${selectedProduct === p.id ? 'text-blue-600' : 'text-[#78716C]'}`}>
                ₹{p.price}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-base font-semibold text-[#1C1917] mb-2.5">Quantity</label>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-14 h-14 rounded-xl bg-[#F5F4F0] text-[#1C1917] text-2xl font-bold active:scale-95 transition-transform"
          >
            −
          </button>
          <span className="text-2xl font-bold text-[#1C1917] w-10 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="w-14 h-14 rounded-xl bg-[#F5F4F0] text-[#1C1917] text-2xl font-bold active:scale-95 transition-transform"
          >
            +
          </button>
          {selected && (
            <p className="text-[#78716C] text-base ml-2">= ₹{(selected.price * quantity).toFixed(0)}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-base font-semibold text-[#1C1917] mb-2">Notes (optional)</label>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Leave at door"
          className="w-full px-4 py-3.5 rounded-xl border border-[#EDEAE3] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-base px-4 py-3.5 rounded-xl">{error}</div>
      )}

      <button
        onClick={handleOrder}
        disabled={loading || success}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 active:scale-95 transition-transform"
      >
        {success ? '✓ Order placed!' : loading ? 'Placing order...' : 'Place order'}
      </button>
    </div>
  )
}