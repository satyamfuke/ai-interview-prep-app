import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  TextField,
  Typography,
  Alert,
  Chip,
  Paper,
  Stack,
} from '@mui/material'
import api from '../api/apiClient'

interface EvaluationResult {
  correctness: {
    score: number
    feedback: string
  }
  communication: {
    score: number
    feedback: string
  }
  improvements: string[]
  overall_score: number
  summary: string
}

function getScoreColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
}

function ScoreCard({
  title,
  score,
  feedback,
}: {
  title: string
  score: number
  feedback: string
}) {
  const color = getScoreColor(score)
  return (
    <Card sx={{ flex: 1, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={score}
              color={color}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="h6" sx={{ minWidth: 45, textAlign: 'right' }}>
            {score}%
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {feedback}
        </Typography>
      </CardContent>
    </Card>
  )
}

function AnswerEvaluation() {
  const [searchParams] = useSearchParams()
  const question = searchParams.get('question') || ''
  const technology = searchParams.get('technology') || ''
  const interviewType = searchParams.get('type') || ''

  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)

  const handleEvaluate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!answer.trim()) {
      setError('Please provide an answer')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await api.post<EvaluationResult>('/evaluate-answer', {
        question,
        answer,
        technology,
        interviewType,
      })
      setEvaluation(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to evaluate answer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="dashboard-form-card" sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 3, md: 4 } }}>
      <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Answer Evaluation
      </Typography>

      {/* Question Display */}
      {question && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5', borderLeft: '4px solid #2563eb' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Question
          </Typography>
          <Typography variant="h6">{question}</Typography>
        </Paper>
      )}

      {/* Tags */}
      {(technology || interviewType) && (
        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          {technology && <Chip label={technology} color="primary" variant="outlined" />}
          {interviewType && <Chip label={interviewType} color="secondary" variant="outlined" />}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!evaluation ? (
        <form onSubmit={handleEvaluate}>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Your Answer"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading}
            variant="outlined"
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !answer.trim()}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Evaluate Answer'}
          </Button>
        </form>
      ) : (
        <Box>
          {/* Overall Score */}
          <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                Overall Score
              </Typography>
              <Typography variant="h2" sx={{ mb: 2 }}>
                {evaluation.overall_score}%
              </Typography>
              <Typography variant="h6">{evaluation.summary}</Typography>
            </CardContent>
          </Card>

          {/* Correctness and Communication Scores */}
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, mb: 4 }}>
            <ScoreCard
              title="Correctness"
              score={evaluation.correctness.score}
              feedback={evaluation.correctness.feedback}
            />
            <ScoreCard
              title="Communication"
              score={evaluation.communication.score}
              feedback={evaluation.communication.feedback}
            />
          </Box>

          {/* Improvements */}
          <Card sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">Areas for Improvement</Typography>
              </Box>
              <Stack spacing={2}>
                {evaluation.improvements.map((improvement, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      bgcolor: '#f0f4ff',
                      borderLeft: '3px solid #2563eb',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">{improvement}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setAnswer('')
                setEvaluation(null)
              }}
            >
              Try Another Answer
            </Button>
            <Button variant="contained" href="/dashboard">
              Back to Dashboard
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default AnswerEvaluation
