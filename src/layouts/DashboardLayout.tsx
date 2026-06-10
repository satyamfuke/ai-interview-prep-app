import { useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Box, Button, Container, Divider, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import type { AppDispatch } from '../app/store'

function DashboardLayout() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    const result = await dispatch(logout())
    if (logout.fulfilled.match(result)) {
      localStorage.removeItem('accessToken')
      navigate('/login')
    }
  }, [dispatch, navigate])

  return (
    <Container component="main" maxWidth="xl" className="page page-dashboard">
      <Box className="dashboard-layout-shell">
        <Box className="dashboard-sidebar">
          <Typography variant="h6" sx={{ mb: 2 }}>
            Interview Prep
          </Typography>
          <Button
            component={NavLink}
            to="/dashboard"
            fullWidth
            className={({ isActive }) => isActive ? 'dashboard-nav-item active' : 'dashboard-nav-item'}
            sx={{ mb: 1, textTransform: 'none' }}
          >
            Dashboard
          </Button>
          <Button
            component={NavLink}
            to="/dashboard/interview"
            fullWidth
            className={({ isActive }) => isActive ? 'dashboard-nav-item active' : 'dashboard-nav-item'}
            sx={{ mb: 1, textTransform: 'none' }}
          >
            Interview Generator
          </Button>
          <Button
            component={NavLink}
            to="/dashboard/history"
            fullWidth
            className={({ isActive }) => isActive ? 'dashboard-nav-item active' : 'dashboard-nav-item'}
            sx={{ mb: 1, textTransform: 'none' }}
          >
            History
          </Button>
          <Button
            component={NavLink}
            to="/dashboard/profile"
            fullWidth
            className={({ isActive }) => isActive ? 'dashboard-nav-item active' : 'dashboard-nav-item'}
            sx={{ mb: 1, textTransform: 'none' }}
          >
            Profile
          </Button>
          <Divider sx={{ my: 2 }} />
          <Button variant="contained" color="secondary" onClick={handleLogout} fullWidth>
            Logout
          </Button>
        </Box>
        <Box className="dashboard-content">
          <Outlet />
        </Box>
      </Box>
    </Container>
  )
}

export default DashboardLayout
