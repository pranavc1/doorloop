'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Building = {
  id: string
  name: string
  area: string | null
  is_active: boolean
}

export default function BuildingManager({ buildings }: { buildings: Building[] }) {
  const [list, setList] = useState(buildings)
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleAdd() {
    if (!name) return
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('buildings')
      .insert({ name, area: area || null })
      .select()
      .single()

    if (!error && data) {
      setList(prev => [...prev, data])
      setName('')
      setArea('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
    setLoading(false)
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('buildings').update({ is_active: !current }).eq('id', id)
    setList(prev => prev.map(b => b.id === id ? { ...b, is_active: !current } : b))
  }

  return (
    <div className="space-y-2.5">
      <div className="bg-white rounded-2xl p-4 space-y-3">
        <p className="font-medium text-[14px] text-[#2C2C2A]">Add building</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Building name (e.g. Panch Smruti)"
          className="w-full px-4 py-3.5 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[14px]"
        />
        <input
          value={area}
          onChange={e => setArea(e.target.value)}
          placeholder="Area (e.g. Powai) — optional"
          className="w-full px-4 py-3.5 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[14px]"
        />
        <button
          onClick={handleAdd}
          disabled={loading || !name}
          className="w-full bg-[#1E4D8C] text-white py-3.5 rounded-xl font-medium text-[14px] disabled:opacity-50 active:scale-95 transition-transform"
        >
          {success ? '✓ Added!' : loading ? 'Adding...' : 'Add building'}
        </button>
      </div>

      <div className="bg-white rounded-2xl divide-y divide-[#F0EDE5]">
        {list.length === 0 && (
          <p className="text-[#8a8578] text-[13px] px-4 py-4">No buildings yet</p>
        )}
        {list.map(b => (
          <div key={b.id} className="flex justify-between items-center px-4 py-3">
            <div>
              <p className={`font-medium text-[14px] ${b.is_active ? 'text-[#2C2C2A]' : 'text-[#A8A29E]'}`}>
                {b.name}
              </p>
              {b.area && <p className="text-[12px] text-[#8a8578]">{b.area}</p>}
            </div>
            <button
              onClick={() => toggleActive(b.id, b.is_active)}
              className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors ${
                b.is_active ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#F5F2EA] text-[#8a8578]'
              }`}
            >
              {b.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}