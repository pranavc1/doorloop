'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddProductForm() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('500ml')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleAdd() {
    if (!name || !price) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').insert({ name, price: parseFloat(price), unit })
    setName('')
    setPrice('')
    setSuccess(true)
    setTimeout(() => { setSuccess(false); window.location.reload() }, 1000)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
      <p className="font-medium text-slate-700">Add new product</p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Product name (e.g. Full Cream Milk)"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
      />
      <div className="flex gap-2">
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Price (₹)"
          type="number"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />
        <input
          value={unit}
          onChange={e => setUnit(e.target.value)}
          placeholder="Unit"
          className="w-28 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />
      </div>
      <button
        onClick={handleAdd}
        disabled={loading || !name || !price}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {success ? '✓ Added!' : loading ? 'Adding...' : 'Add Product'}
      </button>
    </div>
  )
}