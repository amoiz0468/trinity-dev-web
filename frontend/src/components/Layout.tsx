import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import { authService } from '../services'

const drawerWidth = 260

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Products', icon: <InventoryIcon />, path: '/products' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
]

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Drawer Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ fontSize: '28px' }}>🛍️</Box>
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            Trinity
          </Typography>
        </Box>
        <IconButton
          color="inherit"
          onClick={handleDrawerToggle}
          sx={{ display: { sm: 'none' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path)
                setMobileOpen(false)
              }}
              sx={{
                borderRadius: '8px',
                mx: 0.5,
                '&.Mui-selected': {
                  background: 'linear-gradient(90deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)',
                  borderLeft: '4px solid #667eea',
                  pl: '12px',
                  '& .MuiListItemIcon-root': {
                    color: '#667eea',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                    color: '#667eea',
                  },
                },
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(102,126,234,0.08)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout Button */}
      <Box sx={{ borderTop: '1px solid #eee', p: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '8px',
              color: '#ff6b6b',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,107,107,0.08)',
                pl: 1,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#ff6b6b' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: '#fff',
          color: '#1a1a1a',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a' }}
            >
              Back Office
            </Typography>
          </Box>

          {/* Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
            <IconButton 
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  cursor: 'pointer'
                }}
              >
                A
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid #eee',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacing for fixed AppBar */}
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
