import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'
import ShareButton from '@/components/ShareButton'
import CutoffEditor from '@/components/CutoffEditor'
import MilkmanDeliveryList from './MilkmanDeliveryList'
import MilkmanProductToggle from './MilkmanProductToggle'

export default async function MilkmanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'milkman') redirect('/')

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: orders } = await supabase
    .from('orders')
    .select('*, users(name, flat_number, building), products(name, unit, photo_url)')
    .in('date', [today, tomorrow])
    .neq('status', 'cancelled')
    .order('date', { ascending: true })

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

  const { data: milkmanProducts } = await supabase
    .from('milkman_products')
    .select('*')
    .eq('milkman_id', user.id)

  // Group orders by customer+date
  const grouped: Record<string, {
    userId: string
    name: string
    flat: string
    building: string
    date: string
    orders: any[]
  }> = {}

  for (const o of orders || []) {
    const key = `${o.user_id}-${o.date}`
    if (!grouped[key]) {
      grouped[key] = {
        userId: o.user_id,
        name: o.users?.name || '',
        flat: o.users?.flat_number || '',
        building: o.users?.building || '',
        date: o.date,
        orders: [],
      }
    }
    grouped[key].orders.push(o)
  }

  // Group by building, then sort flats within each building
  const byBuilding: Record<string, typeof grouped[string][]> = {}
  for (const g of Object.values(grouped)) {
    if (!byBuilding[g.building]) byBuilding[g.building] = []
    byBuilding[g.building].push(g)
  }
  for (const building in byBuilding) {
    byBuilding[building].sort((a, b) =>
      a.flat.localeCompare(b.flat, undefined, { numeric: true })
    )
  }

  const allGrouped = Object.values(grouped)
  const totalOrders = allGrouped.length
  const deliveredCount = allGrouped.filter(g =>
    g.orders.every(o => o.status === 'delivered')
  ).length

  // Total packets per product across all pending orders
  const productTotals: Record<string, { name: string, unit: string, total: number }> = {}
  for (const o of orders || []) {
    if (o.status !== 'delivered') {
      const key = o.product_id
      if (!productTotals[key]) {
        productTotals[key] = { name: o.products?.name, unit: o.products?.unit, total: 0 }
      }
      productTotals[key].total += o.quantity
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">

      {/* Header */}
      <div className="bg-blue-600 px-6 pt-12 pb-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-200 text-sm">Milkman</p>
            <h1 className="text-white text-2xl font-bold">Deliveries</h1>
          </div>
          <SignOutButton />
        </div>

        {totalOrders > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-200">{deliveredCount} of {totalOrders} delivered</span>
              <span className="text-white font-medium">
                {Math.round((deliveredCount / totalOrders) * 100)}%
              </span>
            </div>
            <div className="w-full bg-blue-500 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${(deliveredCount / totalOrders) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-6 mt-6 space-y-6">

        {/* Pickup summary */}
        {Object.keys(productTotals).length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-700 mb-2">📦 Bring today</h2>
            <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
              {Object.values(productTotals).map((pt, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-3">
                  <p className="text-slate-700 font-medium">{pt.name}</p>
                  <p className="text-blue-600 font-bold">{pt.total} × {pt.unit}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Delivery list grouped by building */}
        <section>
          <h2 className="text-base font-bold text-slate-700 mb-3">🏠 Delivery list</h2>
          {Object.keys(byBuilding).length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-10 text-center">
              <p className="text-slate-400">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byBuilding).map(([building, customers]) => (
                <div key={building}>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                    📍 {building}
                  </p>
                  <MilkmanDeliveryList groupedList={customers} today={today} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My offerings */}
        <section>
          <h2 className="text-base font-bold text-slate-700 mb-2">🥛 My offerings</h2>
          <p className="text-sm text-slate-400 mb-3">Toggle which products you deliver. Changes apply from the next order onwards.</p>
          <MilkmanProductToggle
            allProducts={allProducts || []}
            milkmanProducts={milkmanProducts || []}
            milkmanId={user.id}
          />
        </section>

        {/* Cutoff time */}
        <section>
          <h2 className="text-base font-bold text-slate-700 mb-2">⏰ Cutoff time</h2>
          <CutoffEditor
            currentHour={settings?.cutoff_hour ?? 5}
            currentMinute={settings?.cutoff_minute ?? 0}
          />
        </section>

        {/* Refer */}
        <section>
          <h2 className="text-base font-bold text-slate-700 mb-2">👋 Refer a milkman</h2>
          <ShareButton role="milkman" />
        </section>

      </div>
    </div>
  )
}