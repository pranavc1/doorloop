'use client'

export default function SignOutButton() {
  async function handleSignOut() {
    await fetch('/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-blue-200 hover:text-white transition-colors"
    >
      Sign out
    </button>
  )
}