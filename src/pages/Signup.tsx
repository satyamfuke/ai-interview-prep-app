import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button, Container, TextField, Typography, Alert, CircularProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { signup } from '../features/auth/authSlice'
import type { AppDispatch, RootState } from '../app/store'

function Signup() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(signup({ name, email, password }))
    if (signup.fulfilled.match(result)) {
      navigate('/login')
    }
  }

  return (
    <Container component="main" maxWidth="xs" className="page page-signup">
      <Box className="form-card">
        <Typography component="h1" variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          Signup
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            name="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create account'}
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          Return <Link to="/">home</Link>.
        </Typography>
      </Box>
    </Container>
  )
}

export default Signup
