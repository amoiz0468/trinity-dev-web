import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  Grid,
  Divider,
} from '@mui/material'
import { UserPlus, Mail, Lock, MapPin } from 'lucide-react'
import { authService } from '../services'

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    zip_code: '',
    city: '',
    country: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await authService.register(form)
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      const data = err.response?.data
      const fieldErrors =
        data && typeof data === 'object'
          ? Object.values(data).flat().filter(Boolean)
          : []
      const message =
        fieldErrors[0] ||
        data?.detail ||
        'Registration failed. Please check your details.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo/Brand Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 700,
                }}
              >
                🛍️
              </Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}
              >
                Create Account
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.95rem' }}
              >
                Join Trinity and start shopping
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Personal Info */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserPlus size={18} />
                Personal Information
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    First Name
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    placeholder="John"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    variant="outlined"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    Last Name
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    placeholder="Doe"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    variant="outlined"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
              </Grid>

              {/* Contact */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                <Mail size={18} />
                Contact Information
              </Typography>

              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Email Address
              </Typography>
              <TextField
                required
                fullWidth
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                variant="outlined"
                size="small"
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />

              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Phone Number
              </Typography>
              <TextField
                required
                fullWidth
                placeholder="+1 (555) 123-4567"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                variant="outlined"
                size="small"
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />

              {/* Address */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                <MapPin size={18} />
                Address
              </Typography>

              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Street Address
              </Typography>
              <TextField
                required
                fullWidth
                placeholder="123 Main St"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                variant="outlined"
                size="small"
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    City
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    placeholder="New York"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    variant="outlined"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    Postal Code
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    placeholder="10001"
                    value={form.zip_code}
                    onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                    variant="outlined"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
              </Grid>

              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Country
              </Typography>
              <TextField
                required
                fullWidth
                placeholder="United States"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                variant="outlined"
                size="small"
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />

              {/* Password */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                <Lock size={18} />
                Security
              </Typography>

              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Password
              </Typography>
              <TextField
                required
                fullWidth
                type="password"
                placeholder="Enter a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                variant="outlined"
                size="small"
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  mb: 2,
                  fontSize: '1rem',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6b3a8e 100%)',
                  },
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Already have an account? Sign In
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Register

