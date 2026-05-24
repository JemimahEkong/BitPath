"""
Pydantic schemas for BitPath backend.
"""

# AI Interaction schemas
from app.schemas.ai_interaction import (
    MessageRole,
    Message,
    AIMessageRequest,
    AIMessageResponse,
    ConversationSessionStatus,
    ConversationSession,
    SessionInteractionStats,
    CourseInteractionProgress,
    StartInteractionRequest,
    StartInteractionResponse,
)

# Quiz schemas
from app.schemas.quiz import (
    QuestionType,
    QuizQuestionOption,
    QuizQuestion,
    UserQuizAnswer,
    QuestionGradingResult,
    QuizStatus,
    Quiz,
    QuizSubmission,
    QuizResult,
    TriggeredQuizResponse,
    CourseQuizHistory,
)

__all__ = [
    # AI Interaction
    "MessageRole",
    "Message",
    "AIMessageRequest",
    "AIMessageResponse",
    "ConversationSessionStatus",
    "ConversationSession",
    "SessionInteractionStats",
    "CourseInteractionProgress",
    "StartInteractionRequest",
    "StartInteractionResponse",
    # Quiz
    "QuestionType",
    "QuizQuestionOption",
    "QuizQuestion",
    "UserQuizAnswer",
    "QuestionGradingResult",
    "QuizStatus",
    "Quiz",
    "QuizSubmission",
    "QuizResult",
    "TriggeredQuizResponse",
    "CourseQuizHistory",
]
