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

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-12">
      {/* Header */}
      <div className="bg-blue-600 px-6 pt-12 pb-7 rounded-b-3xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 text-base">Good morning 👋</p>
            <h1 className="text-white text-3xl font-bold mt-0.5">{profile.name}</h1>
            <p className="text-blue-100 text-base mt-1">{profile.flat_number}, {profile.building}</p>
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className="px-5 mt-6 space-y-7">

        {/* Existing orders summary */}
        <section>
          <h2 className="text-xl font-bold text-[#1C1917] mb-3 px-1">
            {isPastCutoff ? "Your order for tomorrow" : "Your order for today"}
          </h2>

          {!hasOrders ? (
            <div className="bg-white rounded-2xl border border-[#EDEAE3] px-5 py-7 text-center">
              <p className="text-[#78716C] text-base">You haven't ordered yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayOrders?.map((o: any) => (
                <OrderSummaryCard
                  key={o.id}
                  order={o}
                  isPastCutoff={isPastCutoff}
                />
              ))}
            </div>
          )}
        </section>

        {/* Add product */}
        <section>
          <h2 className="text-xl font-bold text-[#1C1917] mb-3 px-1">
            {hasOrders ? 'Add another product' : (isPastCutoff ? 'Place order for tomorrow' : 'Place an order for today')}
          </h2>
          {availableToAdd.length > 0 ? (
            <OrderForm products={availableToAdd} userId={user.id} orderDate={orderDate} />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EDEAE3] px-5 py-7 text-center">
              <p className="text-[#78716C] text-base">No products available right now</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#EDEAE3] px-5 py-7 text-center">
              <p className="text-[#78716C] text-base">You've ordered everything available</p>
            </div>
          )}
        </section>

        {/* Invite */}
        <section>
          <h2 className="text-xl font-bold text-[#1C1917] mb-3 px-1">Invite neighbours</h2>
          <ShareButton role="customer" />
        </section>

      </div>
    </div>
  )
}