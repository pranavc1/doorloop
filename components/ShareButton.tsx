'use client'

export default function ShareButton({ role }: { role: 'customer' | 'milkman' | 'admin' }) {
  function handleShare() {
    const messages = {
      customer: `Hey! I'm using DoorLoop for daily milk deliveries at our building. Super easy to order. Join here: https://doorloop.vercel.app`,
      milkman: `Hey! I deliver through DoorLoop — makes managing daily orders really easy. If you're doing deliveries, sign up here: https://doorloop.vercel.app`,
      admin: `Hey! I'm using DoorLoop for daily deliveries. Join here: https://doorloop.vercel.app`,
    }
    const url = `https://wa.me/?text=${encodeURIComponent(messages[role])}`
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