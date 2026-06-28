'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [flat, setFlat] = useState('')
  const [building, setBuilding] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit() {
    if (!name || !phone || !flat || !building) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      name,
      phone,
      flat_number: flat,
      building,
      role: 'customer',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
          <span className="text-white text-2xl">🔁</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Set up your profile</h1>
        <p className="text-slate-500 mt-1">Just a few details to get started</p>
      </div>

      {/* Form */}
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
          <label className="block text-sm font-medium text-slate-600 mb-1">Flat / House number</label>
          <input
            type="text"
            value={flat}
            onChange={e => setFlat(e.target.value)}
            placeholder="B-204"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Building / Society name</label>
          <input
            type="text"
            value={building}
            onChange={e => setBuilding(e.target.value)}
            placeholder="Sunshine Apartments"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50 active:scale-95 transition-transform mt-2"
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}