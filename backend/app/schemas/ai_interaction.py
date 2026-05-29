"""
AI Interaction schemas for chat-based tutoring system.
Handles message exchange, session tracking, and interaction limits.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    """Role of the message sender in conversation."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(BaseModel):
    """Single message in a conversation."""
    role: MessageRole
    content: str = Field(..., min_length=1, description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "Explain the concept of machine learning",
                "timestamp": "2026-05-23T10:30:00"
            }
        }


class AIMessageRequest(BaseModel):
    """Request to send a message to AI tutor."""
    course_id: str = Field(..., description="ID of the course being learned")
    session_id: Optional[str] = Field(None, description="Existing session ID, or None to create new")
    message: str = Field(..., min_length=1, max_length=5000, description="User message to AI tutor")
    
    class Config:
        json_schema_extra = {
            "example": {
                "course_id": "course_123",
                "session_id": "session_456",
                "message": "Can you explain this concept more simply?"
            }
        }


class AIMessageResponse(BaseModel):
    """Response from AI tutor."""
    session_id: str
    message: str = Field(..., description="AI tutor's response")
    timestamp: datetime
    session_message_count: int = Field(..., description="Total messages in this session")
    messages_until_quiz: int = Field(..., description="Messages remaining before quiz is triggered")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_456",
                "message": "Machine learning is a subset of AI where systems learn from data...",
                "timestamp": "2026-05-23T10:31:00",
                "session_message_count": 5,
                "messages_until_quiz": 3
            }
        }


class ConversationSessionStatus(str, Enum):
    """Status of a conversation session."""
    ACTIVE = "active"
    COMPLETED = "completed"
    QUIZ_PENDING = "quiz_pending"
    QUIZ_COMPLETED = "quiz_completed"


class ConversationSession(BaseModel):
    """Complete AI tutor conversation session."""
    session_id: str
    user_id: str
    course_id: str
    messages: List[Message] = Field(default_factory=list, description="All messages in session")
    created_at: datetime
    updated_at: datetime
    status: ConversationSessionStatus
    message_count: int = Field(..., description="Total message count (user + assistant)")
    session_number: int = Field(..., ge=1, description="Which session this is for the course (1-indexed)")
    max_messages_before_quiz: int = Field(..., ge=1, description="Message limit before quiz")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_123",
                "user_id": "user_456",
                "course_id": "course_789",
                "messages": [],
                "created_at": "2026-05-23T10:00:00",
                "updated_at": "2026-05-23T10:35:00",
                "status": "active",
                "message_count": 8,
                "session_number": 1,
                "max_messages_before_quiz": 10
            }
        }


class SessionInteractionStats(BaseModel):
    """Statistics about user interactions in a session."""
    session_id: str
    user_id: str
    course_id: str
    session_number: int
    total_messages: int
    user_message_count: int = Field(..., description="Number of user messages")
    ai_message_count: int = Field(..., description="Number of AI responses")
    session_duration_seconds: int = Field(..., description="Time spent in session")
    topics_covered: List[str] = Field(default_factory=list, description="Topics discussed")
    engagement_score: float = Field(..., ge=0, le=100, description="Session engagement 0-100")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_123",
                "user_id": "user_456",
                "course_id": "course_789",
                "session_number": 1,
                "total_messages": 8,
                "user_message_count": 4,
                "ai_message_count": 4,
                "session_duration_seconds": 1200,
                "topics_covered": ["machine_learning", "neural_networks"],
                "engagement_score": 85.5
            }
        }


class CourseInteractionProgress(BaseModel):
    """User's progress through AI interactions for a course."""
    user_id: str
    course_id: str
    current_session_number: int = Field(..., ge=1, description="Current session (1-indexed)")
    total_sessions_completed: int = Field(..., ge=0)
    active_session_id: Optional[str] = None
    sessions: List[ConversationSession] = Field(default_factory=list)
    cumulative_engagement_score: float = Field(..., ge=0, description="Average engagement across sessions")
    last_interaction_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_456",
                "course_id": "course_789",
                "current_session_number": 2,
                "total_sessions_completed": 1,
                "active_session_id": "session_123",
                "sessions": [],
                "cumulative_engagement_score": 82.3,
                "last_interaction_at": "2026-05-23T10:35:00"
            }
        }


class StartInteractionRequest(BaseModel):
    """Request to start a new AI interaction session."""
    course_id: str = Field(..., description="Course to learn")
    
    class Config:
        json_schema_extra = {
            "example": {
                "course_id": "course_123"
            }
        }


class StartInteractionResponse(BaseModel):
    """Response when starting a new interaction session."""
    session_id: str
    session_number: int
    course_id: str
    user_id: str
    created_at: datetime
    messages_until_quiz: int = Field(..., description="How many more messages before quiz is triggered")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_123",
                "session_number": 1,
                "course_id": "course_789",
                "user_id": "user_456",
                "created_at": "2026-05-23T10:00:00",
                "messages_until_quiz": 10
            }
        }
