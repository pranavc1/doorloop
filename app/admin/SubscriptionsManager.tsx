'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Subscription = {
  id: string
  quantity: number
  is_paused: boolean
  paused_to: string | null
  users: { name: string; flat_number: string; building: string } | null
  products: { name: string; unit: string } | null
}

export default function SubscriptionsManager({ subscriptions }: { subscriptions: Subscription[] }) {
  const [list, setList] = useState(subscriptions)
  const [loading, setLoading] = useState<string | null>(null)

  async function cancelSubscription(id: string) {
  setLoading(id)
  const supabase = createClient()
  const { error } = await supabase
    .from('subscriptions')
    .update({ is_active: false })
    .eq('id', id)
  if (!error) {
    setList(prev => prev.filter(s => s.id !== id))
  }
  setLoading(null)
}

  if (list.length === 0) {
    return (
      <div className="bg-white rounded-2xl px-4 py-6 text-center">
        <p className="text-[#8a8578] text-[13px]">No active subscriptions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {list.map(sub => (
        <div key={sub.id} className="bg-white rounded-2xl px-4 py-3.5">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-[14px] text-[#2C2C2A]">{sub.users?.name}</p>
              <p className="text-[12px] text-[#8a8578]">{sub.users?.flat_number}, {sub.users?.building}</p>
              <p className="text-[13px] text-[#2C2C2A] mt-1">{sub.products?.name} × {sub.quantity} daily</p>
            </div>
            {sub.is_paused && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium flex-shrink-0">
                paused
              </span>
            )}
          </div>
          <button
            onClick={() => cancelSubscription(sub.id)}
            disabled={loading === sub.id}
            className="w-full mt-3 pt-3 border-t border-[#F0EDE5] text-[13px] font-medium text-[#B0463C] disabled:opacity-50"
          >
            {loading === sub.id ? 'Cancelling...' : 'Cancel this subscription'}
          </button>
        </div>
      ))}
    </div>
  )
}