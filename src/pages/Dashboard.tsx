import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'
import { Doughnut } from 'react-chartjs-2'
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip as ChartTooltip,
} from 'chart.js'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

ChartJS.register(ArcElement, ChartTooltip, Legend)

const HISTORY_KEY = 'ai-interview-history'
const TECHNOLOGIES = ['React', 'TypeScript', 'System Design', 'Node', 'CSS']

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
    id: entry.id ?? `${Date.now()}-${entry.technology ?? entry.topic ?? 'unknown'}`,
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
  return (entry.topic ?? entry.technology ?? '').toString()
}

function getHistoryQuestionCount(entry: HistoryEntry) {
  return entry.questions?.length ?? entry.technicalQuestions?.length ?? 0
}

function Dashboard() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [selectedTech, setSelectedTech] = useState(TECHNOLOGIES[0])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const recentInterviews = useMemo(() => history.slice(0, 5), [history])

  const stats = useMemo(() => {
    const total = history.length
    const uniqueTopics = new Set(history.map((entry) => getHistoryTopic(entry).toLowerCase())).size
    const score = Math.min(98, 68 + total * 2)
    const streak = Math.min(7, Math.max(1, Math.floor(total / 2)))

    return {
      total,
      uniqueTopics,
      avgScore: score,
      streak,
    }
  }, [history])

  const weeklyProgress = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - index))
      const key = date.toISOString().split('T')[0]
      const count = history.filter((entry) => entry.date === key).length
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      }
    })
  }, [history])

  const technologyDistribution = useMemo(
    () => TECHNOLOGIES.map((tech) => ({
      name: tech,
      count: history.filter((entry) => getHistoryTopic(entry).toLowerCase().includes(tech.toLowerCase())).length,
    })),
    [history]
  )

  const selectedCount = useMemo(
    () => history.filter((entry) => getHistoryTopic(entry).toLowerCase().includes(selectedTech.toLowerCase())).length,
    [history, selectedTech]
  )

  const doughnutData = useMemo(
    () => ({
      labels: technologyDistribution.map((item) => item.name),
      datasets: [
        {
          data: technologyDistribution.map((item) => item.count),
          backgroundColor: ['#2563eb', '#4f46e5', '#f59e0b', '#10b981', '#ec4899'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    }),
    [technologyDistribution]
  )

  const doughnutOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            boxWidth: 12,
          },
        },
      },
    }),
    []
  )

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track recent interviews, progress, and your technology focus in one place.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recent interviews
              </Typography>
              <Typography variant="h5">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Topics covered
              </Typography>
              <Typography variant="h5">{stats.uniqueTopics}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Avg. confidence
              </Typography>
              <Typography variant="h5">{stats.avgScore}%</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Practice streak
              </Typography>
              <Typography variant="h5">{stats.streak} days</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, mt: 3, gridTemplateColumns: '1.5fr 1fr' }}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Weekly progress
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={weeklyProgress} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Technology selection
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {TECHNOLOGIES.map((tech) => (
                  <Chip
                    key={tech}
                    label={tech}
                    color={selectedTech === tech ? 'primary' : 'default'}
                    variant={selectedTech === tech ? 'filled' : 'outlined'}
                    onClick={() => setSelectedTech(tech)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sessions matching <strong>{selectedTech}</strong>:
              </Typography>
              <Typography variant="h5" sx={{ mb: 3 }}>
                {selectedCount}
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Topics distribution
              </Typography>
              <Box sx={{ width: '100%', height: 260 }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent interviews
        </Typography>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {recentInterviews.length > 0 ? (
            recentInterviews.map((entry) => (
              <Card key={entry.id}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {entry.date}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {getHistoryTopic(entry) || 'Untitled session'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getHistoryQuestionCount(entry)} questions generated
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  No recent interviews yet. Start a session to fill this list.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        <Button component={Link} to="/dashboard/interview" variant="contained">
          Start new interview
        </Button>
        <Button component={Link} to="/dashboard/history" variant="outlined">
          View full history
        </Button>
      </Box>
    </Box>
  )
}

export default Dashboard
