import { useQuery } from 'react-query'
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
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
        <Typography variant="h4" gutterBottom>
          Reports & Analytics
        </Typography>
        <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
          <Typography color="error">
            Failed to load reports. Please try again later.
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Key performance indicators and insights
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.revenue_trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Products
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.top_products?.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product__name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_quantity" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Customers
              </Typography>
              <Box>
                {data?.top_customers?.slice(0, 5).map((customer: any, index: number) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    {customer.first_name} {customer.last_name} - ${customer.total_spent} ({customer.order_count} orders)
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Reports
