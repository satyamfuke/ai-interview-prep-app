import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { SelectChangeEvent } from '@mui/material/Select'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import api from '../api/apiClient'

const HISTORY_KEY = 'ai-interview-history'

type HistoryEntry = {
  id: string
  technology: string
  experience: string
  type: string
  technicalQuestions: string[]
  hrQuestions: string[]
  codingTasks: string[]
  date: string
}

type GenerateInterviewResponse = {
  prompt: string
  technicalQuestions: string[]
  hrQuestions: string[]
  codingTasks: string[]
}

function saveHistoryEntry(entry: HistoryEntry) {
  const existing = typeof window !== 'undefined'
    ? localStorage.getItem(HISTORY_KEY)
    : null

  const history: HistoryEntry[] = existing ? JSON.parse(existing) : []
  const updated = [entry, ...history].slice(0, 20)

  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

const TECHNOLOGIES = ['React', 'TypeScript', 'Node', 'CSS', 'System Design']
const EXPERIENCES = ['0-1 years', '2-3 years', '4-6 years', '7+ years']
const INTERVIEW_TYPES = ['Frontend', 'Backend', 'Fullstack', 'Mobile']

function InterviewGenerator() {
  const [technology, setTechnology] = useState(TECHNOLOGIES[0])
  const [experience, setExperience] = useState(EXPERIENCES[2])
  const [interviewType, setInterviewType] = useState(INTERVIEW_TYPES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<string[]>([])
  const [hrQuestions, setHrQuestions] = useState<string[]>([])
  const [codingTasks, setCodingTasks] = useState<string[]>([])

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await api.post<GenerateInterviewResponse>('/generate-interview', {
        technology,
        experience,
        type: interviewType,
      })

      const payload = response.data
      setQuestions(payload.technicalQuestions)
      setHrQuestions(payload.hrQuestions)
      setCodingTasks(payload.codingTasks)

      saveHistoryEntry({
        id: `${Date.now()}-${technology}`,
        technology,
        experience,
        type: interviewType,
        technicalQuestions: payload.technicalQuestions,
        hrQuestions: payload.hrQuestions,
        codingTasks: payload.codingTasks,
        date: new Date().toISOString().split('T')[0],
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to generate interview questions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="dashboard-form-card">
      <Typography component="h1" variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
        AI Interview Question Generator
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Select your technology, experience, and interview type to generate technical questions, HR prompts, and coding tasks.
      </Typography>

      <Box component="form" onSubmit={handleGenerate} sx={{ mb: 4, display: 'grid', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="technology-label">Technology</InputLabel>
          <Select
            labelId="technology-label"
            value={technology}
            label="Technology"
            onChange={(event: SelectChangeEvent) => setTechnology(event.target.value)}
          >
            {TECHNOLOGIES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="experience-label">Experience</InputLabel>
          <Select
            labelId="experience-label"
            value={experience}
            label="Experience"
            onChange={(event: SelectChangeEvent) => setExperience(event.target.value)}
          >
            {EXPERIENCES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="type-label">Interview type</InputLabel>
          <Select
            labelId="type-label"
            value={interviewType}
            label="Interview type"
            onChange={(event: SelectChangeEvent) => setInterviewType(event.target.value)}
          >
            {INTERVIEW_TYPES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Generate interview'}
        </Button>
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {questions.length > 0 && (
        <Box sx={{ display: 'grid', gap: 3, mb: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Technical questions
              </Typography>
              {questions.map((question, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  {index + 1}. {question}
                </Typography>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                HR questions
              </Typography>
              {hrQuestions.map((question, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  {index + 1}. {question}
                </Typography>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Coding tasks
              </Typography>
              {codingTasks.map((task, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  {index + 1}. {task}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button component={Link} to="/dashboard" variant="outlined">
          Back to dashboard
        </Button>
        <Button component={Link} to="/dashboard/history" variant="text">
          View history
        </Button>
      </Box>
    </Box>
  )
}

export default InterviewGenerator
