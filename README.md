# BitPath

BitPath is an AI-powered learn-and-earn platform that helps users learn Bitcoin, digital literacy, and financial skills through conversational learning experiences and reward systems.

The platform combines AI tutoring, gamified learning, Bitcoin rewards, and Lightning Network payments into a modern educational experience.

---

# Features

* AI-powered conversational learning
* Bitcoin and financial literacy education
* Gamified rewards system (XP + BTC rewards)
* Lightning Network payment integration
* Google OAuth and Email authentication
* Real-time chat-based learning workspace
* Backend job queues for reward processing
* Scalable NestJS + Next.js architecture

---

# Tech Stack

## Frontend

* Next.js 16 (Turbopack)
* Tailwind CSS
* Zustand
* NextAuth v5
* TypeScript

## Backend

* NestJS
* Prisma ORM
* PostgreSQL (Neon)
* Redis Cloud
* Bull Queue

## AI & Payments

* OpenAI GPT-4o-mini
* Breez SDK (Lightning Network)

---

# System Architecture

```text
Frontend (localhost:3000) ──HTTP──▶ Backend (localhost:3001)
                                     │
                          ┌──────────┼──────────┐
                          ▼          ▼          ▼
                       Neon DB    Redis      OpenAI
                      (Postgres)  Cloud       API
```

---

# Authentication Flow

BitPath uses NextAuth v5 for frontend authentication management.

### Supported Authentication Methods

* Email & Password (Credentials Provider)
* Google OAuth

### Authentication Process

1. User signs in through NextAuth
2. NextAuth generates a JWT session
3. Frontend calls backend authentication endpoints
4. Backend creates or reconciles the user record
5. Backend sets an httpOnly session cookie
6. Authenticated requests are made securely to the backend API

---

# Frontend Architecture

The frontend is built with Next.js App Router architecture.

## Key Frontend Systems

### Routing

The project uses the Next.js App Router structure.

```text
app/
├── workspace/
├── dashboard/
├── lib/
└── Components/
```

### State Management

Zustand is used for lightweight global state management.

Stores include:

* `useChatStore`
* `usePaymentStore`

### API Layer

The frontend communicates with the backend through centralized API modules located inside:

```text
app/lib/api/
```

These modules handle:

* Chat requests
* Payments
* Authentication
* Rewards
* User data

### UI Components

Reusable UI components are organized inside:

```text
Components/
```

Examples include:

* ChatInterface
* CourseCard
* Payment components
* Dashboard widgets

### Theme & Styling

* Tailwind CSS
* Utility-first responsive design
* Modern dark/light compatible structure

---

# Backend Architecture

The backend is built with NestJS using modular architecture principles.

## Core Backend Systems

### Authentication Module

Handles:

* Google OAuth synchronization
* JWT validation
* Session handling
* User reconciliation

### AI Tutor System

Responsible for:

* Processing user prompts
* Streaming AI responses
* Storing conversations
* Managing chat sessions

### Rewards System

Handles:

* XP rewards
* BTC rewards
* Queue-based reward processing
* Lightning payouts

### Payment System

Integrated with Breez SDK for Lightning Network operations.

Supports:

* Invoice creation
* Wallet balance retrieval
* Withdrawals
* BTC payment processing

### Queue Processing

Bull + Redis are used for background jobs such as:

* Reward processing
* AI tasks
* Payment operations
* Async notifications

---

# Project Structure

## Frontend

```text
app/
├── lib/
│   ├── api/          # HTTP clients and endpoint modules
│   ├── store/        # Zustand stores
│   └── types/        # TypeScript interfaces
│
├── Components/       # Shared UI components
├── workspace/        # AI learning workspace
├── dashboard/        # User dashboard
```

---

## Backend (`backend-nest`)

```text
backend-nest/
├── src/
│   ├── auth/
│   ├── ai/
│   ├── rewards/
│   ├── payments/
│   ├── users/
│   ├── chat/
│   └── queues/
│
├── prisma/
├── dist/
└── config/
```

---

# Environment Variables

## Frontend (`.env.local`)

```env
AUTH_SECRET=<nextauth-secret>
AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>

NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Backend (`.env`)

```env
DATABASE_URL=postgresql://...

REDIS_PUBLIC_URL=redis://...

JWT_SECRET=<jwt-secret>

FRONTEND_URL=http://localhost:3000

OPENAI_API_KEY=<openai-key>

GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
```

---

# Local Development Setup

## 1. Clone the Repository

```bash
git clone <repository-url>
```

---

## 2. Install Dependencies

### Frontend

```bash
cd BitPath
npm install
```

### Backend

```bash
cd backend-nest
npm install
```

---

## 3. Setup Database

Run Prisma migrations:

```bash
cd backend-nest
npx prisma migrate deploy
```

---

## 4. Start Development Servers

### Backend

```bash
cd backend-nest
node dist/src/main
```

Backend runs on:

```text
http://localhost:3001
```

---

### Frontend

```bash
cd BitPath
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

# Frontend ↔ Backend Integration Flow

## Chat Flow

1. User sends message from Workspace UI
2. Frontend calls backend chat endpoint
3. Backend processes request with OpenAI
4. AI response is streamed and stored
5. Frontend polls for completion
6. Updated conversation appears in UI

---

## Reward Flow

1. User completes learning activity
2. Backend triggers reward queue
3. XP/BTC rewards are calculated
4. Bull queue processes distribution
5. Lightning payout handled via Breez SDK

---

## Payment Flow

Frontend Zustand stores interact with backend endpoints for:

* Invoice creation
* Balance retrieval
* BTC withdrawals
* Transaction updates

---

# Current Status

## Completed

* Authentication (Email + Google OAuth)
* Frontend ↔ Backend integration
* AI chat UI integration
* Zustand payment store integration
* Queue-based backend processing

## In Progress

* OpenAI production quota setup
* Live Lightning payment infrastructure
* Breez SDK production node setup

---

# Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

# License

This project is currently private/internal.
