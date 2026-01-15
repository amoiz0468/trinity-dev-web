import api from './api'
import { Customer, Product, Invoice, Category, KPIData, CurrentUserResponse } from '../types'

// Authentication
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/token/', { username, password })
    return response.data
  },

  register: async (data: Partial<Customer> & { password: string; email: string }) => {
    const response = await api.post('/auth/register/', data)
    return response.data
  },

  getMe: async () => {
    const response = await api.get<CurrentUserResponse>('/auth/me/')
    return response.data
  },

  updateMe: async (data: Partial<Customer>) => {
    const response = await api.patch('/auth/me/', data)
    return response.data
  },
  
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_role')
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token')
  },

  getRole: () => {
    return localStorage.getItem('user_role')
  },

  setRole: (role: 'staff' | 'customer') => {
    localStorage.setItem('user_role', role)
  },
}

// Customers
export const customerService = {
  getAll: async () => {
    const response = await api.get<Customer[]>('/users/')
    return response.data
  },
  
  getById: async (id: number) => {
    const response = await api.get<Customer>(`/users/${id}/`)
    return response.data
  },
  
  create: async (data: Partial<Customer>) => {
    const response = await api.post<Customer>('/users/', data)
    return response.data
  },
  
  update: async (id: number, data: Partial<Customer>) => {
    const response = await api.put<Customer>(`/users/${id}/`, data)
    return response.data
  },
  
  delete: async (id: number) => {
    await api.delete(`/users/${id}/`)
  },
  
  getHistory: async (id: number) => {
    const response = await api.get(`/users/${id}/history/`)
    return response.data
  },
}

// Products
export const productService = {
  getAll: async () => {
    const response = await api.get<Product[]>('/products/')
    return response.data
  },
  
  getById: async (id: number) => {
    const response = await api.get<Product>(`/products/${id}/`)
    return response.data
  },
  
  create: async (data: Partial<Product> | FormData) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    const response = await api.post<Product>('/products/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
    return response.data
  },
  
  update: async (id: number, data: Partial<Product> | FormData) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    const response = await api.put<Product>(`/products/${id}/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
    return response.data
  },
  
  delete: async (id: number) => {
    await api.delete(`/products/${id}/`)
  },
  
  syncOpenFoodFacts: async (barcode: string) => {
    const response = await api.post('/products/sync_openfoodfacts/', { barcode })
    return response.data
  },
  
  updateStock: async (id: number, quantity: number) => {
    const response = await api.post(`/products/${id}/update_stock/`, { quantity })
    return response.data
  },
}

// Categories
export const categoryService = {
  getAll: async () => {
    const response = await api.get<Category[]>('/categories/')
    return response.data
  },
}

// Invoices
export const invoiceService = {
  getAll: async () => {
    const response = await api.get<Invoice[]>('/invoices/')
    return response.data
  },
  
  getById: async (id: number) => {
    const response = await api.get<Invoice>(`/invoices/${id}/`)
    return response.data
  },
  
  create: async (data: any) => {
    const response = await api.post<Invoice>('/invoices/', data)
    return response.data
  },
  
  update: async (id: number, data: Partial<Invoice>) => {
    const response = await api.patch<Invoice>(`/invoices/${id}/`, data)
    return response.data
  },
  
  delete: async (id: number) => {
    await api.delete(`/invoices/${id}/`)
  },
}

// Reports
export const reportService = {
  getKPIs: async (days: number = 30) => {
    const response = await api.get<KPIData>(`/reports/?days=${days}`)
    return response.data
  },
  
  getSalesReport: async (days: number = 30) => {
    const response = await api.get(`/reports/sales/?days=${days}`)
    return response.data
  },
  
  getProductPerformance: async () => {
    const response = await api.get('/reports/products/')
    return response.data
  },
  
  getCustomerAnalytics: async () => {
    const response = await api.get('/reports/customers/')
    return response.data
  },
}
