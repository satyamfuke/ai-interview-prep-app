import express from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { evaluateAnswer } from '../utils/aiEvaluation'

const router = express.Router()

// Local mock for OpenAI-like responses (used when MOCK_EVALUATION is enabled)
router.post('/mock-openai', (req, res) => {
  try {
    const messages = req.body.messages || []
    const userMessage = messages.find((m: any) => m.role === 'user')?.content || ''

    // Try to extract question and answer from the user message
    const match = userMessage.match(/Question:\s*"([\s\S]*?)"\s*\n\nCandidate Answer:\s*"([\s\S]*?)"/)
    const question = match ? match[1] : ''
    const answer = match ? match[2] : userMessage

    const lower = (answer || '').toLowerCase()
    const hasKeywords = ['virtual dom', 'diff', 'reconcile', 'reconciliation', 'vdom', 'render'].some((k) => lower.includes(k))

    const correctnessScore = hasKeywords ? 82 : 60
    const communicationScore = Math.max(55, Math.min(90, Math.floor((correctnessScore + 70) / 2)))

    const evaluation = {
      correctness: {
        score: correctnessScore,
        feedback: hasKeywords
          ? 'The answer mentions key concepts (virtual DOM / reconciliation) but lacks some depth and examples.'
          : 'The answer touches on the topic but misses core concepts; add details about how it works.',
      },
      communication: {
        score: communicationScore,
        feedback: 'The explanation is readable; consider structuring with an example and concise summary.',
      },
      improvements: [
        'Add a short code example demonstrating the concept',
        'Explain how reconciliation or diffing works in practice',
        'Mention performance trade-offs and when this matters',
      ],
      overall_score: Math.round((correctnessScore + communicationScore) / 2),
      summary: hasKeywords
        ? 'Mock evaluation: Good high-level knowledge, add more technical depth and examples.'
        : 'Mock evaluation: Basic understanding; expand on core internals and examples.',
    }

    // Return a Chat Completions-like shape so the client code can parse it
    return res.json({
      id: 'mock-m1',
      object: 'chat.completion',
      choices: [
        {
          message: {
            role: 'assistant',
            content: JSON.stringify(evaluation),
          },
        },
      ],
    })
  } catch (err: any) {
    console.error('mock-openai error', err)
    return res.status(500).json({ message: 'mock-openai failed' })
  }
})

function buildPrompt(technology: string, experience: string, interviewType: string) {
  return `Generate 10 ${technology} interview questions for a ${interviewType.toLowerCase()} developer with ${experience} experience.`
}

function generateQuestions(technology: string, experience: string, interviewType: string) {
  const base = `${technology} ${interviewType}`
  return [
    `Beginner: What is ${technology} and why is it used in ${interviewType.toLowerCase()} development?`,
    `Beginner: How do you structure a simple ${technology} application for a ${interviewType.toLowerCase()} role?`,
    `Beginner: Explain the difference between props and state in a ${technology} context.`,
    `Intermediate: How would you optimize rendering performance for a ${technology} app?`,
    `Intermediate: Describe a strategy to manage data flow in a ${technology} application.`,
    `Intermediate: How do you handle asynchronous operations and loading states in ${technology}?`,
    `Advanced: How would you design a scalable ${technology} architecture for a high-traffic ${interviewType.toLowerCase()} product?`,
    `Advanced: What testing approach would you use for complex ${technology} components?`,
    `Scenario: A customer reports slow interaction on a ${technology} page. How do you investigate and improve it?`,
    `Scenario: Describe how you would migrate a legacy UI into a modern ${technology} solution for a ${interviewType.toLowerCase()} team.`,
  ]
}

function generateHRQuestions(technology: string, experience: string, interviewType: string) {
  return [
    `Tell me about a time you led a ${interviewType.toLowerCase()} project using ${technology}.`,
    `How do you keep your ${technology} skills up to date as a senior developer?`,
    `Describe a challenge you faced on a ${technology} team and how you resolved it.`,
  ]
}

function generateCodingTasks(technology: string, experience: string, interviewType: string) {
  return [
    `Build a small ${technology}-based component or page that renders a list of items with filtering.`,
    `Write a function or utility in ${technology} that validates user input and provides helpful error messages.`,
  ]
}

router.post('/generate-interview', (req, res) => {
  const { technology, experience, type } = req.body
  if (!technology || !experience || !type) {
    return res.status(400).json({ message: 'technology, experience, and type are required' })
  }

  const auth = req.headers.authorization
  let userId = null
  if (auth?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(auth.split(' ')[1]) as any
      userId = payload.sub
    } catch {
      userId = null
    }
  }

  const prompt = buildPrompt(technology, experience, type)
  const technicalQuestions = generateQuestions(technology, experience, type)
  const hrQuestions = generateHRQuestions(technology, experience, type)
  const codingTasks = generateCodingTasks(technology, experience, type)

  return res.json({
    prompt,
    userId,
    technicalQuestions,
    hrQuestions,
    codingTasks,
  })
})

router.post('/evaluate-answer', async (req, res) => {
  const { question, answer, technology, interviewType } = req.body
  
  if (!question || !answer || !technology || !interviewType) {
    return res.status(400).json({ 
      message: 'question, answer, technology, and interviewType are required' 
    })
  }

  try {
    const evaluation = await evaluateAnswer(question, answer, technology, interviewType)
    return res.json(evaluation)
  } catch (error: any) {
    console.error('Evaluation error:', error)
    return res.status(500).json({ 
      message: error.message || 'Failed to evaluate answer' 
    })
  }
})

export default router
