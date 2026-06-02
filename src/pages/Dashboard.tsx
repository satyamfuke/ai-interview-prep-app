import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button, Container, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import type { AppDispatch } from '../app/store'

function Dashboard() {
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
    <Container component="main" maxWidth="md" className="page page-dashboard" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Box className="dashboard-form-card" sx={{ textAlign: 'center', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Welcome to your AI Interview Prep dashboard.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button component={Link} to="/interview" variant="contained">
            Start Interview
          </Button>
          <Button component={Link} to="/profile" variant="outlined">
            View Profile
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default Dashboard
