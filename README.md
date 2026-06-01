# 🎓 Exam Proctor AI

An AI-powered online examination proctoring system that monitors students in real-time using face detection, screen monitoring, and intelligent cheating detection — generating automated reports for invigilators.

## ✨ Features

- 👤 **Face Monitoring** — Real-time webcam-based face presence detection using MediaPipe
- 🚨 **Cheating Detection** — Flags suspicious behavior like face absence or multiple faces
- 🖥️ **Screen Monitoring** — Detects tab switches and focus loss during exams
- 🤖 **AI Alerts** — Groq-powered natural language alert generation per student
- 📊 **Exam Reports** — Detailed per-student violation timelines with AI-generated summaries

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth / JWT |
| Face Detection | MediaPipe (in-browser) |
| AI Alerts | Groq API (Llama 3) |
| Deployment | Vercel + Render |

## 🚀 Getting Started

### Prerequisites
- Node.js
- Python 3.10+
- Supabase account (free)
- Groq API key (free)

### Installation

```bash
# Clone the repo
git clone https://github.com/Muhammad-Ahmed-Rayyan/exam-proctor-ai.git
cd exam-proctor-ai

# Backend setup
cd backend
pip install -r requirements.txt
cp ../.env.example .env  # Fill in your keys
uvicorn main:app --reload

# Frontend setup
cd ../frontend
npm install
npm start
```

## 📁 Project Structure
exam-proctor-ai/
├── frontend/        # React.js application
├── backend/         # FastAPI application
├── docs/            # Project documentation
├── diagrams/        # UML & ER diagrams
├── .env.example     # Environment variable template
└── README.md