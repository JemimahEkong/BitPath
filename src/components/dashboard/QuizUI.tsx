'use client';

import React from 'react';
import type { QuizQuestion } from './types';

interface QuizUIProps {
  currentQuiz: QuizQuestion[];
  currentQuestionIndex: number;
  quizAnswer: string;
  isQuizLoading: boolean;
  lastAnsweredQuestionIndex: number | null;
  unclaimedRewards: any[];
  isClaimingRewards: boolean;
  onAnswerChange: (value: string) => void;
  onSubmitAnswer: () => void;
  onDismiss: () => void;
  onClaimRewards: () => void;
}

export default function QuizUI({
  currentQuiz,
  currentQuestionIndex,
  quizAnswer,
  isQuizLoading,
  lastAnsweredQuestionIndex,
  unclaimedRewards,
  isClaimingRewards,
  onAnswerChange,
  onSubmitAnswer,
  onDismiss,
  onClaimRewards,
}: QuizUIProps) {
  const answeredCount = currentQuiz.filter(q => q.answer && q.answer !== '').length;
  const isComplete = answeredCount === currentQuiz.length;
  const allCorrect = currentQuiz.every(q => q.isCorrect === true);
  const totalCorrect = currentQuiz.filter(q => q.isCorrect === true).length;
  const totalSatoshi = currentQuiz.reduce((sum, q) => sum + (q.satoshiEarned || 0), 0);

  if (!isComplete) {
    const currentQuestion = currentQuiz[currentQuestionIndex];
    return (
      <div style={{ maxWidth: 876, margin: '0 auto', padding: '32px 72px' }}>
        {/* Quiz Progress Header */}
        <div style={{
          background: 'linear-gradient(135deg, #8C4F00, #6B3B00)',
          color: '#ffffff',
          padding: '20px 24px',
          borderRadius: 18,
          marginBottom: 24,
          boxShadow: '0 6px 24px rgba(140,79,0,0.35)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                fontFamily: 'var(--font-inter)',
                margin: '0 0 4px',
              }}>
                Quiz in Progress!
              </h3>
              <p style={{ fontSize: 14, opacity: 0.9, margin: 0, fontFamily: 'var(--font-inter)' }}>
                Question {currentQuestionIndex + 1} of {currentQuiz.length}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-inter)' }}>
                {totalCorrect}
              </div>
              <div style={{ fontSize: 14, opacity: 0.9, fontFamily: 'var(--font-inter)' }}>
                {totalSatoshi} satoshi earned
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{
            height: 10,
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 10,
            overflow: 'hidden',
            marginTop: 16,
          }}>
            <div style={{
              height: '100%',
              background: '#ffffff',
              width: `${((currentQuestionIndex + (answeredCount > 0 ? 1 : 0)) / currentQuiz.length) * 100}%`,
              borderRadius: 10,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Encouraging Message */}
        {lastAnsweredQuestionIndex !== null &&
          lastAnsweredQuestionIndex === currentQuestionIndex - 1 &&
          currentQuiz &&
          currentQuiz[lastAnsweredQuestionIndex]?.encouragingMessage && (
          <div style={{
            background: currentQuiz[lastAnsweredQuestionIndex]?.isCorrect
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#ffffff',
            padding: '24px 28px',
            borderRadius: 18,
            marginBottom: 24,
            boxShadow: currentQuiz[lastAnsweredQuestionIndex]?.isCorrect
              ? '0 6px 24px rgba(16,185,129,0.35)'
              : '0 6px 24px rgba(245,158,11,0.35)',
          }}>
            <p style={{
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.7,
              margin: 0,
              fontFamily: 'var(--font-inter)',
            }}>
              {currentQuiz[lastAnsweredQuestionIndex].encouragingMessage}
            </p>
          </div>
        )}

        {/* Current Question */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '28px 32px',
          borderRadius: 18,
          marginBottom: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #f3f4f6',
        }}>
          <h4 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#101828',
            marginBottom: 16,
            fontFamily: 'var(--font-inter)',
          }}>
            {currentQuestion?.question}
          </h4>

          <textarea
            value={quizAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isQuizLoading}
            style={{
              width: '100%',
              minHeight: 100,
              padding: '16px 20px',
              border: '2px solid #e5e7eb',
              borderRadius: 16,
              fontSize: 15,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'var(--font-inter)',
              backgroundColor: '#ffffff',
              color: '#0A0A0A',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#8C4F00'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
          />

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onSubmitAnswer}
              disabled={!quizAnswer.trim() || isQuizLoading}
              style={{
                padding: '14px 32px',
                backgroundColor: !quizAnswer.trim() || isQuizLoading ? '#9CA3AF' : '#8C4F00',
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'var(--font-inter)',
                cursor: !quizAnswer.trim() || isQuizLoading ? 'not-allowed' : 'pointer',
                boxShadow: !quizAnswer.trim() || isQuizLoading
                  ? 'none'
                  : '0 6px 20px rgba(140,79,0,0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              {isQuizLoading ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 876, margin: '0 auto', padding: '32px 72px' }}>
      {/* Quiz Complete */}
      <div style={{
        background: allCorrect
          ? 'linear-gradient(135deg, #10b981, #059669)'
          : 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: '#ffffff',
        padding: '40px 36px',
        borderRadius: 22,
        marginBottom: 24,
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
      }}>
        <h2 style={{
          fontSize: 32,
          fontWeight: 800,
          fontFamily: 'var(--font-inter)',
          margin: '0 0 12px',
        }}>
          {allCorrect ? 'Quiz Passed!' : 'Quiz Complete'}
        </h2>
        <p style={{
          fontSize: 18,
          opacity: 0.95,
          marginBottom: 28,
          fontFamily: 'var(--font-inter)',
        }}>
          {allCorrect
            ? 'Excellent job! Your next quiz will have more questions!'
            : 'Keep practicing! Try again to master the material!'}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 48,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 40, fontWeight: 800, fontFamily: 'var(--font-inter)' }}>
              {totalCorrect}/{currentQuiz.length}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, fontFamily: 'var(--font-inter)' }}>
              Correct Answers
            </div>
          </div>
          <div>
            <div style={{ fontSize: 40, fontWeight: 800, fontFamily: 'var(--font-inter)' }}>
              {totalSatoshi}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, fontFamily: 'var(--font-inter)' }}>
              Satoshi Earned
            </div>
          </div>
        </div>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          {allCorrect && unclaimedRewards.length > 0 && (
            <button
              onClick={onClaimRewards}
              disabled={isClaimingRewards}
              style={{
                padding: '16px 40px',
                backgroundColor: isClaimingRewards ? '#9CA3AF' : '#F59E0B',
                color: '#ffffff',
                border: 'none',
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'var(--font-inter)',
                cursor: isClaimingRewards ? 'not-allowed' : 'pointer',
                boxShadow: isClaimingRewards ? 'none' : '0 6px 20px rgba(245,158,11,0.4)',
                transition: 'all 0.3s ease',
              }}
            >
              {isClaimingRewards
                ? 'Claiming...'
                : `Claim ${unclaimedRewards.length} Reward${unclaimedRewards.length > 1 ? 's' : ''}`
              }
            </button>
          )}
          <button
            onClick={onDismiss}
            style={{
              padding: '16px 40px',
              backgroundColor: '#ffffff',
              color: allCorrect ? '#059669' : '#dc2626',
              border: 'none',
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 700,
              fontFamily: 'var(--font-inter)',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
            }}
          >
            Return to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
