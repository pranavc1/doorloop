import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrderForm from './OrderForm'
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

  // Get all active products
  const { data: allProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  // Get milkman product toggles
  const { data: milkmanProductSettings } = await supabase
    .from('milkman_products')
    .select('product_id, is_active')

  // Filter: if milkman has explicitly disabled a product, hide it
  // If no setting exists for a product, show it by default
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
    .select('*, products(name, unit)')
    .eq('user_id', user.id)
    .eq('date', orderDate)

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

        {/* Orders */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">
            {isPastCutoff ? "Tomorrow's orders" : "Today's orders"}
          </h2>
          {todayOrders?.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-6 text-center">
              <p className="text-slate-400 text-sm">No orders placed yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayOrders?.map((o: any) => (
                <div key={o.id} className="bg-white rounded-xl px-4 py-3 border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">{o.products?.name}</p>
                    <p className="text-sm text-slate-400">{o.products?.unit} × {o.quantity}</p>
                    {o.notes && (
                      <p className="text-xs text-blue-600 mt-1">📝 {o.notes}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Place order */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">
            {isPastCutoff ? "Place order for tomorrow" : "Place an order for today"}
          </h2>
          {products.length > 0 ? (
            <OrderForm products={products} userId={user.id} orderDate={orderDate} />
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-6 text-center">
              <p className="text-slate-400 text-sm">No products available right now</p>
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