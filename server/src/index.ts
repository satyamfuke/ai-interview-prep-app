import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const CLIENT_URL = process.env.CLIENT_URL
const allowedOrigins = [CLIENT_URL, 'http://localhost:5173'].filter(Boolean)

app.use(
	cors({
		origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true)
			} else {
				callback(new Error('Not allowed by CORS'))
			}
		},
		credentials: true,
	}),
)
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)

app.get('/', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`))
