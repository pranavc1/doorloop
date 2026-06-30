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
  const [isOpen, setIsOpen] = useState(false)
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
    setTimeout(() => { setSaved(false); setIsOpen(false) }, 1500)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3.5 flex justify-between items-center">
        <div className="text-left">
          <p className="text-[14px] font-medium text-[#2C2C2A]">Order cutoff</p>
          <p className="text-[12px] text-[#8a8578]">{formatTime(hour, minute)} IST</p>
        </div>
        <span className="text-[#8a8578] text-base">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#F0EDE5] pt-3">
          <p className="text-[13px] text-[#8a8578]">Customers can't place same-day orders after this time</p>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[11px] text-[#8a8578] mb-1">Hour</label>
              <select
                value={hour}
                onChange={e => setHour(parseInt(e.target.value))}
                className="w-full px-3 py-3 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[14px]"
              >
                {[23, 0, 1, 2, 3, 4, 5].map(i => (
  <option key={i} value={i}>
    {i === 23 ? '11:00 PM' : i === 0 ? '12:00 AM (midnight)' : `${i}:00 AM`}
  </option>
))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-[11px] text-[#8a8578] mb-1">Min</label>
              <select
                value={minute}
                onChange={e => setMinute(parseInt(e.target.value))}
                className="w-full px-3 py-3 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[14px]"
              >
                {[0, 15, 30, 45].map(m => (
                  <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || saved}
            className="w-full bg-[#1E4D8C] text-white py-3 rounded-xl font-medium text-[14px] disabled:opacity-50 active:scale-95 transition-transform"
          >
            {saved ? '✓ Saved' : loading ? 'Saving...' : 'Save cutoff time'}
          </button>
        </div>
      )}
    </div>
  )
}