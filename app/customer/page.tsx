import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrderForm from './OrderForm'
import OrderSummaryCard from './OrderSummaryCard'
import SignOutButton from '@/components/SignOutButton'
import ShareButton from '@/components/ShareButton'

export default async function CustomerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.name) redirect('/onboarding')

  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'global')
    .single()

  const { data: allProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const { data: milkmanProductSettings } = await supabase
    .from('milkman_products')
    .select('product_id, is_active')

  const disabledProductIds = new Set(
    (milkmanProductSettings || [])
      .filter(mp => !mp.is_active)
      .map(mp => mp.product_id)
  )
  const products = (allProducts || []).filter(p => !disabledProductIds.has(p.id))

  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istNow = new Date(now.getTime() + istOffset)

  const cutoffHour = settings?.cutoff_hour ?? 5
  const cutoffMinute = settings?.cutoff_minute ?? 0

  const isPastCutoff =
    istNow.getUTCHours() > cutoffHour ||
    (istNow.getUTCHours() === cutoffHour && istNow.getUTCMinutes() >= cutoffMinute)

  const orderDate = isPastCutoff
    ? new Date(istNow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : today

  const { data: todayOrders } = await supabase
    .from('orders')
    .select('*, products(name, unit, photo_url)')
    .eq('user_id', user.id)
    .eq('date', orderDate)
    .neq('status', 'cancelled')

  const orderedProductIds = new Set((todayOrders || []).map(o => o.product_id))
  const availableToAdd = products.filter(p => !orderedProductIds.has(p.id))
  const hasOrders = (todayOrders?.length || 0) > 0

  const dayLabel = new Date(istNow).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  const initial = profile.name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#FBF8F2] pb-12">

      {/* Header */}
      <div className="bg-[#1E4D8C] px-5 pt-11 pb-7">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[13px] text-white/65">{dayLabel}</p>
            <h1 className="text-[26px] font-medium text-white mt-0.5">Hi {profile.name.split(' ')[0]} 👋</h1>
            <p className="text-[13px] text-white/70 mt-1">{profile.flat_number}, {profile.building}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white text-sm">
              {initial}
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="px-3.5 mt-4 space-y-7">

        {/* Existing orders */}
        <section>
          <h2 className="text-[15px] font-medium text-[#2C2C2A] px-1.5 mb-2.5">
            {isPastCutoff ? "Tomorrow's order" : "Today's order"}
          </h2>

          {!hasOrders ? (
            <div className="bg-white rounded-2xl px-5 py-8 text-center">
              <p className="text-[#8a8578] text-[14px]">You haven't ordered yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayOrders?.map((o: any) => (
                <OrderSummaryCard key={o.id} order={o} isPastCutoff={isPastCutoff} />
              ))}
            </div>
          )}
        </section>

        {/* Add product — tile scroller */}
        <section>
          <h2 className="text-[15px] font-medium text-[#2C2C2A] px-1.5 mb-2.5">
            {hasOrders ? 'Add something else' : (isPastCutoff ? 'Order for tomorrow' : 'Order for today')}
          </h2>
          {availableToAdd.length > 0 ? (
            <OrderForm products={availableToAdd} userId={user.id} orderDate={orderDate} />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl px-5 py-8 text-center">
              <p className="text-[#8a8578] text-[14px]">No products available right now</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl px-5 py-8 text-center">
              <p className="text-[#8a8578] text-[14px]">You've ordered everything available</p>
            </div>
          )}
        </section>

        {/* Invite */}
        <section className="px-1.5">
          <button
            onClick={undefined}
            className="hidden"
          />
          <ShareButton role="customer" />
        </section>

      </div>
    </div>
  )
}