import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access'
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh'
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'

export function signAccessToken(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET)
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES })
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET)
}

export { ACCESS_EXPIRES, REFRESH_EXPIRES }
