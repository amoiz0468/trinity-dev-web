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
  Divider,
} from '@mui/material'
import { Lock, User, Eye, EyeOff } from 'lucide-react'
import { authService } from '../services'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authService.login(username, password)
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      const me = await authService.getMe()
      const role = me.user.is_staff ? 'staff' : 'customer'
      authService.setRole(role)
      navigate(role === 'staff' ? '/dashboard' : '/customer')
    } catch (err: any) {
      authService.logout()
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
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
        p: 2,
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
                Trinity
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.95rem' }}
              >
                Professional Ecommerce Platform
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Username Field */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Username or Email
              </Typography>
              <TextField
                required
                fullWidth
                placeholder="Enter your username or email"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <User size={18} style={{ marginRight: '12px', color: '#999' }} />
                  ),
                }}
              />

              {/* Password Field */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Password
              </Typography>
              <TextField
                required
                fullWidth
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <Lock size={18} style={{ marginRight: '12px', color: '#999' }} />
                  ),
                  endAdornment: (
                    <Button
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ minWidth: 'auto', p: 0 }}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </Button>
                  ),
                }}
              />

              {/* Sign In Button */}
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
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/register')}
              >
                Create Customer Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Login

