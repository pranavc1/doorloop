'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type GroupedCustomer = {
  userId: string
  name: string
  flat: string
  building: string
  date: string
  orders: any[]
}

export default function MilkmanDeliveryList({
  groupedList,
  today,
}: {
  groupedList: GroupedCustomer[]
  today: string
}) {
  const [statuses, setStatuses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const g of groupedList) {
      const allDelivered = g.orders.every(o => o.status === 'delivered')
      map[`${g.userId}-${g.date}`] = allDelivered ? 'delivered' : 'pending'
    }
    return map
  })
  const [loading, setLoading] = useState<string | null>(null)

  async function markDelivered(group: GroupedCustomer) {
    const key = `${group.userId}-${group.date}`
    setLoading(key)
    const supabase = createClient()
    const ids = group.orders.map(o => o.id)
    await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .in('id', ids)
    setStatuses(prev => ({ ...prev, [key]: 'delivered' }))
    setLoading(null)
  }

  async function markPending(group: GroupedCustomer) {
    const key = `${group.userId}-${group.date}`
    setLoading(key)
    const supabase = createClient()
    const ids = group.orders.map(o => o.id)
    await supabase
      .from('orders')
      .update({ status: 'pending' })
      .in('id', ids)
    setStatuses(prev => ({ ...prev, [key]: 'pending' }))
    setLoading(null)
  }

  const pendingList = groupedList.filter(g =>
    statuses[`${g.userId}-${g.date}`] !== 'delivered'
  )
  const deliveredList = groupedList.filter(g =>
    statuses[`${g.userId}-${g.date}`] === 'delivered'
  )

  return (
    <div className="space-y-4">

      {/* Pending */}
      {pendingList.length > 0 && (
        <div className="space-y-2">
          {pendingList.map(g => {
            const key = `${g.userId}-${g.date}`
            const isLoading = loading === key
            return (
              <div key={key} className="bg-white rounded-xl border border-slate-100 px-4 py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                        {g.flat}
                      </span>
                      <span className="text-xs text-slate-400">
                        {g.date === today ? 'Today' : 'Tomorrow'}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 mt-1">{g.name}</p>
                    <div className="mt-1 space-y-0.5">
                      {g.orders.map(o => (
                        <div key={o.id}>
                          <p className="text-sm text-slate-600">
                            {o.products?.name} × {o.quantity}
                          </p>
                          {o.notes && (
                            <p className="text-xs text-blue-500">📝 {o.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => markDelivered(g)}
                    disabled={isLoading}
                    className="ml-3 flex-shrink-0 bg-green-500 text-white text-sm font-semibold px-3 py-2 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isLoading ? '...' : '✓ Done'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delivered */}
      {deliveredList.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-400 mb-2">Delivered ✓</p>
          <div className="space-y-2">
            {deliveredList.map(g => {
              const key = `${g.userId}-${g.date}`
              const isLoading = loading === key
              return (
                <div key={key} className="bg-white rounded-xl border border-slate-100 px-4 py-3 opacity-60">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                          {g.flat}
                        </span>
                        <span className="text-xs text-slate-400">
                          {g.date === today ? 'Today' : 'Tomorrow'}
                        </span>
                      </div>
                      <p className="font-medium text-slate-700 mt-1">{g.name}</p>
                      <p className="text-sm text-slate-400">
                        {g.orders.map(o => `${o.products?.name} ×${o.quantity}`).join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => markPending(g)}
                      disabled={isLoading}
                      className="ml-3 flex-shrink-0 text-xs text-slate-400 underline"
                    >
                      {isLoading ? '...' : 'Undo'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {pendingList.length === 0 && deliveredList.length > 0 && (
        <div className="bg-green-50 rounded-xl px-4 py-4 text-center">
          <p className="text-green-700 font-semibold">All deliveries done! 🎉</p>
        </div>
      )}
    </div>
  )
}