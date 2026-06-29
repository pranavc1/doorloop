'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Building = {
  id: string
  name: string
  area: string | null
}

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [flat, setFlat] = useState('')
  const [buildingId, setBuildingId] = useState('')
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function fetchBuildings() {
      const { data } = await supabase
        .from('buildings')
        .select('id, name, area')
        .eq('is_active', true)
        .order('name', { ascending: true })
      if (data) {
        setBuildings(data)
        if (data.length > 0) setBuildingId(data[0].id)
      }
    }
    fetchBuildings()
  }, [])

  async function handleSubmit() {
    if (!name || !phone || !flat || !buildingId) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const selectedBuilding = buildings.find(b => b.id === buildingId)

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      name,
      phone,
      flat_number: flat,
      building: selectedBuilding?.name || '',
      building_id: buildingId,
      role: 'customer',
    })

    if (error) { setError(error.message); setLoading(false); return }
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
          <span className="text-white text-2xl">🔁</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Set up your profile</h1>
        <p className="text-slate-500 mt-1">Just a few details to get started</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Your name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Pranav"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="9876543210"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Building</label>
          {buildings.length === 0 ? (
            <div className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-400 text-base">
              Loading buildings...
            </div>
          ) : (
            <select
              value={buildingId}
              onChange={e => setBuildingId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}{b.area ? ` — ${b.area}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Flat / House number</label>
          <input
            type="text"
            value={flat}
            onChange={e => setFlat(e.target.value)}
            placeholder="B-204"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50 active:scale-95 transition-transform"
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}