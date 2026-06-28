'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CutoffEditor({
  currentHour,
  currentMinute,
}: {
  currentHour: number
  currentMinute: number
}) {
  const [hour, setHour] = useState(currentHour)
  const [minute, setMinute] = useState(currentMinute)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function formatTime(h: number, m: number) {
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 === 0 ? 12 : h % 12
    const displayMinute = m.toString().padStart(2, '0')
    return `${displayHour}:${displayMinute} ${period}`
  }

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('settings')
      .update({ cutoff_hour: hour, cutoff_minute: minute, updated_at: new Date().toISOString() })
      .eq('id', 'global')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
      <div>
        <p className="font-medium text-slate-700 mb-1">Order cutoff time</p>
        <p className="text-sm text-slate-400">Customers cannot order for today after this time</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Hour */}
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">Hour</label>
          <select
            value={hour}
            onChange={e => setHour(parseInt(e.target.value))}
            className="w-full px-3 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')} ({i === 0 ? 'midnight' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`})
              </option>
            ))}
          </select>
        </div>

        {/* Minute */}
        <div className="w-28">
          <label className="block text-xs text-slate-500 mb-1">Minute</label>
          <select
            value={minute}
            onChange={e => setMinute(parseInt(e.target.value))}
            className="w-full px-3 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            {[0, 15, 30, 45].map(m => (
              <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-blue-50 px-4 py-3 rounded-xl">
        <p className="text-sm text-blue-700">
          Cutoff set to <strong>{formatTime(hour, minute)}</strong> IST — 
          customers ordering after this time will be placing orders for the next day's delivery
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={loading || saved}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 active:scale-95 transition-transform"
      >
        {saved ? '✓ Saved!' : loading ? 'Saving...' : 'Save cutoff time'}
      </button>
    </div>
  )
}