import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Typography, List, ListItem, ListItemText } from '@mui/material'

type HistoryEntry = {
  id: string
  topic: string
  questions: string[]
  date: string
}

const HISTORY_KEY = 'ai-interview-history'

function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(HISTORY_KEY) : null
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  const handleClear = () => {
    localStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }

  return (
    <Box className="dashboard-form-card">
      <Typography component="h1" variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
        Interview History
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Review your recent interview practice sessions and revisit topics you have generated.
      </Typography>

      {history.length > 0 ? (
        <List sx={{ mb: 4 }}>
          {history.map((item) => (
            <ListItem key={item.id} sx={{ borderRadius: 2, mb: 1, background: '#f8fafc' }}>
              <ListItemText
                primary={item.topic}
                secondary={`Generated on ${item.date}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          No history yet. Generate an interview to save your first session.
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button component={Link} to="/dashboard" variant="outlined">
          Back to dashboard
        </Button>
        <Button component={Link} to="/dashboard/interview" variant="contained">
          New interview
        </Button>
        {history.length > 0 && (
          <Button variant="text" color="error" onClick={handleClear}>
            Clear history
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default History
