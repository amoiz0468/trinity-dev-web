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
  Divider,
  Alert,
  InputBase,
  Grid,
} from '@mui/material'
import { customerService } from '../services'
import { useState } from 'react'
import { Add as AddIcon, Search as SearchIcon, MailOutline as MailIcon, Phone as PhoneIcon, LocationOn as MapPinIcon } from '@mui/icons-material'

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
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, error } = useQuery('customers', customerService.getAll, {
    retry: 1,
  })

  // Handle paginated responses or direct array
  const allCustomers = Array.isArray(data) ? data : (data?.results || [])
  
  // Filter customers by search
  const customers = allCustomers.filter((customer: any) =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
          Customers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage customer information and profiles
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
            placeholder="Search customers..."
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          Add Customer
        </Button>
      </Box>

      {!customers || customers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {searchTerm ? '🔍 No customers match your search' : '👥 No customers yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Click "Add Customer" to get started'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>City</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Country</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer: any) => (
                <TableRow 
                  key={customer.id}
                  sx={{
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                    },
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{customer.full_name}</TableCell>
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
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 1 }}>
          Add New Customer
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Personal Information</Typography>
          <TextField
            label="First Name"
            fullWidth
            margin="dense"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            required
            size="small"
          />
          <TextField
            label="Last Name"
            fullWidth
            margin="dense"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            required
            size="small"
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Contact Information</Typography>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="dense"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            size="small"
          />
          <TextField
            label="Phone"
            fullWidth
            margin="dense"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            required
            size="small"
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Address</Typography>
          <TextField
            label="Street Address"
            fullWidth
            margin="dense"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
            size="small"
          />
          <Grid container spacing={1} sx={{ mt: 0.2 }}>
            <Grid item xs={6}>
              <TextField
                label="City"
                fullWidth
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="ZIP Code"
                fullWidth
                value={form.zip_code}
                onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                required
                size="small"
              />
            </Grid>
          </Grid>
          <TextField
            label="Country"
            fullWidth
            margin="dense"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            required
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
            disabled={createMutation.isLoading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {createMutation.isLoading ? 'Saving...' : 'Add Customer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Customers
