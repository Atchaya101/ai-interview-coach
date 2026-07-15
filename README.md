# 🤖 AI Interview Coach

An AI-powered mock interview platform that helps students and job seekers prepare for technical and HR interviews.

Upload a resume, receive personalized interview questions, answer through text or voice, and get AI-powered evaluation with detailed feedback and performance analytics.

## ✨ Features

- 📄 Resume Upload (PDF/DOCX)
- 🤖 AI-Generated Interview Questions
- 🎙 Voice & Text Interview Modes
- 📊 AI Answer Evaluation
- 📈 Performance Dashboard
- 📑 Final Interview Report
- 📚 Interview History
- ⚡ Fast REST API Backend

## Tech Stack
- Frontend: React + Vite, Tailwind CSS, React Router, Framer Motion, Chart.js, Axios
- Backend: Node.js, Express
- AI: Groq API (Llama 3.1)
- Voice: browser-native Web Speech API

## Project Structure
```
ai-interview-coach/
  backend/
    data/store.js        In-memory store: { resumes, interviews, questions, answers, feedbacks }
    middleware/           upload (multer), error handling  — no auth middleware
    controllers/           resume, interview, dashboard      — no auth controller
    routes/                resumeRoutes, interviewRoutes, dashboardRoutes
    services/               aiService.js (Groq AI prompts), resumeParser.js (pdf/docx text extraction)
    server.js
  frontend/
    src/
      hooks/useSpeechRecognition.js
      services/api.js (plain axios instance, no token handling)
      components/       Navbar, Card, ScoreChart
      pages/             Dashboard, ResumeUpload, InterviewSetup, InterviewSession, Report, History
      App.jsx, main.jsx, index.css
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set GROQ_API_KEY
npm run dev
```
Backend runs on `http://localhost:5000`. 

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# edit .env if backend URL differs
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 3. OpenAI API Key
Get a free API key from https://console.groq.com/keys and set `GROQ_API_KEY` in `backend/.env`.

## REST API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/resumes | Upload resume (multipart, field `resume`) |
| GET | /api/resumes | List all resumes in memory |
| GET | /api/resumes/:id | Get one resume |
| POST | /api/interviews | Create interview + generate AI questions |
| GET | /api/interviews | List all interviews (history) |
| GET | /api/interviews/:id | Get interview + questions + answers |
| POST | /api/interviews/:id/answers | Submit an answer, get AI evaluation |
| POST | /api/interviews/:id/finish | Aggregate scores, generate final report |
| DELETE | /api/interviews/:id | Delete an interview |
| GET | /api/dashboard | Aggregate dashboard stats |

No `Authorization` header, no `/api/auth/*` routes — all endpoints are open.
This is intentional for a single-user local/demo project. **Do not deploy this
publicly without adding auth back** — anyone with the URL can read/delete all data.

## Data Model (in-memory, `backend/data/store.js`)

- **resumes**: `_id, fileName, filePath, fileType, rawText, parsed{skills,education,experience,projects}, createdAt`
- **interviews**: `_id, resumeId, company, role, interviewType, difficulty, status, overallScore, technicalScore, communicationScore, behavioralScore, confidenceScore, readinessPercentage, suggestedTopics, createdAt, completedAt`
- **questions**: `_id, interviewId, text, category, difficulty, order`
- **answers**: `_id, interviewId, questionId, transcript, mode, timeTakenSeconds, skipped, createdAt`
- **feedbacks**: `_id, interviewId, answerId, scoreOutOf100 + 8 sub-scores, strengths, weaknesses, missedPoints, idealAnswer, tips`

## Deployment
- **Frontend (Vercel)**: root directory `frontend`, env var `VITE_API_URL` → your backend `/api` URL.
- **Backend (Render)**: root directory `backend`, build `npm install`, start `npm start`, env vars `GROQ_API_KEY`, `MODEL`, `CLIENT_URL`.

⚠️ Note: most free hosting tiers (like Render's free plan) restart/sleep the
process periodically — since storage is in-memory, all data will be wiped on
every restart. That's expected and fine for a portfolio demo; call it out in
your README/demo video so it doesn't look like a bug.

## What changed from the database version
- Removed: MongoDB, Mongoose, all Mongoose models, `connectDB()`, JWT, bcrypt,
  register/login/forgot-password, auth middleware, `protect`/`adminOnly`, `req.user`.
- Added: `backend/data/store.js` — plain in-memory arrays + `crypto.randomUUID()` for IDs.
- Frontend: removed `AuthContext`, `ProtectedRoute`, `Login`/`Register`/`ForgotPassword`
  pages, and the token-handling logic in `api.js`/`Navbar.jsx`. All routes are now open;
  the app goes straight to the dashboard.

## What to build next (bonus, on request)
Admin panel · Leaderboard · Live coding editor · STAR behavioral coaching ·
Filler-word/pace analysis · Resume ATS scoring · Job description matching ·
Cover letter generator · PDF report export · Optional lightweight auth if you
ever want to deploy this publicly with per-user data.
