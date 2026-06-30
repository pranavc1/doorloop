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
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-blue-600 px-6 pt-12 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-200 text-sm">Good morning 👋</p>
            <h1 className="text-white text-2xl font-bold">{profile.name}</h1>
            <p className="text-blue-200 text-sm mt-1">{profile.flat_number}, {profile.building}</p>
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">

        {/* Existing orders summary */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">
            {isPastCutoff ? "Your order for tomorrow" : "Your order for today"}
          </h2>

          {!hasOrders ? (
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-6 text-center">
              <p className="text-slate-400 text-sm">You haven't ordered yet</p>
            </div>
          ) : (
            <div className="space-y-2">
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
          <h2 className="text-lg font-bold text-slate-800 mb-3">
            {hasOrders ? 'Add another product' : (isPastCutoff ? 'Place order for tomorrow' : 'Place an order for today')}
          </h2>
          {availableToAdd.length > 0 ? (
            <OrderForm products={availableToAdd} userId={user.id} orderDate={orderDate} />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-6 text-center">
              <p className="text-slate-400 text-sm">No products available right now</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-6 text-center">
              <p className="text-slate-400 text-sm">You've ordered everything available</p>
            </div>
          )}
        </section>

        {/* Invite */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Invite neighbours</h2>
          <ShareButton role="customer" />
        </section>

      </div>
    </div>
  )
}