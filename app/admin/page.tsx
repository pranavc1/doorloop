import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddProductForm from './AddProductForm'
import SignOutButton from '@/components/SignOutButton'

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

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-blue-600 px-6 pt-12 pb-6">
        <div className="flex justify-between items-start">
            <div>
            <p className="text-blue-200 text-sm">Admin</p>
            <h1 className="text-white text-2xl font-bold">DoorLoop</h1>
            </div>
            <SignOutButton />
        </div>
    </div>

      <div className="px-6 mt-6 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Products</h2>
          <AddProductForm />
          <div className="space-y-2 mt-4">
            {products?.length === 0 && (
              <p className="text-slate-400 text-sm">No products yet. Add one above.</p>
            )}
            {products?.map(p => (
              <div key={p.id} className="bg-white rounded-xl px-4 py-3 flex justify-between items-center border border-slate-100">
                <div>
                  <p className="font-medium text-slate-800">{p.name}</p>
                  <p className="text-sm text-slate-400">{p.unit}</p>
                </div>
                <p className="font-semibold text-blue-600">₹{p.price}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Recent Orders</h2>
          <div className="space-y-2">
            {orders?.length === 0 && (
              <p className="text-slate-400 text-sm">No orders yet.</p>
            )}
            {(orders as any[])?.map((o) => (
              <div key={o.id} className="bg-white rounded-xl px-4 py-3 border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-800">{o.users?.name}</p>
                    <p className="text-sm text-slate-400">{o.users?.flat_number}, {o.users?.building}</p>
                    <p className="text-sm text-slate-600 mt-1">{o.products?.name} × {o.quantity}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {o.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{o.date}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}