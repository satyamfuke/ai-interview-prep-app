import { Link } from 'react-router-dom'
import { Box, Button, Container, Typography } from '@mui/material'

function Home() {
  return (
    <Container component="main" maxWidth="md" className="page page-home">
      <Box className="form-card" sx={{ textAlign: 'center' }}>
        <Typography component="h1" variant="h3" sx={{ mb: 2 }}>
          AI Interview App
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button component={Link} to="/login" variant="contained">
            Login
          </Button>
          <Button component={Link} to="/signup" variant="outlined">
            Signup
          </Button>
          <Button component={Link} to="/dashboard" variant="text">
            Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default Home
