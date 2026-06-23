import axios from 'axios'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
const MOCK_EVALUATION = process.env.MOCK_EVALUATION === 'true'

export interface EvaluationResult {
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

export async function evaluateAnswer(
  question: string,
  answer: string,
  technology: string,
  interviewType: string
): Promise<EvaluationResult> {
  // Allow running mock evaluation without an OpenAI API key
  if (MOCK_EVALUATION) {
    // Lightweight heuristic: bump scores slightly if answer contains keywords
    const lower = (answer || '').toLowerCase()
    const hasKeywords = ['virtual dom', 'diff', 'reconcile', 'reconciliation', 'vdom', 'render'].some((k) => lower.includes(k))

    const correctnessScore = hasKeywords ? 82 : 60
    const communicationScore = Math.max(55, Math.min(90, Math.floor((correctnessScore + 70) / 2)))

    const mock: EvaluationResult = {
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

    return mock
  }

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const systemPrompt = `You are an expert ${technology} ${interviewType} interview evaluator. 
Evaluate interview answers based on:
1. Correctness: Technical accuracy and completeness
2. Communication: Clarity, structure, and how well they explain concepts
3. Improvements: Specific, actionable suggestions for improvement

Respond in JSON format with this structure:
{
  "correctness": {
    "score": number (0-100),
    "feedback": "specific feedback on technical accuracy"
  },
  "communication": {
    "score": number (0-100),
    "feedback": "specific feedback on how they explained concepts"
  },
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "overall_score": number (0-100),
  "summary": "brief overall assessment"
}`

  const userPrompt = `Question: "${question}"

Candidate Answer: "${answer}"

Please evaluate this answer comprehensively and provide your response in valid JSON format.`

  try {
    const apiUrl = MOCK_EVALUATION
      ? process.env.MOCK_OPENAI_URL || `http://localhost:${process.env.PORT || 4000}/mock-openai`
      : OPENAI_API_URL

    const response = await axios.post(
      apiUrl,
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          // Only send Authorization header when not using the mock endpoint
          ...(MOCK_EVALUATION ? {} : { Authorization: `Bearer ${OPENAI_API_KEY}` }),
          'Content-Type': 'application/json',
        },
      }
    )

    const content = response.data.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse evaluation response')
    }

    const evaluation = JSON.parse(jsonMatch[0]) as EvaluationResult
    return evaluation
  } catch (error: any) {
    const status = error.response?.status
    const data = error.response?.data
    console.error('OpenAI API error:', { status, data, message: error.message })
    const msg = data?.error?.message || data?.message || error.message || 'Unknown OpenAI error'
    throw new Error(`Failed to evaluate answer: ${msg}`)
  }
}
