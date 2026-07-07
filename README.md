# LVL_UP — AI Life Dashboard

LVL_UP is a personal intelligence layer for everyday life. It combines daily logging, reflection, and AI-guided insights into a calm, high-signal dashboard that helps you understand your mood, sleep, habits, hobbies, money, and overall momentum in one place.

Instead of treating self-improvement as a collection of scattered notes, LVL_UP turns your lived experience into a coherent system: log once, reflect often, and let the app surface meaningful patterns over time.

## Why this exists

Modern life is full of fragmented data: mood in one app, sleep in another, expenses in a bank feed, habits in memory, and goals in a notebook. LVL_UP brings those signals together so people can answer questions like:

- Why do I feel more drained on certain days?
- What habits actually improve my energy?
- Am I spending more than I realize?
- What should I focus on next week?

The result is not just a dashboard — it is a gentle decision-support tool for living with more awareness.

## What the product does

LVL_UP helps users:

- Log daily reflections and emotional state
- Track sleep, habits, hobbies, and spending
- View life-score style summaries and progress trends
- Ask an AI companion questions about their own data
- Receive supportive suggestions for weekly focus and improvement

## Core experience

The product is designed around a few simple principles:

- Keep logging lightweight and fast
- Make insights feel grounded in real data
- Encourage progress without guilt or pressure
- Present information in a calm, modern interface

## Architecture overview

The app is split into a modern frontend experience and a secure backend API, with AI capabilities layered on top of the user’s personal data.

```mermaid
flowchart LR
  User[User] --> UI[React + Vite Frontend]
  UI --> API[Express API]
  API --> DB[(PostgreSQL)]
  API --> AI[Groq-powered Aura Assistant]
  AI --> Data[User logs, habits, expenses, notes]
```

### Frontend

The client experience lives in [src](src) and is built with:

- React 19
- Vite 8
- React Router for page navigation
- Context-based state management for auth and app data
- Component-based UI with custom CSS for a polished dashboard feel

The UI is organized around domain pages such as:

- [src/pages/HubPage.jsx](src/pages/HubPage.jsx)
- [src/pages/MindPage.jsx](src/pages/MindPage.jsx)
- [src/pages/SleepPage.jsx](src/pages/SleepPage.jsx)
- [src/pages/HabitsPage.jsx](src/pages/HabitsPage.jsx)
- [src/pages/MoneyPage.jsx](src/pages/MoneyPage.jsx)
- [src/pages/HobbiesPage.jsx](src/pages/HobbiesPage.jsx)

### Backend

The server lives in [server](server) and provides:

- Express-based API routes
- JWT-backed authentication
- Protected endpoints for daily logs, habits, hobbies, tasks, expenses, and settings
- Health checks and request auditing
- AI chat integration

The main entry point is [server/index.js](server/index.js).

### Data layer

The database uses PostgreSQL with schema files in [server/db](server/db). The core data model includes:

- Users and authentication state
- Daily logs and mood entries
- Habits and habit completion history
- Hobbies and time tracking
- Expenses and spending data
- Settings and preference state
- AI-related insight storage and audit events

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router |
| Styling | Custom CSS, responsive component styling |
| State | React Context |
| Backend | Express.js |
| Auth | JWT + bcrypt |
| Database | PostgreSQL |
| Data client | Node.js pg |
| AI | Groq / OpenAI-compatible chat API |
| Tooling | ESLint, Vite build pipeline |

## Key features

### 1. Daily life logging
Users can record their mood, energy, sleep, habits, hobbies, and expenses in an experience that stays simple and fast.

### 2. Reflective insights
The dashboard turns repeated actions into visible patterns so the user can understand their own rhythms more clearly.

### 3. AI companion
Aura, the built-in AI assistant, helps answer questions using the user’s own tracked history rather than generic advice.

### 4. Multi-domain awareness
The app is designed to connect life areas instead of isolating them:

- Mind
- Sleep
- Habits
- Money
- Hobbies

### 5. Secure and extensible architecture
The backend is modular and structured so new features can be added without collapsing the system.

## Benefits of the website

LVL_UP is valuable because it helps users:

- Gain clarity about their routines and energy
- Reduce mental clutter by keeping everything in one place
- Build small habits with better awareness
- Notice patterns that are easy to miss in day-to-day life
- Make decisions from real personal data instead of guesswork
- Feel supported by a thoughtful AI companion that responds to their context

## Project structure

```text
src/
  components/        UI building blocks
  context/           auth and app state providers
  pages/             page-level experiences
  services/          frontend data access helpers
  hooks/             reusable log and storage hooks
  utils/             helpers for scoring, ai logic, and date handling

server/
  routes/            API endpoints
  middleware/        auth and audit middleware
  db/                SQL schema and seed files
  config/            database config
```

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL
- A Groq API key if you want the AI assistant to use live model responses

### 1. Install dependencies

```bash
npm install
cd server && npm install
```

### 2. Configure environment variables

Create a `.env` file in the server folder with values such as:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/life_dashboard
JWT_SECRET=your-secret-key
GROQ_API_KEY=your-groq-key
GROQ_MODEL=llama-3.1-8b-instant
```

### 3. Initialize the database

```bash
npm run db:init
```

### 4. Run the app

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in a second terminal:

```bash
npm run dev
```

The frontend should be available at `http://localhost:5173` and the backend at `http://localhost:5000` unless you override the port.

## Development notes

- The frontend build is validated with `npm run build`
- The server can be started with `npm run dev` or `npm start`
- The database schema and seed files are available in [server/db](server/db)
- The chat assistant has a local fallback so it remains useful even if the AI service is unavailable

## Why this project stands out

LVL_UP is not just another productivity app. It is a calm, reflective operating system for your personal life — one that helps you notice patterns, make better decisions, and build momentum in a way that feels sustainable.

## Future direction

The roadmap can grow naturally into:

- richer weekly and monthly summaries
- stronger habit coaching and behavior recommendations
- deeper personalization and goal-setting
- improved visualizations and trend intelligence
- mobile-first polish and deployment hardening

## Summary

LVL_UP is a thoughtful blend of self-tracking, personal analytics, and AI companionship. It is built to make everyday life feel more understandable, more intentional, and more manageable.
