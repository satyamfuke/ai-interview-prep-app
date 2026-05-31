import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button, Container, TextField, Typography, Alert, CircularProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../features/auth/authSlice'
import type { AppDispatch, RootState } from '../app/store'

function Login() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(login({ email, password }))
    console.log('login result', result)
    if (login.fulfilled.match(result)) {
      localStorage.setItem('accessToken', result.payload.accessToken)
      navigate('/dashboard')
    }
  }

  return (
    <Container component="main" maxWidth="xs" className="page page-login">
      <Box className="form-card">
        <Typography component="h1" variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
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
            placeholder="Password"
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
            {loading ? <CircularProgress size={24} /> : 'Sign in'}
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          New here? <Link to="/signup">Create an account</Link>
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          Go back <Link to="/">home</Link>.
        </Typography>
      </Box>
    </Container>
  )
}

export default Login
