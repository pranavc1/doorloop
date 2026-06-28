import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DeliverButton from './DeliverButton'
import SignOutButton from '@/components/SignOutButton'


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

  const { data: orders } = await supabase
    .from('orders')
    .select('*, users(name, flat_number, building), products(name, unit)')
    .eq('date', today)
    .order('created_at', { ascending: true })

  const pending = orders?.filter(o => o.status === 'pending') || []
  const delivered = orders?.filter(o => o.status === 'delivered') || []

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-blue-600 px-6 pt-12 pb-6">
  <div className="flex justify-between items-start">
    <div>
      <p className="text-blue-200 text-sm">Milkman</p>
      <h1 className="text-white text-2xl font-bold">Today's deliveries</h1>
      <p className="text-blue-200 text-sm mt-1">{today}</p>
    </div>
    <SignOutButton />
  </div>
</div>

      <div className="px-6 mt-6 space-y-6">

        {/* Summary */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-xl border border-slate-100 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-slate-800">{pending.length}</p>
            <p className="text-sm text-slate-400">Pending</p>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-slate-100 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-green-600">{delivered.length}</p>
            <p className="text-sm text-slate-400">Delivered</p>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-slate-100 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-slate-800">{orders?.length || 0}</p>
            <p className="text-sm text-slate-400">Total</p>
          </div>
        </div>

        {/* Pending deliveries */}
        {pending.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">To deliver</h2>
            <div className="space-y-3">
              {pending.map((o: any) => (
                <div key={o.id} className="bg-white rounded-xl border border-slate-100 px-4 py-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-slate-800">{o.users?.name}</p>
                      <p className="text-sm text-slate-400">{o.users?.flat_number}, {o.users?.building}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                      pending
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    {o.products?.name} ({o.products?.unit}) × {o.quantity}
                  </p>
                  {o.notes && (
                    <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-3">
                      📝 {o.notes}
                    </p>
                  )}
                  <DeliverButton orderId={o.id} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Delivered */}
        {delivered.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">Done ✓</h2>
            <div className="space-y-2">
              {delivered.map((o: any) => (
                <div key={o.id} className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex justify-between items-center opacity-60">
                  <div>
                    <p className="font-medium text-slate-700">{o.users?.name}</p>
                    <p className="text-sm text-slate-400">{o.users?.flat_number} · {o.products?.name} × {o.quantity}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
                    delivered
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {orders?.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-100 px-4 py-10 text-center">
            <p className="text-slate-400">No orders for today yet</p>
          </div>
        )}

      </div>
    </div>
  )
}