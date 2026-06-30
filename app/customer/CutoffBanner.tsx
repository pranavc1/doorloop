'use client'

import { useEffect, useState } from 'react'

export default function CutoffBanner({
  cutoffHour,
  cutoffMinute,
  isPastCutoff,
}: {
  cutoffHour: number
  cutoffMinute: number
  isPastCutoff: boolean
}) {
  const [timeLeft, setTimeLeft] = useState('')

  function formatTime(h: number, m: number) {
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 === 0 ? 12 : h % 12
    const displayMinute = m.toString().padStart(2, '0')
    return `${displayHour}:${displayMinute} ${period}`
  }

  useEffect(() => {
    if (isPastCutoff) return

    function updateCountdown() {
      const now = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000
      const istNow = new Date(now.getTime() + istOffset)

      const cutoff = new Date(istNow)
      cutoff.setUTCHours(cutoffHour, cutoffMinute, 0, 0)

      const diffMs = cutoff.getTime() - istNow.getTime()
      if (diffMs <= 0) {
        setTimeLeft('')
        return
      }

      const hrs = Math.floor(diffMs / (1000 * 60 * 60))
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

      if (hrs > 0) {
        setTimeLeft(`${hrs} hr ${mins} min left`)
      } else {
        setTimeLeft(`${mins} min left`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [cutoffHour, cutoffMinute, isPastCutoff])

  if (isPastCutoff) {
    return (
      <div className="bg-[#FAEEDA] rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-lg flex-shrink-0">🌙</span>
        <div>
          <p className="text-[13px] font-medium text-[#854F0B]">
            Today's window closed at {formatTime(cutoffHour, cutoffMinute)}
          </p>
          <p className="text-[11px] text-[#A36A1F] mt-0.5">You're ordering for tomorrow now</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#E6F1FB] rounded-2xl px-4 py-3 flex items-center gap-3">
      <span className="text-lg flex-shrink-0">⏰</span>
      <div>
        <p className="text-[13px] font-medium text-[#1E4D8C]">
          Order before {formatTime(cutoffHour, cutoffMinute)} for today's delivery
        </p>
        {timeLeft && (
          <p className="text-[11px] text-[#4A7AB5] mt-0.5">{timeLeft}</p>
        )}
      </div>
    </div>
  )
}