'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  async function handleSubmit() {
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else window.location.href = '/'
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FBF8F2] flex flex-col justify-center px-5">
      {/* Logo */}
      <div className="mb-9 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1E4D8C] rounded-2xl mb-4">
          <span className="text-white text-2xl">🔁</span>
        </div>
        <h1 className="text-[28px] font-medium text-[#2C2C2A]">DoorLoop</h1>
        <p className="text-[#8a8578] mt-1 text-[14px]">Daily deliveries, simplified</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl p-6">
        <h2 className="text-[18px] font-medium text-[#2C2C2A] mb-5">
          {isSignUp ? 'Create account' : 'Welcome back'}
        </h2>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-medium text-[#6b6759] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3.5 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[15px]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#6b6759] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[15px]"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-[13px] px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-[#E1F5EE] text-[#0F6E56] text-[13px] px-4 py-3 rounded-xl">
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full bg-[#1E4D8C] text-white py-4 rounded-xl font-medium text-[15px] disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </div>
      </div>

      {/* Toggle */}
      <p className="text-center text-[#8a8578] mt-6 text-[14px]">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
          className="text-[#1E4D8C] font-medium"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </button>
      </p>
    </div>
  )
}