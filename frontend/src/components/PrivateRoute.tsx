import { Navigate } from 'react-router-dom'
import { authService } from '../services'

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const isAuthenticated = authService.isAuthenticated()

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default PrivateRoute
