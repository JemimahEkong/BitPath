-- BitPath Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== ENUMS ==========

CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE session_status AS ENUM ('active', 'completed', 'quiz_pending', 'quiz_completed');
CREATE TYPE quiz_status AS ENUM ('pending', 'in_progress', 'submitted', 'graded');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'short_answer', 'true_false', 'essay');

-- ========== CONVERSATION SESSIONS ==========

CREATE TABLE conversation_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    session_number INTEGER NOT NULL,
    status session_status NOT NULL DEFAULT 'active',
    message_count INTEGER NOT NULL DEFAULT 0,
    max_messages_before_quiz INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversation_sessions_user ON conversation_sessions(user_id);
CREATE INDEX idx_conversation_sessions_course ON conversation_sessions(course_id);
CREATE INDEX idx_conversation_sessions_created ON conversation_sessions(created_at);

-- ========== CONVERSATION MESSAGES ==========

CREATE TABLE conversation_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(36) NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversation_messages_session ON conversation_messages(session_id);

-- ========== QUIZZES ==========

CREATE TABLE quizzes (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    interaction_session_id VARCHAR(36) NOT NULL REFERENCES conversation_sessions(id),
    status quiz_status NOT NULL DEFAULT 'pending',
    question_count INTEGER NOT NULL,
    time_limit_seconds INTEGER,
    passing_score_percent INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    total_questions_attempted INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    score_percent FLOAT,
    passed BOOLEAN,
    time_spent_seconds INTEGER DEFAULT 0
);

CREATE INDEX idx_quizzes_user ON quizzes(user_id);
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quizzes_created ON quizzes(created_at);

-- ========== QUIZ QUESTIONS ==========

CREATE TABLE quiz_questions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id VARCHAR(36) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    difficulty INTEGER NOT NULL,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT NOT NULL,
    topics JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);

-- ========== USER QUIZ ANSWERS ==========

CREATE TABLE user_quiz_answers (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id VARCHAR(36) NOT NULL REFERENCES quizzes(id),
    question_id VARCHAR(36) NOT NULL REFERENCES quiz_questions(id),
    answer TEXT NOT NULL,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    is_correct BOOLEAN,
    score_earned FLOAT,
    feedback TEXT,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== QUIZ RESULTS ==========

CREATE TABLE quiz_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id VARCHAR(36) NOT NULL REFERENCES quizzes(id),
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    interaction_session_id VARCHAR(36) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percent FLOAT NOT NULL,
    passed BOOLEAN NOT NULL,
    time_spent_seconds INTEGER NOT NULL,
    average_difficulty_completed FLOAT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_course ON quiz_results(course_id);

-- ========== COURSE INTERACTION PROGRESS ==========

CREATE TABLE course_interaction_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    current_session_number INTEGER NOT NULL DEFAULT 1,
    total_sessions_completed INTEGER NOT NULL DEFAULT 0,
    active_session_id VARCHAR(36),
    cumulative_engagement_score FLOAT NOT NULL DEFAULT 0.0,
    last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_interaction_progress_user ON course_interaction_progress(user_id);
CREATE INDEX idx_course_interaction_progress_course ON course_interaction_progress(course_id);

-- ========== AI INTERACTIONS (for ai_service.py) ==========

CREATE TABLE ai_interactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255) NOT NULL,
    stage_number INTEGER NOT NULL,
    interaction_number INTEGER NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_user ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_lesson ON ai_interactions(lesson_id);
