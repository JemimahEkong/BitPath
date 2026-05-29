# BitPath Backend API Contract

Base URL for local development:

```text
http://127.0.0.1:8000
```

## Frontend Auth Header

For protected routes, the Next.js frontend sends the Supabase access token: The access token can come from any enabled Supabase OAuth provider, including Google, Apple, or Twitter/X. The backend verifies the token the same way for all providers.

```http
Authorization: Bearer <supabase_access_token>
```

The backend verifies the token and uses the Supabase `sub` claim as the BitPath user id.

## CORS

Local frontend origins currently allowed:

```text
http://localhost:3000
http://127.0.0.1:3000
```

## Endpoints

### `GET /health`

Checks whether the backend is running.

Response:

```json
{
  "status": "ok",
  "service": "bitpath-backend",
  "environment": "development"
}
```

### `GET /api/auth/me`

Protected route for testing Supabase login integration.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response:

```json
{
  "user_id": "supabase-user-id",
  "email": "learner@example.com"
}
```

Error responses:

```json
{
  "detail": "Missing bearer token"
}
```

```json
{
  "detail": "Invalid or expired token"
}
```

## AI Interaction Endpoints

### `POST /api/ai/interact/start`

Start a new AI interaction session for a course.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Request:

```json
{
  "course_id": "course_123"
}
```

Response (201 Created):

```json
{
  "session_id": "session_uuid",
  "session_number": 1,
  "course_id": "course_123",
  "user_id": "user_uuid",
  "created_at": "2026-05-23T10:00:00",
  "messages_until_quiz": 10
}
```

### `POST /api/ai/interact/message`

Send a message to the AI tutor in an ongoing session.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Request:

```json
{
  "course_id": "course_123",
  "session_id": "session_uuid",
  "message": "Can you explain this concept?"
}
```

Response:

```json
{
  "session_id": "session_uuid",
  "message": "Sure! Here's an explanation...",
  "timestamp": "2026-05-23T10:01:00",
  "session_message_count": 4,
  "messages_until_quiz": 6
}
```

**Note**: When `messages_until_quiz` reaches 0, a quiz is automatically triggered. Return a special flag or endpoint to indicate this.

### `GET /api/ai/interact/session/{session_id}`

Retrieve a complete conversation session with all messages.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response:

```json
{
  "session_id": "session_uuid",
  "user_id": "user_uuid",
  "course_id": "course_123",
  "messages": [
    {
      "role": "user",
      "content": "What is machine learning?",
      "timestamp": "2026-05-23T10:00:30"
    },
    {
      "role": "assistant",
      "content": "Machine learning is...",
      "timestamp": "2026-05-23T10:00:35"
    }
  ],
  "created_at": "2026-05-23T10:00:00",
  "updated_at": "2026-05-23T10:05:00",
  "status": "active",
  "message_count": 4,
  "session_number": 1,
  "max_messages_before_quiz": 10
}
```

### `GET /api/ai/interact/sessions?course_id=course_123`

List all interaction sessions for the current user in a course.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response:

```json
[
  {
    "session_id": "session_uuid_1",
    "user_id": "user_uuid",
    "course_id": "course_123",
    "messages": [],
    "created_at": "2026-05-23T10:00:00",
    "updated_at": "2026-05-23T10:00:00",
    "status": "completed",
    "message_count": 10,
    "session_number": 1,
    "max_messages_before_quiz": 10
  },
  {
    "session_id": "session_uuid_2",
    "user_id": "user_uuid",
    "course_id": "course_123",
    "messages": [],
    "created_at": "2026-05-23T11:00:00",
    "updated_at": "2026-05-23T11:05:00",
    "status": "active",
    "message_count": 3,
    "session_number": 2,
    "max_messages_before_quiz": 10
  }
]
```

### `DELETE /api/ai/interact/session/{session_id}`

Delete an interaction session (soft delete recommended).

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response: 204 No Content

## Quiz Endpoints

### `GET /api/quiz/quiz/{quiz_id}`

Retrieve a quiz that is ready to be taken. Questions have their correct answers hidden from the user.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response:

