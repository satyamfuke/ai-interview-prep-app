import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from '@mui/material'
import type { RootState } from '../app/store'

const HISTORY_KEY = 'ai-interview-history'

type HistoryEntry = {
  id: string
  topic?: string
  technology?: string
  questions?: string[]
  technicalQuestions?: string[]
  hrQuestions?: string[]
  codingTasks?: string[]
  date: string
}

function normalizeHistoryEntry(entry: any): HistoryEntry {
  return {
    id: entry.id ?? `${Date.now()}-${entry.technology ?? entry.topic ?? 'session'}`,
    topic: entry.topic ?? entry.technology,
    technology: entry.technology ?? entry.topic,
    questions: entry.questions ?? entry.technicalQuestions ?? [],
    technicalQuestions: entry.technicalQuestions ?? entry.questions ?? [],
    hrQuestions: entry.hrQuestions ?? [],
    codingTasks: entry.codingTasks ?? [],
    date: entry.date ?? new Date().toISOString().split('T')[0],
  }
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeHistoryEntry)
  } catch {
    return []
  }
}

function getHistoryTopic(entry: HistoryEntry) {
  return (entry.topic ?? entry.technology ?? 'Unknown').toString()
}

function Profile() {
  const user = useSelector((state: RootState) => state.auth.user)
  const history = useMemo(() => loadHistory(), [])

  const sessionCount = history.length
  const lastSession = history[0]
  const favoriteTopic = useMemo(() => {
    const counts = new Map<string, number>()
    history.forEach((entry) => {
      const topic = getHistoryTopic(entry)
      if (!topic) return
      counts.set(topic, (counts.get(topic) ?? 0) + 1)
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No sessions yet'
  }, [history])

  const recentTopics = history.slice(0, 3).map(getHistoryTopic)

  const displayName = user?.name || user?.email || 'Guest'
  const displayEmail = user?.email || 'No email available'
  const initial = displayName.charAt(0).toUpperCase() || 'G'

  return (
    <Box className="dashboard-form-card" sx={{ maxWidth: 920, mx: 'auto', p: { xs: 3, md: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'center', width: '100%' }}>
          <Avatar sx={{ width: 86, height: 86, bgcolor: '#2563eb', fontSize: 32 }}>{initial}</Avatar>
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {displayName}
            </Typography>
            <Typography color="text.secondary">{displayEmail}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%' }}>
          <Button component={Link} to="/dashboard" variant="outlined">
            Dashboard
          </Button>
          <Button component={Link} to="/dashboard/history" variant="contained">
            View history
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: '0 24px 64px rgba(15, 23, 42, 0.12)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Account stats
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Interview sessions
                </Typography>
                <Typography variant="h5">{sessionCount}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Favorite topic
                </Typography>
                <Typography variant="h5">{favoriteTopic}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Last session
                </Typography>
                <Typography variant="h5">{lastSession?.date ?? 'No sessions yet'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: '0 24px 64px rgba(15, 23, 42, 0.12)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your profile page shows a quick overview of your activity and interview focus areas.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Toggle through your recent topics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {recentTopics.length > 0 ? (
                  recentTopics.map((topic) => (
                    <Chip key={topic} label={topic} color="primary" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Generate your first interview to start tracking topics.
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          About your profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          This page uses your current account details and interview history to keep your progress visible.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Keep generating interview questions to build a richer history and improve your profile insights.
        </Typography>
      </Box>
    </Box>
  )
}

export default Profile
