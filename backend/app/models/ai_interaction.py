"""
SQLAlchemy ORM models for AI interactions and quizzes.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

Base = declarative_base()


class MessageRoleEnum(PyEnum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class SessionStatusEnum(PyEnum):
    """Session status enumeration."""
    ACTIVE = "active"
    COMPLETED = "completed"
    QUIZ_PENDING = "quiz_pending"
    QUIZ_COMPLETED = "quiz_completed"


class QuizStatusEnum(PyEnum):
    """Quiz status enumeration."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


class QuestionTypeEnum(PyEnum):
    """Question type enumeration."""
    MULTIPLE_CHOICE = "multiple_choice"
    SHORT_ANSWER = "short_answer"
    TRUE_FALSE = "true_false"
    ESSAY = "essay"


class ConversationMessage(Base):
    """Stores individual messages in conversations."""
    __tablename__ = "conversation_messages"

    id = Column(String(36), primary_key=True)
    session_id = Column(String(36), ForeignKey("conversation_sessions.id"), nullable=False)
    role = Column(SQLEnum(MessageRoleEnum), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("ConversationSession", back_populates="messages")

    def __repr__(self):
        return f"<ConversationMessage {self.id} by {self.role}>"


class ConversationSession(Base):
    """Stores AI tutor conversation sessions."""
    __tablename__ = "conversation_sessions"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(255), nullable=False, index=True)
    course_id = Column(String(255), nullable=False, index=True)
    session_number = Column(Integer, nullable=False)
    status = Column(SQLEnum(SessionStatusEnum), default=SessionStatusEnum.ACTIVE, nullable=False)
    message_count = Column(Integer, default=0, nullable=False)
    max_messages_before_quiz = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    messages = relationship("ConversationMessage", back_populates="session", cascade="all, delete-orphan")
    quiz = relationship("Quiz", back_populates="interaction_session", uselist=False)

    def __repr__(self):
        return f"<ConversationSession {self.id} for user {self.user_id}>"


class Quiz(Base):
    """Stores quiz assessments triggered after interaction sessions."""
    __tablename__ = "quizzes"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(255), nullable=False, index=True)
    course_id = Column(String(255), nullable=False, index=True)
    interaction_session_id = Column(String(36), ForeignKey("conversation_sessions.id"), nullable=False)
    status = Column(SQLEnum(QuizStatusEnum), default=QuizStatusEnum.PENDING, nullable=False)
    question_count = Column(Integer, nullable=False)
    time_limit_seconds = Column(Integer, nullable=True)
    passing_score_percent = Column(Integer, nullable=False, default=70)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    started_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    graded_at = Column(DateTime, nullable=True)
    total_questions_attempted = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    score_percent = Column(Float, nullable=True)
    passed = Column(Boolean, nullable=True)
    time_spent_seconds = Column(Integer, default=0)

    interaction_session = relationship("ConversationSession", back_populates="quiz")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    results = relationship("QuizResult", back_populates="quiz", uselist=False)

    def __repr__(self):
        return f"<Quiz {self.id} for user {self.user_id}>"


class QuizQuestion(Base):
    """Stores quiz questions."""
    __tablename__ = "quiz_questions"

    id = Column(String(36), primary_key=True)
    quiz_id = Column(String(36), ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionTypeEnum), nullable=False)
    difficulty = Column(Integer, nullable=False)  # 1-5
    options = Column(JSON, nullable=True)  # For multiple choice/true/false: list of dicts with id, text, is_correct
    correct_answer = Column(Text, nullable=True)  # For short answer/essay
    explanation = Column(Text, nullable=False)
    topics = Column(JSON, default=list, nullable=False)  # List of topic strings
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    quiz = relationship("Quiz", back_populates="questions")
    user_answer = relationship("UserQuizAnswer", back_populates="question", uselist=False)

    def __repr__(self):
        return f"<QuizQuestion {self.id}>"


class UserQuizAnswer(Base):
    """Stores user's answers during quiz."""
    __tablename__ = "user_quiz_answers"

    id = Column(String(36), primary_key=True)
    quiz_id = Column(String(36), ForeignKey("quizzes.id"), nullable=False)
    question_id = Column(String(36), ForeignKey("quiz_questions.id"), nullable=False)
    answer = Column(Text, nullable=False)
    time_spent_seconds = Column(Integer, nullable=False, default=0)
    is_correct = Column(Boolean, nullable=True)
    score_earned = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    question = relationship("QuizQuestion", back_populates="user_answer")

    def __repr__(self):
        return f"<UserQuizAnswer {self.id}>"


class QuizResult(Base):
    """Stores graded quiz results."""
    __tablename__ = "quiz_results"

    id = Column(String(36), primary_key=True)
    quiz_id = Column(String(36), ForeignKey("quizzes.id"), nullable=False)
    user_id = Column(String(255), nullable=False, index=True)
    course_id = Column(String(255), nullable=False, index=True)
    interaction_session_id = Column(String(36), nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    score_percent = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    time_spent_seconds = Column(Integer, nullable=False)
    average_difficulty_completed = Column(Float, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    graded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    quiz = relationship("Quiz", back_populates="results")

    def __repr__(self):
        return f"<QuizResult {self.id}>"


class CourseInteractionProgressModel(Base):
    """Tracks user's progression through AI interactions for a course."""
    __tablename__ = "course_interaction_progress"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(255), nullable=False, index=True)
    course_id = Column(String(255), nullable=False, index=True)
    current_session_number = Column(Integer, default=1, nullable=False)
    total_sessions_completed = Column(Integer, default=0, nullable=False)
    active_session_id = Column(String(36), nullable=True)
    cumulative_engagement_score = Column(Float, default=0.0, nullable=False)
    last_interaction_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<CourseInteractionProgress user={self.user_id} course={self.course_id}>"
