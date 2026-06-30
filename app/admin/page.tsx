import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddProductForm from './AddProductForm'
import SignOutButton from '@/components/SignOutButton'
import ShareButton from '@/components/ShareButton'
import CutoffEditor from '@/components/CutoffEditor'
import OrderStatusButton from './OrderStatusButton'
import BuildingManager from './BuildingManager'
import SubscriptionsManager from './SubscriptionsManager'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: orders } = await supabase
    .from('orders')
    .select('*, users(name, flat_number, building), products(name, unit)')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'global')
    .single()

  const { data: buildings } = await supabase
    .from('buildings')
    .select('*')
    .order('name', { ascending: true })

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, users(name, flat_number, building), products(name, unit)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const pendingCount = orders?.filter(o => o.status === 'pending').length || 0
  const deliveredCount = orders?.filter(o => o.status === 'delivered').length || 0

  return (
    <div className="min-h-screen bg-[#FBF8F2] pb-12">

      {/* Header */}
      <div className="bg-[#1E4D8C] px-5 pt-11 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[12px] text-white/65">Admin</p>
            <h1 className="text-[22px] font-medium text-white mt-0.5">DoorLoop</h1>
          </div>
          <SignOutButton />
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1 bg-white/10 rounded-2xl px-3 py-3 text-center">
            <p className="text-[18px] font-medium text-white">{pendingCount}</p>
            <p className="text-[11px] text-white/65 mt-0.5">Pending</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl px-3 py-3 text-center">
            <p className="text-[18px] font-medium text-white">{deliveredCount}</p>
            <p className="text-[11px] text-white/65 mt-0.5">Delivered</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl px-3 py-3 text-center">
            <p className="text-[18px] font-medium text-white">{products?.length || 0}</p>
            <p className="text-[11px] text-white/65 mt-0.5">Products</p>
          </div>
        </div>
      </div>

      <div className="px-3.5 mt-5 space-y-7">

        {/* Products */}
        <section>
          <h2 className="text-[15px] font-medium text-[#2C2C2A] px-1.5 mb-2.5">Products</h2>
          <AddProductForm />
          <div className="space-y-2 mt-3">
            {products?.length === 0 && (
              <p className="text-[#8a8578] text-[13px] px-1.5">No products yet. Add one above.</p>
            )}
            {products?.map(p => (
              <div key={p.id} className="bg-white rounded-2xl px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#E6F1FB] flex items-center justify-center text-base overflow-hidden flex-shrink-0">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : '🥛'}
                  </div>
                  <div>
                    <p className="font-medium text-[14px] text-[#2C2C2A]">{p.name}</p>
                    <p className="text-[12px] text-[#8a8578]">{p.unit}</p>
                  </div>
                </div>
                <p className="font-medium text-[14px] text-[#1E4D8C]">₹{p.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Buildings */}
        <section>
          <h2 className="text-[15px] font-medium text-[#2C2C2A] px-1.5 mb-2.5">Buildings</h2>
          <BuildingManager buildings={buildings || []} />
        </section>
        <section>
          <h2 className="text-[15px] font-medium text-[#2C2C2A] px-1.5 mb-2.5">Subscriptions</h2>
          <SubscriptionsManager subscriptions={subscriptions || []} />
        </section>

        {/* Delivery settings */}
        <section>
          <h2 className="text-[15px] font-medium text-[#2C2C2A] px-1.5 mb-2.5">Delivery settings</h2>
          <CutoffEditor
            currentHour={settings?.cutoff_hour ?? 5}
            currentMinute={settings?.cutoff_minute ?? 0}
          />
        </section>

        {/* Recent orders */}
        <section>
          <h2 className="text-[15px] font-medium text-[#2C2C2A] px-1.5 mb-2.5">Recent orders</h2>
          <div className="space-y-2">
            {orders?.length === 0 && (
              <p className="text-[#8a8578] text-[13px] px-1.5">No orders yet.</p>
            )}
            {(orders as any[])?.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl px-4 py-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[14px] text-[#2C2C2A]">{o.users?.name}</p>
                    <p className="text-[12px] text-[#8a8578]">{o.users?.flat_number}, {o.users?.building}</p>
                    <p className="text-[13px] text-[#2C2C2A] mt-1">{o.products?.name} × {o.quantity}</p>
                    {o.notes && (
                      <p className="text-[12px] text-[#1E4D8C] mt-0.5">📝 {o.notes}</p>
                    )}
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    o.status === 'delivered' ? 'bg-[#E1F5EE] text-[#0F6E56]' :
                    o.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                    'bg-[#FAEEDA] text-[#854F0B]'
                  }`}>
                    {o.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#8a8578] mt-1.5">{o.date}</p>
                <OrderStatusButton orderId={o.id} currentStatus={o.status} />
              </div>
            ))}
          </div>
        </section>

        {/* Invite */}
        <section className="px-1.5">
          <ShareButton role="admin" />
        </section>

      </div>
    </div>
  )
}