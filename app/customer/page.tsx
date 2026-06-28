import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrderForm from './OrderForm'
import SignOutButton from '@/components/SignOutButton'

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

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const today = new Date().toISOString().split('T')[0]

  const { data: todayOrders } = await supabase
    .from('orders')
    .select('*, products(name, unit)')
    .eq('user_id', user.id)
    .eq('date', today)

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Header */}
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

        {/* Today's Orders */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Today's orders</h2>
          {todayOrders?.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-6 text-center">
              <p className="text-slate-400 text-sm">No orders placed for today yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayOrders?.map((o: any) => (
                <div key={o.id} className="bg-white rounded-xl px-4 py-3 border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">{o.products?.name}</p>
                    <p className="text-sm text-slate-400">{o.products?.unit} × {o.quantity}</p>
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

        {/* Place Order */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Place an order</h2>
          {products && products.length > 0 ? (
            <OrderForm products={products} userId={user.id} />
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-6 text-center">
              <p className="text-slate-400 text-sm">No products available yet</p>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}