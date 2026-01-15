import { useQuery } from 'react-query'
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  Avatar,
  Stack,
  Divider,
} from '@mui/material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { reportService } from '../services'
import { TrendingUp as TrendingUpIcon, ShoppingCart as ShoppingCartIcon, People as UsersIcon, AttachMoney as DollarSignIcon } from '@mui/icons-material'

const Reports = () => {
  const { data, isLoading, error } = useQuery('reports', () => reportService.getKPIs(30), {
    retry: 1,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Reports & Analytics
        </Typography>
        <Paper sx={{ p: 3, bgcolor: '#ffebee', borderRadius: 2 }}>
          <Typography color="error" sx={{ fontWeight: 500 }}>
            Failed to load reports. Please try again later.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Key performance indicators and business insights
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* KPI Cards */}
        {data?.kpis && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: '0 4px 15px rgba(102,126,234,0.3)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" variant="caption" sx={{ fontWeight: 600 }}>
                        Total Revenue
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                        ${data.kpis.total_revenue?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <DollarSignIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white', boxShadow: '0 4px 15px rgba(76,175,80,0.3)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" variant="caption" sx={{ fontWeight: 600 }}>
                        Total Orders
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {data.kpis.total_orders || '0'}
                      </Typography>
                    </Box>
                    <ShoppingCartIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', color: 'white', boxShadow: '0 4px 15px rgba(33,150,243,0.3)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" variant="caption" sx={{ fontWeight: 600 }}>
                        Active Customers
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {data.kpis.total_customers || '0'}
                      </Typography>
                    </Box>
                    <UsersIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white', boxShadow: '0 4px 15px rgba(255,152,0,0.3)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" variant="caption" sx={{ fontWeight: 600 }}>
                        Avg Order Value
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                        ${data.kpis.avg_order_value?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Revenue Chart */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
                📈 Revenue Trend (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.revenue_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #eee',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={2} dot={{ fill: '#667eea' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
                🏆 Top Products
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.top_products?.slice(0, 5) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="product__name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #eee',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total_quantity" fill="#667eea" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
                👥 Top Customers
              </Typography>
              <Stack spacing={1.5}>
                {data?.top_customers?.slice(0, 5).map((customer: any, index: number) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        {customer.first_name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {customer.first_name} {customer.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {customer.order_count} orders
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={`$${customer.total_spent?.toFixed(2) || '0.00'}`}
                      sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 600 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Reports
