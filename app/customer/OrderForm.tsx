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
    <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">Choose product</label>
        <div className="space-y-2">
          {products.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p.id)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-colors ${
                selectedProduct === p.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-lg">🥛</div>
                )}
                <div>
                  <p className={`font-medium ${selectedProduct === p.id ? 'text-blue-700' : 'text-slate-700'}`}>
                    {p.name}
                  </p>
                  <p className="text-sm text-slate-400">{p.unit}</p>
                </div>
              </div>
              <p className={`font-semibold ${selectedProduct === p.id ? 'text-blue-600' : 'text-slate-500'}`}>
                ₹{p.price}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">Quantity</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold active:scale-95 transition-transform"
          >
            −
          </button>
          <span className="text-2xl font-bold text-slate-800 w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold active:scale-95 transition-transform"
          >
            +
          </button>
          {selected && (
            <p className="text-slate-500 text-sm ml-2">= ₹{(selected.price * quantity).toFixed(0)}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Notes (optional)</label>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Leave at door"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <button
        onClick={handleOrder}
        disabled={loading || success}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50 active:scale-95 transition-transform"
      >
        {success ? '✓ Order placed!' : loading ? 'Placing order...' : 'Place order'}
      </button>
    </div>
  )
}