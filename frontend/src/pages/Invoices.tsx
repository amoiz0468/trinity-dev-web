import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert,
  InputBase,
  Grid,
} from '@mui/material'
import { invoiceService, customerService, productService } from '../services'
import { format } from 'date-fns'
import { useState } from 'react'
import { Add as AddIcon, Search as SearchIcon, Receipt as ReceiptIcon } from '@mui/icons-material'

const Invoices = () => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [statusValue, setStatusValue] = useState<'pending' | 'paid' | 'cancelled' | 'refunded'>('pending')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const [statusError, setStatusError] = useState('')
  const [form, setForm] = useState({
    customer: '',
    payment_method: 'cash',
    tax_rate: '0',
    product: '',
    quantity: '1',
    unit_price: '',
    notes: '',
  })
  const [formError, setFormError] = useState('')

  const { data, isLoading, error } = useQuery('invoices', invoiceService.getAll, {
    retry: 1,
  })

  const customersQuery = useQuery('customers', customerService.getAll, { retry: 1 })
  const productsQuery = useQuery('products', productService.getAll, { retry: 1 })

  // Handle paginated responses or direct array
  const invoices = Array.isArray(data) ? data : (data?.results || [])
  const customers = Array.isArray(customersQuery.data)
    ? customersQuery.data
    : (customersQuery.data?.results || [])
  const products = Array.isArray(productsQuery.data)
    ? productsQuery.data
    : (productsQuery.data?.results || [])

  const createMutation = useMutation(invoiceService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('invoices')
      setOpen(false)
      setForm({
        customer: '',
        payment_method: 'cash',
        tax_rate: '0',
        product: '',
        quantity: '1',
        unit_price: '',
        notes: '',
      })
      setFormError('')
    },
    onError: () => setFormError('Failed to create invoice. Please try again.'),
  })

  const statusMutation = useMutation(
    (payload: { id: number; status: string }) =>
      invoiceService.update(payload.id, { status: payload.status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices')
        setStatusOpen(false)
        setSelectedInvoiceId(null)
        setStatusError('')
      },
      onError: () => setStatusError('Failed to update invoice status.'),
    }
  )

  const handleSubmit = () => {
    if (!form.customer || !form.product || !form.quantity || !form.unit_price) {
      setFormError('Customer, product, quantity, and unit price are required.')
      return
    }

    const payload = {
      customer: Number(form.customer),
      payment_method: form.payment_method,
      tax_rate: Number(form.tax_rate) || 0,
      notes: form.notes || undefined,
      items: [
        {
          product: Number(form.product),
          quantity: Number(form.quantity),
          unit_price: Number(form.unit_price),
        },
      ],
    }

    createMutation.mutate(payload)
  }

  const openStatusDialog = (invoice: any) => {
    setSelectedInvoiceId(invoice.id)
    setStatusValue(invoice.status)
    setStatusError('')
    setStatusOpen(true)
  }

  const handleStatusUpdate = () => {
    if (!selectedInvoiceId) return
    statusMutation.mutate({ id: selectedInvoiceId, status: statusValue })
  }

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
          Invoices
        </Typography>
        <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
          <Typography color="error">
            Failed to load invoices. Please try again later.
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
          Invoices
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage customer invoices
        </Typography>
      </Box>

      {/* Top Actions & Search Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
        <Box
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 auto' },
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f5f5f5',
            borderRadius: '24px',
            px: 2,
            py: 1,
            gap: 1,
            maxWidth: { xs: '100%', sm: 400 },
          }}
        >
          <SearchIcon sx={{ color: '#999', fontSize: 20 }} />
          <InputBase
            placeholder="Search invoices..."
            sx={{
              color: '#1a1a1a',
              '& input': {
                padding: '8px 0',
                fontSize: '0.9rem',
              },
              '& input::placeholder': {
                color: '#999',
                opacity: 1,
              },
              flex: 1,
            }}
          />
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 600,
            px: 3,
            py: 1.2,
          }}
        >
          Add Invoice
        </Button>
      </Box>

      {!invoices || invoices.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            📋 No invoices yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Add Invoice" to create your first invoice
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1a1a' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice: any) => (
                <TableRow 
                  key={invoice.id}
                  sx={{
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                    },
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>{invoice.invoice_number}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{invoice.customer_name}</TableCell>
                  <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>${invoice.total_amount}</TableCell>
                  <TableCell>{invoice.payment_method}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={
                        invoice.status === 'paid'
                          ? 'success'
                          : invoice.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openStatusDialog(invoice)}>
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 1 }}>
          Create New Invoice
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Customer & Invoice Details</Typography>
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel id="customer-label">Customer *</InputLabel>
            <Select
              labelId="customer-label"
              value={form.customer}
              label="Customer *"
              onChange={(e) => setForm({ ...form, customer: e.target.value as string })}
              required
            >
              {customers.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.full_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" size="small">
            <InputLabel id="payment-label">Payment Method</InputLabel>
            <Select
              labelId="payment-label"
              value={form.payment_method}
              label="Payment Method"
              onChange={(e) => setForm({ ...form, payment_method: e.target.value as string })}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Tax Rate (%)"
            type="number"
            fullWidth
            margin="dense"
            value={form.tax_rate}
            onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
            size="small"
            inputProps={{ step: "0.1", min: "0", max: "100" }}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Product Details</Typography>
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel id="product-label">Product *</InputLabel>
            <Select
              labelId="product-label"
              value={form.product}
              label="Product *"
              onChange={(e) => setForm({ ...form, product: e.target.value as string })}
              required
            >
              {products.map((p: any) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={1} sx={{ mt: 0.2, mb: 1.5 }}>
            <Grid item xs={6}>
              <TextField
                label="Quantity *"
                type="number"
                fullWidth
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
                size="small"
                inputProps={{ min: "1" }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Unit Price *"
                type="number"
                fullWidth
                value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                required
                size="small"
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Notes"
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            size="small"
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={createMutation.isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isLoading || customersQuery.isLoading || productsQuery.isLoading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {createMutation.isLoading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 1 }}>
          Update Invoice Status
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {statusError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {statusError}
            </Alert>
          )}
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={statusValue}
              label="Status"
              onChange={(e) => setStatusValue(e.target.value as any)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusOpen(false)} disabled={statusMutation.isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={statusMutation.isLoading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {statusMutation.isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Invoices
