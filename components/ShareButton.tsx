'use client'

export default function ShareButton() {
  function handleShare() {
    const text = `Hey! I'm using DoorLoop for daily deliveries. Join here: https://doorloop.vercel.app`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl font-medium text-sm w-full justify-center active:scale-95 transition-transform"
    >
      <span>Share on WhatsApp</span>
    </button>
  )
}