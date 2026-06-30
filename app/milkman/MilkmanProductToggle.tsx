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

  async function toggle(productId: string) {
    const newValue = !active[productId]
    setActive(prev => ({ ...prev, [productId]: newValue }))
    setSaving(productId)

    const supabase = createClient()
    const existing = milkmanProducts.find(mp => mp.product_id === productId)

    if (existing) {
      await supabase.from('milkman_products').update({ is_active: newValue }).eq('id', existing.id)
    } else {
      await supabase.from('milkman_products').insert({ milkman_id: milkmanId, product_id: productId, is_active: newValue })
    }

    setSaving(null)
  }

  return (
    <div className="bg-white rounded-2xl divide-y divide-[#F0EDE5]">
      {allProducts.map(p => (
        <div key={p.id} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F1FB] flex items-center justify-center text-base overflow-hidden flex-shrink-0">
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
              ) : '🥛'}
            </div>
            <div>
              <p className="font-medium text-[14px] text-[#2C2C2A]">{p.name}</p>
              <p className="text-[12px] text-[#8a8578]">{p.unit} · ₹{p.price}</p>
            </div>
          </div>
          <button
            onClick={() => toggle(p.id)}
            disabled={saving === p.id}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              active[p.id] ? 'bg-[#1E4D8C]' : 'bg-[#E5E1D6]'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              active[p.id] ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      ))}
    </div>
  )
}