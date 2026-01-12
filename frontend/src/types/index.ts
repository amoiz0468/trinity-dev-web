export interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string
  address: string
  zip_code: string
  city: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
  full_name: string
  full_address: string
}

export interface Product {
  id: number
  name: string
  brand: string
  price: number
  category: number
  category_name: string
  picture_url: string
  picture?: string
  quantity_in_stock: number
  stock_status: string
  is_in_stock: boolean
  is_active: boolean
  barcode?: string
  description?: string
  energy_kcal?: number
  fat?: number
  carbohydrates?: number
  proteins?: number
  created_at: string
}

export interface Invoice {
  id: number
  invoice_number: string
  customer: number
  customer_details: Customer
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  payment_method: 'cash' | 'card' | 'paypal' | 'other'
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  total_items: number
  created_at: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  id: number
  product: number
  product_details: Product
  quantity: number
  unit_price: number
  total_price: number
  product_name: string
}

export interface Category {
  id: number
  name: string
  description: string
  product_count: number
}

export interface KPIData {
  period: {
    start_date: string
    end_date: string
    days: number
  }
  kpis: {
    total_revenue: number
    average_order_value: number
    total_orders: number
    total_customers: number
  }
  top_products: Array<{
    product__name: string
    total_quantity: number
    total_revenue: number
  }>
  low_stock_alerts: Array<{
    id: number
    name: string
    quantity_in_stock: number
  }>
  top_customers: Array<{
    id: number
    first_name: string
    last_name: string
    total_spent: number
    order_count: number
  }>
  revenue_trend: Array<{
    date: string
    revenue: number
  }>
  category_performance: Array<{
    product__category__name: string
    total_revenue: number
    total_quantity: number
  }>
}
