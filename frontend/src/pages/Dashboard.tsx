import { useQuery } from 'react-query'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  TrendingUp,
  People,
  Receipt,
  AttachMoney,
} from '@mui/icons-material'
import { reportService } from '../services'

const StatCard = ({ title, value, icon, color }: any) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            color="textSecondary"
            gutterBottom
            variant="overline"
            sx={{ fontWeight: 600, letterSpacing: 0.5 }}
          >
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            {value || 0}
          </Typography>
        </Box>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            borderRadius: '12px',
            padding: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
)

const Dashboard = () => {
  const { data, isLoading, error } = useQuery('kpis', () => reportService.getKPIs(30), {
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
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="error">
          Failed to load dashboard data. Please try again later.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Overview of key performance indicators
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${(data?.kpis?.total_revenue || 0).toFixed(2)}`}
            icon={<AttachMoney sx={{ fontSize: 32 }} />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={data?.kpis?.total_orders || 0}
            icon={<Receipt sx={{ fontSize: 32 }} />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customers"
            value={data?.kpis?.total_customers || 0}
            icon={<People sx={{ fontSize: 32 }} />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Order Value"
            value={`$${(data?.kpis?.average_order_value || 0).toFixed(2)}`}
            icon={<TrendingUp sx={{ fontSize: 32 }} />}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Low Stock Alerts
              </Typography>
              {!data?.low_stock_alerts || data.low_stock_alerts.length === 0 ? (
                <Typography color="text.secondary">No low stock products</Typography>
              ) : (
                <Box>
                  {data.low_stock_alerts.slice(0, 5).map((product: any) => (
                    <Typography key={product.id} variant="body2" sx={{ mb: 1 }}>
                      {product.name} - {product.quantity_in_stock} remaining
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
