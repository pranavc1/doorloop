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
    await supabase.from('orders').update({ status: 'delivered' }).in('id', ids)
    setStatuses(prev => ({ ...prev, [key]: 'delivered' }))
    setLoading(null)
  }

  async function markPending(group: GroupedCustomer) {
    const key = `${group.userId}-${group.date}`
    setLoading(key)
    const supabase = createClient()
    const ids = group.orders.map(o => o.id)
    await supabase.from('orders').update({ status: 'pending' }).in('id', ids)
    setStatuses(prev => ({ ...prev, [key]: 'pending' }))
    setLoading(null)
  }

  const pendingList = groupedList.filter(g => statuses[`${g.userId}-${g.date}`] !== 'delivered')
  const deliveredList = groupedList.filter(g => statuses[`${g.userId}-${g.date}`] === 'delivered')

  function summary(orders: any[]) {
    return orders.map(o => `${o.products?.name} × ${o.quantity}`).join(', ')
  }

  return (
    <div className="space-y-2">
      {pendingList.map(g => {
        const key = `${g.userId}-${g.date}`
        const isLoading = loading === key
        const note = g.orders.find(o => o.notes)?.notes
        return (
          <div key={key} className="bg-white rounded-2xl px-3.5 py-3 flex items-center gap-3">
            <div className="w-[42px] h-[42px] rounded-xl bg-[#E6F1FB] flex items-center justify-center text-[12px] font-medium text-[#1E4D8C] flex-shrink-0">
              {g.flat}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#2C2C2A] flex items-center gap-1.5">
                {g.name}
                {g.date !== today && (
                  <span className="text-[10px] font-normal text-[#8a8578] bg-[#F5F2EA] px-1.5 py-0.5 rounded-full">tomorrow</span>
                )}
              </p>
              <p className="text-[12px] text-[#8a8578] mt-0.5 truncate">{summary(g.orders)}</p>
              {note && (
                <p className="text-[11px] text-[#1E4D8C] mt-0.5 truncate">📝 {note}</p>
              )}
            </div>
            <button
              onClick={() => markDelivered(g)}
              disabled={isLoading}
              className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform disabled:opacity-50"
              aria-label="Mark delivered"
            >
              {isLoading ? (
                <span className="text-[#0F6E56] text-xs">...</span>
              ) : (
                <span className="text-[#0F6E56] text-lg">✓</span>
              )}
            </button>
          </div>
        )
      })}

      {deliveredList.map(g => {
        const key = `${g.userId}-${g.date}`
        const isLoading = loading === key
        return (
          <div key={key} className="bg-white rounded-2xl px-3.5 py-3 flex items-center gap-3 opacity-50">
            <div className="w-[42px] h-[42px] rounded-xl bg-[#E1F5EE] flex items-center justify-center text-[12px] font-medium text-[#0F6E56] flex-shrink-0">
              {g.flat}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#2C2C2A]">{g.name} — done</p>
              <p className="text-[12px] text-[#8a8578] mt-0.5 truncate">{summary(g.orders)}</p>
            </div>
            <button
              onClick={() => markPending(g)}
              disabled={isLoading}
              className="text-[12px] text-[#8a8578] flex-shrink-0"
            >
              {isLoading ? '...' : 'Undo'}
            </button>
          </div>
        )
      })}

      {pendingList.length === 0 && deliveredList.length > 0 && (
        <div className="bg-[#E1F5EE] rounded-2xl px-4 py-3.5 text-center">
          <p className="text-[#0F6E56] font-medium text-[13px]">All done here 🎉</p>
        </div>
      )}
    </div>
  )
}