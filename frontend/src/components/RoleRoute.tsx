import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { authService } from '../services'

interface RoleRouteProps {
  allow: Array<'staff' | 'customer'>
  children: React.ReactNode
}

const RoleRoute = ({ allow, children }: RoleRouteProps) => {
  const [loading, setLoading] = useState(false)
  const [checkedRole, setCheckedRole] = useState(false)
  const [role, setRole] = useState(authService.getRole())
  const [authValid, setAuthValid] = useState(true)
  const isAuthenticated = authService.isAuthenticated()

  useEffect(() => {
    let active = true
    if (isAuthenticated && !checkedRole) {
      setLoading(true)
      authService
        .getMe()
        .then((data) => {
          if (!active) return
          const detectedRole = data.user.is_staff ? 'staff' : 'customer'
          authService.setRole(detectedRole)
          setRole(detectedRole)
        })
        .catch(() => {
          if (!active) return
          authService.logout()
          setAuthValid(false)
        })
        .finally(() => {
          if (active) {
            setLoading(false)
            setCheckedRole(true)
          }
        })
    }
    return () => {
      active = false
    }
  }, [isAuthenticated, checkedRole])

  if (!isAuthenticated || !authValid) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (role && !allow.includes(role as 'staff' | 'customer')) {
    return <Navigate to={role === 'staff' ? '/dashboard' : '/customer'} replace />
  }

  return <>{children}</>
}

export default RoleRoute
