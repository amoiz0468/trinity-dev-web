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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { customerService } from '../services'
import { useState } from 'react'

const Customers = () => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    zip_code: '',
    city: '',
    country: '',
  })
  const [formError, setFormError] = useState('')

  const { data, isLoading, error } = useQuery('customers', customerService.getAll, {
    retry: 1,
  })

  // Handle paginated responses or direct array
  const customers = Array.isArray(data) ? data : (data?.results || [])

  const createMutation = useMutation(customerService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('customers')
      setOpen(false)
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        address: '',
        zip_code: '',
        city: '',
        country: '',
      })
      setFormError('')
    },
    onError: () => setFormError('Failed to create customer. Please try again.'),
  })

  const handleSubmit = () => {
    if (!form.first_name || !form.last_name || !form.email || !form.phone_number || !form.address || !form.city || !form.country || !form.zip_code) {
      setFormError('All fields are required.')
      return
    }

    createMutation.mutate(form)
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
          Customers
        </Typography>
        <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
          <Typography color="error">
            Failed to load customers. Please try again later.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Customers
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage customer information
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Add Customer
      </Button>

      {!customers || customers.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">
            No customers found. Use "Add Customer" to create one.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Country</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.full_name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone_number}</TableCell>
                  <TableCell>{customer.city}</TableCell>
                  <TableCell>{customer.country}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Customer</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="First Name"
            fullWidth
            margin="dense"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            required
          />
          <TextField
            label="Last Name"
            fullWidth
            margin="dense"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="dense"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <TextField
            label="Phone"
            fullWidth
            margin="dense"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            required
          />
          <TextField
            label="Address"
            fullWidth
            margin="dense"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <TextField
            label="ZIP Code"
            fullWidth
            margin="dense"
            value={form.zip_code}
            onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
            required
          />
          <TextField
            label="City"
            fullWidth
            margin="dense"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <TextField
            label="Country"
            fullWidth
            margin="dense"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            required
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
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Customers
