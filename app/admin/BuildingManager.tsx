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
    <div className="space-y-3">
      {/* Add building form */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
        <p className="font-medium text-slate-700">Add building</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Building name (e.g. Panch Smruti)"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />
        <input
          value={area}
          onChange={e => setArea(e.target.value)}
          placeholder="Area (e.g. Powai) — optional"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />
        <button
          onClick={handleAdd}
          disabled={loading || !name}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 active:scale-95 transition-transform"
        >
          {success ? '✓ Added!' : loading ? 'Adding...' : 'Add Building'}
        </button>
      </div>

      {/* Buildings list */}
      <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
        {list.length === 0 && (
          <p className="text-slate-400 text-sm px-4 py-4">No buildings yet</p>
        )}
        {list.map(b => (
          <div key={b.id} className="flex justify-between items-center px-4 py-3">
            <div>
              <p className={`font-medium ${b.is_active ? 'text-slate-800' : 'text-slate-400'}`}>
                {b.name}
              </p>
              {b.area && (
                <p className="text-sm text-slate-400">{b.area}</p>
              )}
            </div>
            <button
              onClick={() => toggleActive(b.id, b.is_active)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                b.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-500'
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