import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Layout from './components/Layout'
import CustomerLayout from './components/CustomerLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Invoices from './pages/Invoices'
import Reports from './pages/Reports'
import CustomerCatalog from './pages/CustomerCatalog'
import CustomerOrders from './pages/CustomerOrders'
import CustomerProfile from './pages/CustomerProfile'
import RoleRoute from './components/RoleRoute'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <RoleRoute allow={['staff']}>
              <Layout />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route
          path="/customer"
          element={
            <RoleRoute allow={['customer']}>
              <CustomerLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="/customer/catalog" replace />} />
          <Route path="catalog" element={<CustomerCatalog />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App
