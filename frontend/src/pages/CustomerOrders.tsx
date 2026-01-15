import { useQuery } from 'react-query'
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
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
      <Box>
        <Typography variant="h4" gutterBottom>
          My Orders
        </Typography>
        <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
          <Typography color="error">
            Failed to load your orders. Please try again later.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View your recent invoices
      </Typography>

      {!invoices || invoices.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">
            No orders found yet.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>${invoice.total_amount}</TableCell>
                  <TableCell>{invoice.payment_method}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setSelectedId(invoice.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!selectedId} onClose={() => setSelectedId(null)} fullWidth maxWidth="sm">
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {detailQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : detailQuery.error ? (
            <Typography color="error">Failed to load invoice details.</Typography>
          ) : (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {detailQuery.data?.invoice_number}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Total: ${detailQuery.data?.total_amount}
              </Typography>
              <List dense>
                {detailQuery.data?.items?.map((item: any) => (
                  <ListItem key={item.id} disableGutters>
                    <ListItemText
                      primary={`${item.product_name} x ${item.quantity}`}
                      secondary={`$${item.unit_price} each • $${item.total_price}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CustomerOrders
