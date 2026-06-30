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

  const dayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-[#FBF8F2] pb-12">

      {/* Header */}
      <div className="bg-[#1E4D8C] px-5 pt-11 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[12px] text-white/65">{dayLabel}</p>
            <h1 className="text-[22px] font-medium text-white mt-0.5">Your route</h1>
          </div>
          <SignOutButton />
        </div>
        {totalOrders > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 rounded-full h-[7px] flex-1 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all"
                style={{ width: `${(deliveredCount / totalOrders) * 100}%` }}
              />
            </div>
            <span className="text-[13px] font-medium text-white flex-shrink-0">
              {deliveredCount} / {totalOrders}
            </span>
          </div>
        )}
      </div>

      <div className="px-3.5 mt-4 space-y-7">

        {/* Carry with you today — number tiles */}
        {Object.keys(productTotals).length > 0 && (
          <section>
            <h2 className="text-[13px] font-medium text-[#8a8578] px-1.5 mb-2 flex items-center gap-1.5">
              🛍️ Carry with you today
            </h2>
            <div className="flex gap-2.5">
              {Object.values(productTotals).map((pt, i) => (
                <div key={i} className="flex-1 bg-white rounded-2xl px-3 py-3.5 text-center">
                  <p className="text-[20px] font-medium text-[#1E4D8C]">{pt.total}</p>
                  <p className="text-[11px] text-[#8a8578] mt-0.5 leading-tight">{pt.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Delivery list grouped by building */}
        <section>
          <h2 className="text-[15px] font-medium text-[#2C2C2A] px-1.5 mb-2.5">Delivery list</h2>
          {Object.keys(byBuilding).length === 0 ? (
            <div className="bg-white rounded-2xl px-5 py-10 text-center">
              <p className="text-[#8a8578] text-[14px]">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(byBuilding).map(([building, customers]) => (
                <div key={building}>
                  <p className="text-[11px] font-medium text-[#8a8578] uppercase tracking-wide px-1.5 mb-2 flex items-center gap-1.5">
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
          <h2 className="text-[15px] font-medium text-[#2C2C2A] px-1.5 mb-1">My offerings</h2>
          <p className="text-[12px] text-[#8a8578] px-1.5 mb-2.5">Toggle what you deliver. Applies from the next order onwards.</p>
          <MilkmanProductToggle
            allProducts={allProducts || []}
            milkmanProducts={milkmanProducts || []}
            milkmanId={user.id}
          />
        </section>

        {/* Cutoff time */}
        <section>
          <h2 className="text-[15px] font-medium text-[#2C2C2A] px-1.5 mb-2.5">Cutoff time</h2>
          <CutoffEditor
            currentHour={settings?.cutoff_hour ?? 5}
            currentMinute={settings?.cutoff_minute ?? 0}
          />
        </section>

        {/* Refer */}
        <section className="px-1.5">
          <ShareButton role="milkman" />
        </section>

      </div>
    </div>
  )
}