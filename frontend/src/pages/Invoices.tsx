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
} from '@mui/material'
import { invoiceService, customerService, productService } from '../services'
import { format } from 'date-fns'
import { useState } from 'react'

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
      <Typography variant="h4" gutterBottom>
        Invoices
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View and manage invoices
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Add Invoice
      </Button>

      {!invoices || invoices.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">
            No invoices found. Use "Add Invoice" to create one.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
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
                    <Button size="small" onClick={() => openStatusDialog(invoice)}>
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Invoice</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel id="customer-label">Customer</InputLabel>
            <Select
              labelId="customer-label"
              value={form.customer}
              label="Customer"
              onChange={(e) => setForm({ ...form, customer: e.target.value as string })}
              required
            >
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.full_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
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
          />

          <FormControl fullWidth margin="dense">
            <InputLabel id="product-label">Product</InputLabel>
            <Select
              labelId="product-label"
              value={form.product}
              label="Product"
              onChange={(e) => setForm({ ...form, product: e.target.value as string })}
              required
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />

          <TextField
            label="Unit Price"
            type="number"
            fullWidth
            margin="dense"
            value={form.unit_price}
            onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
            required
          />

          <TextField
            label="Notes"
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          {formError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={createMutation.isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isLoading || customersQuery.isLoading || productsQuery.isLoading}
          >
            {createMutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Update Invoice Status</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <FormControl fullWidth margin="dense">
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
          {statusError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {statusError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusOpen(false)} disabled={statusMutation.isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={statusMutation.isLoading}
          >
            {statusMutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Invoices
