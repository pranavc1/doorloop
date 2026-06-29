'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Product = {
  id: string
  name: string
  unit: string
  price: number
  photo_url: string | null
}

type MilkmanProduct = {
  id: string
  milkman_id: string
  product_id: string
  is_active: boolean
}

export default function MilkmanProductToggle({
  allProducts,
  milkmanProducts,
  milkmanId,
}: {
  allProducts: Product[]
  milkmanProducts: MilkmanProduct[]
  milkmanId: string
}) {
  const initialState: Record<string, boolean> = {}
  for (const p of allProducts) {
    const existing = milkmanProducts.find(mp => mp.product_id === p.id)
    initialState[p.id] = existing ? existing.is_active : true
  }

  const [active, setActive] = useState<Record<string, boolean>>(initialState)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  async function toggle(productId: string) {
    const newValue = !active[productId]
    setActive(prev => ({ ...prev, [productId]: newValue }))
    setSaving(productId)

    const supabase = createClient()
    const existing = milkmanProducts.find(mp => mp.product_id === productId)

    if (existing) {
      await supabase
        .from('milkman_products')
        .update({ is_active: newValue })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('milkman_products')
        .insert({ milkman_id: milkmanId, product_id: productId, is_active: newValue })
    }

    setSaving(null)
    setSaved(productId)
    setTimeout(() => setSaved(null), 1500)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
      {allProducts.map(p => (
        <div key={p.id} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {p.photo_url ? (
              <img src={p.photo_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">🥛</div>
            )}
            <div>
              <p className="font-medium text-slate-800">{p.name}</p>
              <p className="text-sm text-slate-400">{p.unit} · ₹{p.price}</p>
            </div>
          </div>
          <button
            onClick={() => toggle(p.id)}
            disabled={saving === p.id}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              active[p.id] ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              active[p.id] ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      ))}
    </div>
  )
}