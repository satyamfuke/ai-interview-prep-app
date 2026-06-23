# PHASE 5 - AI Answer Evaluation

## Overview

PHASE 5 introduces AI-powered answer evaluation for the AI Interview Prep App. Users can submit answers to generated interview questions and receive intelligent feedback on:

- **Correctness**: Technical accuracy and completeness (0-100%)
- **Communication**: Clarity, structure, and explanation quality (0-100%)
- **Improvements**: 3-5 specific, actionable suggestions
- **Overall Score**: Composite score with summary

## Architecture

### Backend Components

#### 1. **Answer Evaluation Service** (`server/src/utils/aiEvaluation.ts`)
- Integrates with OpenAI API (GPT-4 Turbo)
- Sends structured evaluation prompts
- Parses and validates responses
- Returns typed `EvaluationResult`

#### 2. **Evaluation Endpoint** (`server/src/routes/interview.ts`)
```
POST /evaluate-answer
Content-Type: application/json
Authorization: Bearer <access_token> (optional)

Body:
{
  "question": "What is virtual DOM?",
  "answer": "The virtual DOM is...",
  "technology": "React",
  "interviewType": "Frontend"
}

Response:
{
  "correctness": {
    "score": 85,
    "feedback": "Your answer correctly explains..."
  },
  "communication": {
    "score": 78,
    "feedback": "The explanation is clear but could be more concise..."
  },
  "improvements": [
    "Add example code to illustrate the concept",
    "Explain the reconciliation algorithm",
    "Mention performance implications"
  ],
  "overall_score": 82,
  "summary": "Strong understanding with room for technical depth"
}
```

### Frontend Components

#### 1. **Answer Evaluation Page** (`src/pages/AnswerEvaluation.tsx`)
- Displays question with context
- Text area for answer submission
- Real-time evaluation feedback
- Score visualization with progress bars
- Improvement suggestions with actionable insights

#### 2. **Integration with Interview Generator**
- "Evaluate" button for each question
- Pre-fills question and context parameters
- Seamless navigation to evaluation page

## Setup Instructions

### 1. Environment Configuration

Add to `server/.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (if axios not already installed)
npm install axios
```

### 3. Database Setup

Ensure PostgreSQL is running with the database configured in `DATABASE_URL`.

### 4. Start Services

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

## Usage Flow

### From Interview Generator

1. **Generate Questions** → Select technology, experience, type → Click "Generate"
2. **View Questions** → Technical, HR, and coding questions displayed
3. **Evaluate Question** → Click "Evaluate" button on any question
4. **Submit Answer** → Type your answer in the evaluation page
5. **Get Feedback** → Receive detailed scores and suggestions

### Direct Access

Navigate to: `/dashboard/evaluate?question=<question>&technology=<tech>&type=<type>`

## API Integration Details

### OpenAI Configuration

- **Model**: GPT-4 Turbo
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Max Tokens**: 1000
- **System Role**: Expert interviewer evaluator

### Error Handling

- Missing `OPENAI_API_KEY` → 500 error
- Invalid request parameters → 400 error
- OpenAI API failures → 500 with descriptive message

## Score Interpretation

| Score Range | Level | Meaning |
|------------|-------|---------|
| 80-100 | Excellent | Deep understanding, clear communication |
| 60-79 | Good | Solid knowledge, minor gaps |
| 0-59 | Needs Work | Fundamental misunderstandings or gaps |

## Data Storage

Currently, evaluations are **not persisted** in the database. To add persistence:

1. Create `Evaluation` model in `server/prisma/schema.prisma`:
```prisma
model Evaluation {
  id        Int     @id @default(autoincrement())
  userId    Int
  question  String
  answer    String
  score     Int
  feedback  Json
  createdAt DateTime @default(now())
  user      User    @relation(fields: [userId], references: [id])
}
```

2. Update evaluation endpoint to save results
3. Create history/analytics views

## Limitations & Future Enhancements

### Current Limitations
- Requires active OpenAI API subscription and valid key
- No caching of evaluations
- Limited to 1000 tokens per evaluation response
- No offline mode

### Planned Enhancements
- **Response Caching**: Cache evaluations for identical questions
- **Evaluation History**: Store all evaluations in database
- **Analytics Dashboard**: Track improvement over time
- **Multi-Language Support**: Evaluate answers in different languages
- **Custom Rubrics**: Allow users to set evaluation criteria
- **Peer Comparison**: Compare scores with other users
- **AI Models**: Support Claude, LLaMA, or other models

## Troubleshooting

### "OPENAI_API_KEY is not configured"
✅ Check `server/.env` contains valid key
✅ Restart server after adding key
✅ Verify key has API access (not just organization member)

### "No response from OpenAI"
✅ Check OpenAI API status: https://status.openai.com
✅ Verify API key quotas and billing
✅ Check internet connectivity

### Evaluation Takes Too Long
✅ OpenAI responses can take 5-10 seconds
✅ Consider using faster models (GPT-3.5 Turbo) for production
✅ Implement response timeout handling

### "Could not parse evaluation response"
✅ Check OpenAI response format in server logs
✅ Verify prompt produces valid JSON
✅ Update parsing logic if format changes

## Code Examples

### Frontend: Triggering Evaluation
```typescript
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

const handleEvaluateQuestion = (question: string) => {
  navigate(`/dashboard/evaluate?question=${encodeURIComponent(question)}&technology=React&type=Frontend`)
}
```

### Backend: Custom Evaluation Logic
```typescript
// Modify server/src/utils/aiEvaluation.ts
const evaluation = await evaluateAnswer(
  "Explain React hooks",
  userAnswer,
  "React",
  "Frontend"
)

console.log(`Score: ${evaluation.overall_score}%`)
evaluation.improvements.forEach(imp => console.log(`- ${imp}`))
```

## Files Added/Modified

### New Files
- `server/src/utils/aiEvaluation.ts` - OpenAI integration service
- `src/pages/AnswerEvaluation.tsx` - Evaluation UI component
- `server/.env.example` - Environment template

### Modified Files
- `server/src/routes/interview.ts` - Added `/evaluate-answer` endpoint
- `server/package.json` - Added axios dependency
- `src/routes/AppRoutes.tsx` - Added evaluation route
- `src/pages/InterviewGenerator.tsx` - Added evaluation buttons

## Performance Considerations

- **API Latency**: 5-10 seconds per evaluation (OpenAI processing)
- **Token Usage**: ~300-500 tokens per evaluation
- **Cost**: ~$0.01 per evaluation (GPT-4 Turbo pricing)
- **Rate Limits**: Check OpenAI account for request limits

## Security Notes

- Never commit `.env` with real API keys
- Use environment variables in production
- Consider rate limiting evaluations per user
- Validate and sanitize user input before sending to OpenAI
- Add authentication checks for evaluation endpoint

---

**Last Updated**: June 2026
**Version**: 1.0.0
