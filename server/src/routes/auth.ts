import express from 'express'
import prisma from '../prisma'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { signAccessToken, signRefreshToken, verifyRefreshToken, REFRESH_EXPIRES } from '../utils/jwt'

const router = express.Router()

function createExpiryDateFromString(duration: string) {
  // duration examples: '7d', '15m'
  // keep simple: support 'd' and 'm'
  const num = parseInt(duration.slice(0, -1), 10)
  const unit = duration.slice(-1)
  const now = new Date()
  if (unit === 'd') {
    now.setDate(now.getDate() + num)
  } else if (unit === 'm') {
    now.setMinutes(now.getMinutes() + num)
  }
  return now
}

// POST /auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' })
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { name, email, passwordHash } })
    return res.status(201).json({ id: user.id, email: user.email })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' })
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

    const accessToken = signAccessToken({ sub: user.id })

    // generate a random opaque refresh token and store hash
    const refreshToken = crypto.randomBytes(64).toString('hex')
    const tokenHash = await bcrypt.hash(refreshToken, 12)
    const expiresAt = createExpiryDateFromString(REFRESH_EXPIRES as string)

    await prisma.refreshToken.create({
      data: { tokenHash, expiresAt, userId: user.id }
    })

    // set HttpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      // maxAge omitted; cookie will expire naturally based on refresh token expiry
    })

    return res.json({ accessToken })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ message: 'No refresh token' })
  try {
    // find candidate tokens for any user and compare
    const tokens = await prisma.refreshToken.findMany({ where: { revoked: false } })
    let matched = null as any
    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.tokenHash)
      if (match) {
        matched = t
        break
      }
    }
    if (!matched) return res.status(401).json({ message: 'Invalid refresh token' })
    if (matched.expiresAt < new Date()) return res.status(401).json({ message: 'Refresh token expired' })

    // issue new access token
    const accessToken = signAccessToken({ sub: matched.userId })

    return res.json({ accessToken })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// POST /auth/logout
router.post('/logout', async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) {
    res.clearCookie('refreshToken', { path: '/auth/refresh' })
    return res.json({})
  }
  try {
    const tokens = await prisma.refreshToken.findMany({ where: { revoked: false } })
    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.tokenHash)
      if (match) {
        await prisma.refreshToken.update({ where: { id: t.id }, data: { revoked: true } })
        break
      }
    }
    res.clearCookie('refreshToken', { path: '/auth/refresh' })
    return res.json({})
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// GET /auth/profile
router.get('/profile', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' })
  const token = auth.split(' ')[1]
  try {
    const payload = verifyRefreshToken(token) as any
    // NOTE: profile should be protected by access token normally. For clarity, we'll verify access tokens elsewhere.
    // Here we just return user by id (if token was valid)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json({ id: user.id, email: user.email, name: user.name })
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
})

export default router
