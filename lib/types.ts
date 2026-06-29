export type Role = 'customer' | 'milkman' | 'admin'

export type User = {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: Role
  flat_number: string | null
  building: string | null
}

export type Product = {
  id: string
  name: string
  price: number
  unit: string
  is_active: boolean
  photo_url: string | null
}

export type Order = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  date: string
  status: 'pending' | 'delivered' | 'cancelled'
  notes: string | null
}