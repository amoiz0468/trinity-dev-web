import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  Button,
  Alert,
} from '@mui/material'
import { authService } from '../services'

const CustomerProfile = () => {
  const { data, isLoading, error, refetch } = useQuery('me', authService.getMe, {
    retry: 1,
  })
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
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (data?.customer) {
      setForm({
        first_name: data.customer.first_name || '',
        last_name: data.customer.last_name || '',
        email: data.customer.email || '',
        phone_number: data.customer.phone_number || '',
        address: data.customer.address || '',
        zip_code: data.customer.zip_code || '',
        city: data.customer.city || '',
        country: data.customer.country || '',
      })
    }
  }, [data])

  const updateMutation = useMutation(authService.updateMe, {
    onSuccess: () => {
      setSuccess('Profile updated successfully.')
      setFormError('')
      refetch()
    },
    onError: () => {
      setFormError('Failed to update profile. Please try again.')
      setSuccess('')
    },
  })

  const handleSubmit = () => {
    setFormError('')
    setSuccess('')
    updateMutation.mutate(form)
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
          My Profile
        </Typography>
        <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
          <Typography color="error">
            Failed to load your profile. Please try again later.
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (!data?.customer) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">
            No customer profile found for this account.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Update your contact information
      </Typography>

      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <TextField
          label="First Name"
          fullWidth
          margin="dense"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <TextField
          label="Last Name"
          fullWidth
          margin="dense"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="dense"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          label="Phone Number"
          fullWidth
          margin="dense"
          value={form.phone_number}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
        />
        <TextField
          label="Address"
          fullWidth
          margin="dense"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <TextField
          label="ZIP Code"
          fullWidth
          margin="dense"
          value={form.zip_code}
          onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
        />
        <TextField
          label="City"
          fullWidth
          margin="dense"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <TextField
          label="Country"
          fullWidth
          margin="dense"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={updateMutation.isLoading}
        >
          {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Paper>
    </Box>
  )
}

export default CustomerProfile
