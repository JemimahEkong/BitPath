"""
Quiz schemas for assessments triggered after AI interaction sessions.
Quizzes are automatically generated based on the conversation content.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class QuestionType(str, Enum):
    """Type of quiz question."""
    MULTIPLE_CHOICE = "multiple_choice"
    SHORT_ANSWER = "short_answer"
    TRUE_FALSE = "true_false"
    ESSAY = "essay"


class QuizQuestionOption(BaseModel):
    """Option for multiple choice question."""
    id: str
    text: str
    is_correct: Optional[bool] = None  # None when shown to user, True/False when grading
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "opt_1",
                "text": "A subset of AI focusing on learning from data"
            }
        }


class QuizQuestion(BaseModel):
    """Single quiz question based on AI interaction content."""
    question_id: str
    question_text: str = Field(..., min_length=5, description="The question")
    question_type: QuestionType
    difficulty: int = Field(..., ge=1, le=5, description="Difficulty 1-5")
    options: Optional[List[QuizQuestionOption]] = Field(None, description="For multiple choice/true_false")
    correct_answer: Optional[str] = Field(None, description="For short answer/essay")
    explanation: str = Field(..., description="Why this answer is correct")
    topics: List[str] = Field(default_factory=list, description="Topics this question covers")
    
    class Config:
        json_schema_extra = {
            "example": {
                "question_id": "q_1",
                "question_text": "What is machine learning?",
                "question_type": "multiple_choice",
                "difficulty": 2,
                "options": [
                    {"id": "opt_1", "text": "A subset of AI focusing on learning from data"},
                    {"id": "opt_2", "text": "A programming language"},
                    {"id": "opt_3", "text": "A type of robot"}
                ],
                "explanation": "Machine learning is a subset of AI where systems improve through data.",
                "topics": ["machine_learning", "ai_basics"]
            }
        }


class UserQuizAnswer(BaseModel):
    """User's answer to a quiz question."""
    question_id: str
    answer: str = Field(..., description="User's answer text or selected option id")
    time_spent_seconds: int = Field(..., ge=0, description="Time spent on this question")
    
    class Config:
        json_schema_extra = {
            "example": {
                "question_id": "q_1",
                "answer": "opt_1",
                "time_spent_seconds": 45
            }
        }


class QuestionGradingResult(BaseModel):
    """Grading result for a single question."""
    question_id: str
    user_answer: str
    is_correct: bool
    score_earned: float = Field(..., ge=0, le=1, description="Score as decimal 0-1")
    feedback: str = Field(..., description="Feedback for the answer")
    correct_answer: Optional[str] = Field(None, description="The correct answer")
    
    class Config:
        json_schema_extra = {
            "example": {
                "question_id": "q_1",
                "user_answer": "opt_1",
                "is_correct": True,
                "score_earned": 1.0,
                "feedback": "Correct! This is the definition of machine learning.",
                "correct_answer": "opt_1"
            }
        }


class QuizStatus(str, Enum):
    """Status of a quiz."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


class Quiz(BaseModel):
    """Complete quiz assessment."""
    quiz_id: str
    user_id: str
    course_id: str
    interaction_session_id: str = Field(..., description="Session that triggered this quiz")
    questions: List[QuizQuestion]
    created_at: datetime
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    graded_at: Optional[datetime] = None
    status: QuizStatus
    question_count: int
    time_limit_seconds: Optional[int] = Field(None, description="Time limit in seconds, None = no limit")
    passing_score_percent: int = Field(..., ge=0, le=100, description="Percentage needed to pass")
    
    class Config:
        json_schema_extra = {
            "example": {
                "quiz_id": "quiz_123",
                "user_id": "user_456",
                "course_id": "course_789",
                "interaction_session_id": "session_123",
                "questions": [],
                "created_at": "2026-05-23T10:35:00",
                "started_at": "2026-05-23T10:35:30",
                "submitted_at": None,
                "graded_at": None,
                "status": "in_progress",
                "question_count": 5,
                "time_limit_seconds": 900,
                "passing_score_percent": 70
            }
        }


class QuizSubmission(BaseModel):
    """User's submission of a quiz."""
    quiz_id: str
    answers: List[UserQuizAnswer]
    submitted_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "quiz_id": "quiz_123",
                "answers": [
                    {"question_id": "q_1", "answer": "opt_1", "time_spent_seconds": 45},
                    {"question_id": "q_2", "answer": "True", "time_spent_seconds": 30}
                ],
                "submitted_at": "2026-05-23T10:45:00"
            }
        }


class QuizResult(BaseModel):
    """Graded quiz result."""
    quiz_id: str
    user_id: str
    course_id: str
    interaction_session_id: str
    submitted_at: datetime
    graded_at: datetime
    total_questions: int
    correct_answers: int
    score_percent: float = Field(..., ge=0, le=100, description="Percentage score")
    passed: bool = Field(..., description="True if score >= passing_score_percent")
    question_results: List[QuestionGradingResult]
    time_spent_seconds: int = Field(..., description="Total time spent on quiz")
    average_difficulty_completed: float = Field(..., ge=1, le=5, description="Average difficulty of questions attempted")
    
    class Config:
        json_schema_extra = {
            "example": {
                "quiz_id": "quiz_123",
                "user_id": "user_456",
                "course_id": "course_789",
                "interaction_session_id": "session_123",
                "submitted_at": "2026-05-23T10:45:00",
                "graded_at": "2026-05-23T10:45:05",
                "total_questions": 5,
                "correct_answers": 4,
                "score_percent": 80.0,
                "passed": True,
                "question_results": [],
                "time_spent_seconds": 245,
                "average_difficulty_completed": 2.5
            }
        }


class TriggeredQuizResponse(BaseModel):
    """Response when a quiz is automatically triggered after interaction session."""
    quiz_id: str
    session_id: str
    quiz: Quiz = Field(..., description="The quiz to take")
    message: str = Field(..., description="Message informing user of quiz")
    
    class Config:
        json_schema_extra = {
            "example": {
                "quiz_id": "quiz_123",
                "session_id": "session_123",
                "quiz": {},
                "message": "Great learning session! Let's test your knowledge with a quick quiz."
            }
        }


class CourseQuizHistory(BaseModel):
    """User's quiz history for a course."""
    user_id: str
    course_id: str
    total_quizzes_completed: int
    passed_quizzes: int
    average_score: float = Field(..., ge=0, le=100)
    best_score: float = Field(..., ge=0, le=100)
    worst_score: float = Field(..., ge=0, le=100)
    quiz_results: List[QuizResult] = Field(default_factory=list)
    last_quiz_at: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_456",
                "course_id": "course_789",
                "total_quizzes_completed": 3,
                "passed_quizzes": 2,
                "average_score": 78.3,
                "best_score": 85.0,
                "worst_score": 70.0,
                "quiz_results": [],
                "last_quiz_at": "2026-05-23T10:45:00"
            }
        }
