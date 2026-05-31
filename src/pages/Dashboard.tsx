import { Link } from 'react-router-dom'
import { Box, Button, Container, Typography } from '@mui/material'

function Dashboard() {
  return (
    <Container component="main" maxWidth="md" className="page page-dashboard">
      <Box className="form-card" sx={{ textAlign: 'center' }}>
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Welcome to your AI Interview Prep dashboard.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button component={Link} to="/" variant="outlined">
            Home
          </Button>
          <Button component={Link} to="/login" variant="contained">
            Login
          </Button>
          <Button component={Link} to="/signup" variant="contained" color="secondary">
            Signup
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default Dashboard