```json
{
  "quiz_id": "quiz_uuid",
  "user_id": "user_uuid",
  "course_id": "course_123",
  "interaction_session_id": "session_uuid",
  "questions": [
    {
      "question_id": "q_1",
      "question_text": "What is machine learning?",
      "question_type": "multiple_choice",
      "difficulty": 2,
      "options": [
        {
          "id": "opt_1",
          "text": "A subset of AI focusing on learning from data"
        },
        {
          "id": "opt_2",
          "text": "A programming language"
        }
      ],
      "explanation": null,
      "topics": ["machine_learning", "ai_basics"]
    }
  ],
  "created_at": "2026-05-23T10:35:00",
  "started_at": null,
  "submitted_at": null,
  "graded_at": null,
  "status": "pending",
  "question_count": 5,
  "time_limit_seconds": 900,
  "passing_score_percent": 70
}
```

### `GET /api/quiz/quiz/{quiz_id}/status`

Get the current status of a quiz without full content.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response:

```json
{
  "quiz_id": "quiz_uuid",
  "status": "pending",
  "created_at": "2026-05-23T10:35:00",
  "started_at": null,
  "submitted_at": null,
  "graded_at": null
}
```

### `POST /api/quiz/quiz/{quiz_id}/submit`

Submit a completed quiz for automatic grading.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Request:

```json
{
  "quiz_id": "quiz_uuid",
  "answers": [
    {
      "question_id": "q_1",
      "answer": "opt_1",
      "time_spent_seconds": 45
    },
    {
      "question_id": "q_2",
      "answer": "True",
      "time_spent_seconds": 30
    }
  ],
  "submitted_at": "2026-05-23T10:45:00"
}
```

Response (201 Created):

```json
{
  "quiz_id": "quiz_uuid",
  "user_id": "user_uuid",
  "course_id": "course_123",
  "interaction_session_id": "session_uuid",
  "submitted_at": "2026-05-23T10:45:00",
  "graded_at": "2026-05-23T10:45:05",
  "total_questions": 5,
  "correct_answers": 4,
  "score_percent": 80.0,
  "passed": true,
  "question_results": [
    {
      "question_id": "q_1",
      "user_answer": "opt_1",
      "is_correct": true,
      "score_earned": 1.0,
      "feedback": "Correct! Machine learning is indeed a subset of AI.",
      "correct_answer": "opt_1"
    }
  ],
  "time_spent_seconds": 245,
  "average_difficulty_completed": 2.5
}
```

### `GET /api/quiz/quiz/{quiz_id}/result`

Retrieve the graded result of a completed quiz.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response:

```json
{
  "quiz_id": "quiz_uuid",
  "user_id": "user_uuid",
  "course_id": "course_123",
  "interaction_session_id": "session_uuid",
  "submitted_at": "2026-05-23T10:45:00",
  "graded_at": "2026-05-23T10:45:05",
  "total_questions": 5,
  "correct_answers": 4,
  "score_percent": 80.0,
  "passed": true,
  "question_results": [],
  "time_spent_seconds": 245,
  "average_difficulty_completed": 2.5
}
```

### `GET /api/quiz/course/{course_id}/history`

Get user's complete quiz history for a course.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response:

```json
{
  "user_id": "user_uuid",
  "course_id": "course_123",
  "total_quizzes_completed": 3,
  "passed_quizzes": 2,
  "average_score": 78.3,
  "best_score": 85.0,
  "worst_score": 70.0,
  "quiz_results": [
    {
      "quiz_id": "quiz_uuid_1",
      "submitted_at": "2026-05-23T10:45:00",
      "graded_at": "2026-05-23T10:45:05",
      "total_questions": 5,
      "correct_answers": 4,
      "score_percent": 80.0,
      "passed": true
    }
  ],
  "last_quiz_at": "2026-05-23T10:45:00"
}
```

### `GET /api/quiz/course/{course_id}/stats`

Get summary statistics for quizzes in a course without full history.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response:

```json
{
  "course_id": "course_123",
  "total_quizzes_completed": 3,
  "passed_quizzes": 2,
  "average_score": 78.3,
  "pass_rate": 66.7,
  "last_quiz_at": "2026-05-23T10:45:00"
}
```

### `GET /api/quiz/pending`

Get all pending quizzes waiting to be started.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response:

```json
[
  {
    "quiz_id": "quiz_uuid",
    "course_id": "course_123",
    "interaction_session_id": "session_uuid",
    "status": "pending",
    "question_count": 5,
    "created_at": "2026-05-23T10:35:00"
  }
]
```

## Frontend Fetch Example

```ts
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});

const user = await response.json();
```