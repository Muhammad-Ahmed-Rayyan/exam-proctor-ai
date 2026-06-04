# 🎓 Exam Proctor AI

Exam Proctor AI is an AI-powered online examination platform that monitors exams in real time, tracks violations, and generates professional integrity reports for invigilators.

## ✨ Features

- 👤 **Face Monitoring** — Real-time webcam-based face presence detection
- 🚨 **Violation Tracking** — Flags suspicious behavior like face absence or multiple faces
- 🖥️ **Focus Monitoring** — Detects tab switches and focus loss
- 🤖 **AI Reporting** — Groq-powered integrity summaries per student
- 📊 **Exam Management** — Admin exam creation and student dashboards

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (Supabase) |
| Authentication | JWT |
| AI Reporting | Groq (Llama 3) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase project
- Groq API key

### Environment Variables
Create a `.env` file in the `backend` folder (or copy from `.env.example`) with:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SECRET_KEY=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Backend runs at `http://localhost:8000` and the Vite frontend at `http://localhost:5173`.

## 🔌 API Routes

| Method | Route | Description | Access |
|---|---|---|---|
| POST | /auth/register | Register user | Public |
| POST | /auth/login | Login user | Public |
| GET | /exams/ | List exams | Student/Admin |
| POST | /exams/ | Create exam | Admin |
| PUT | /exams/{exam_id} | Update exam | Admin |
| DELETE | /exams/{exam_id} | Delete exam | Admin |
| POST | /violations/ | Log violation | Student |
| GET | /violations/{exam_id}/{student_id} | List violations | Student/Admin |
| GET | /report/{exam_id}/{student_id} | Generate report | Admin |

## 📁 Project Structure

exam-proctor-ai/
├── frontend/        # React (Vite) application
├── backend/         # FastAPI application
├── docs/            # Project documentation
├── diagrams/        # UML & ER diagrams
├── .env.example     # Environment variable template
└── README.md