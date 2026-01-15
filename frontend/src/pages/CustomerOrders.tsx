import { useQuery } from 'react-query'
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import { Package, Calendar, DollarSign, Truck } from 'lucide-react'
import { invoiceService } from '../services'
import { format } from 'date-fns'
import { useState } from 'react'

const CustomerOrders = () => {
  const { data, isLoading, error } = useQuery('customer-invoices', invoiceService.getAll, {
    retry: 1,
  })
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const detailQuery = useQuery(
    ['invoice-detail', selectedId],
    () => invoiceService.getById(selectedId as number),
    {
      enabled: !!selectedId,
      retry: 1,
    }
  )

  const invoices = Array.isArray(data) ? data : (data?.results || [])

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
          My Orders
        </Typography>
        <Paper sx={{ p: 3, bgcolor: '#ffebee', borderRadius: 2 }}>
          <Typography color="error">
            Failed to load your orders. Please try again later.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
          My Orders
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          View your recent purchases and order status
        </Typography>
      </Box>

      {!invoices || invoices.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Package size={48} style={{ margin: '0 auto 16px', color: '#ccc' }} />
          <Typography color="text.secondary" variant="h6">
            No orders yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Start shopping to place your first order!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {invoices.map((invoice: any) => (
            <Grid item xs={12} md={6} key={invoice.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Order #{invoice.invoice_number}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={14} />
                          {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Truck size={14} />
                          {invoice.payment_method}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={invoice.status}
                      color={
                        invoice.status === 'paid'
                          ? 'success'
                          : invoice.status === 'pending'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Order Total
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        ${invoice.total_amount}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setSelectedId(invoice.id)}
                      sx={{ borderRadius: 1 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Details Dialog */}
      <Dialog open={!!selectedId} onClose={() => setSelectedId(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: '1.3rem', fontWeight: 700, bgcolor: '#f5f5f5' }}>
          Order Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : detailQuery.error ? (
            <Typography color="error">Failed to load order details.</Typography>
          ) : (
            <>
              {/* Order Header */}
              <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {detailQuery.data?.invoice_number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: <strong sx={{ color: '#1976d2' }}>${detailQuery.data?.total_amount}</strong>
                </Typography>
              </Box>

              {/* Items List */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Order Items
              </Typography>
              <List dense>
                {detailQuery.data?.items?.map((item: any) => (
                  <ListItem key={item.id} sx={{ px: 0, py: 1.5, borderBottom: '1px solid #eee' }}>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500 }}>
                          {item.product_name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" display="block">
                            Quantity: {item.quantity} × ${item.unit_price}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Subtotal: ${item.total_price}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default CustomerOrders

