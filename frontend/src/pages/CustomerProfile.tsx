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
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'
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
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Paper sx={{ p: 3, bgcolor: '#ffebee', borderRadius: 2 }}>
          <Typography color="error">
            Failed to load your profile. Please try again later.
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (!data?.customer) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography color="text.secondary">
            No customer profile found for this account.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <User size={36} />
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Update your personal information
        </Typography>
      </Box>

      {formError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {formError}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <User size={20} />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                First Name
              </Typography>
              <TextField
                fullWidth
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Enter first name"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Last Name
              </Typography>
              <TextField
                fullWidth
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Enter last name"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, my: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail size={20} />
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter email"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Phone Number
              </Typography>
              <TextField
                fullWidth
                type="tel"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="Enter phone number"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, my: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={20} />
                Address Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Street Address
              </Typography>
              <TextField
                fullWidth
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter address"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                City
              </Typography>
              <TextField
                fullWidth
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Enter city"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Postal Code
              </Typography>
              <TextField
                fullWidth
                value={form.zip_code}
                onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                placeholder="Enter postal code"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Country
              </Typography>
              <TextField
                fullWidth
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Enter country"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Save size={18} />}
                  onClick={handleSubmit}
                  disabled={updateMutation.isLoading}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    py: 1.2,
                    px: 3,
                    borderRadius: 1.5,
                  }}
                >
                  {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CustomerProfile
