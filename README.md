# 🎓 Exam Proctor AI

> AI-powered online examination platform with real-time proctoring, violation tracking, and automated integrity reporting.

Exam Proctor AI lets administrators create and manage exams while monitoring students in real time through webcam-based face detection, tab-switch tracking, and focus-loss detection. At the end of each session, a Groq-powered AI generates a professional integrity report per student.

---

## ✨ Features

| Feature | Description |
|---|---|
| 👤 Face Monitoring | Real-time webcam detection — flags face absence or multiple faces |
| 🚨 Violation Tracking | Logs every infraction with timestamp and type |
| 🖥️ Focus Monitoring | Detects tab switches and browser focus loss |
| 🤖 AI Integrity Reports | Groq (Llama 3) generates per-student narrative summaries |
| 📋 Exam Management | Admins create, edit, and delete exams with MCQ question banks |
| 🏫 Student Dashboard | Students view assigned exams and attempt them in a proctored room |
| 🔐 Role-Based Auth | JWT-secured routes with separate Admin and Student roles |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS + Inline Styles |
| Backend | FastAPI (Python 3.10+) |
| Database | PostgreSQL via Supabase |
| Authentication | JWT (Supabase Auth) |
| AI Reporting | Groq API — Llama 3 |
| Testing | Pytest + HTTPX |

---

## 📁 Project Structure

```
exam-proctor-ai/
│
├── backend/                        # FastAPI backend
│   ├── main.py                     # App entry point, router registration
│   ├── database.py                 # Supabase client setup
│   ├── .env                        # Environment variables (not committed)
│   ├── .env.example                # Example env file
│   ├── requirements.txt            # Production dependencies
│   ├── requirements-dev.txt        # Dev/test dependencies
│   │
│   ├── models/
│   │   └── schemas.py              # Pydantic request/response models
│   │
│   ├── routes/                     # API route handlers
│   │   ├── auth.py                 # POST /auth/register, /auth/login
│   │   ├── exams.py                # CRUD for exams
│   │   ├── questions.py            # CRUD for exam questions
│   │   ├── answers.py              # Student answer submission & grading
│   │   ├── violations.py           # Violation logging & retrieval
│   │   └── reports.py              # AI report generation endpoint
│   │
│   ├── services/                   # Business logic layer
│   │   ├── auth_service.py         # Registration, login, JWT handling
│   │   ├── exam_service.py         # Exam CRUD operations
│   │   ├── question_service.py     # Question CRUD operations
│   │   ├── answer_service.py       # Answer submission & auto-grading
│   │   ├── violation_service.py    # Violation persistence & queries
│   │   └── report_service.py       # Groq AI summary generation
│   │
│   └── tests/                      # Pytest integration tests
│       ├── __init__.py
│       ├── test_auth.py
│       ├── test_exams.py
│       └── test_violations.py
│
└── frontend/                       # React (Vite) frontend
    ├── index.html                  # App shell with meta/favicon
    ├── vite.config.js
    ├── package.json
    │
    ├── public/
    │   ├── favicon.svg             # Blue shield + checkmark favicon
    │   └── icons.svg
    │
    └── src/
        ├── main.jsx                # React entry point
        ├── App.jsx                 # Route definitions (React Router)
        ├── index.css               # Global base styles
        │
        ├── components/
        │   └── Logo.jsx            # Shared SVG shield logo + wordmark
        │
        ├── context/
        │   └── AuthContext.jsx     # JWT auth state (token, role, user_id, name)
        │
        ├── utils/
        │   └── api.js              # Axios base URL configuration
        │
        └── pages/
            ├── Landing.jsx         # Public landing / marketing page
            ├── Login.jsx           # JWT login form
            ├── Register.jsx        # New user registration
            ├── StudentDashboard.jsx # Student exam list & status
            ├── AdminDashboard.jsx  # Admin exam management panel
            ├── CreateExam.jsx      # Exam + question bank builder
            ├── ExamRoom.jsx        # Live proctored exam environment
            └── AdminReport.jsx     # Per-student AI integrity report viewer
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A [Supabase](https://supabase.com) project with PostgreSQL
- A [Groq](https://console.groq.com) API key

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/exam-proctor-ai.git
cd exam-proctor-ai
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env
```

Edit `.env` with your credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
SECRET_KEY=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

Start the backend server:

```bash
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**  
Interactive API docs at **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## 🔌 API Reference

### Authentication

| Method | Route | Description | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | Public |
| `POST` | `/auth/login` | Login and receive JWT | Public |

### Exams

| Method | Route | Description | Access |
|---|---|---|---|
| `GET` | `/exams/` | List all exams | Student / Admin |
| `POST` | `/exams/` | Create a new exam | Admin |
| `PATCH` | `/exams/{exam_id}` | Update exam details | Admin |
| `DELETE` | `/exams/{exam_id}` | Delete an exam | Admin |

### Questions

| Method | Route | Description | Access |
|---|---|---|---|
| `GET` | `/questions/{exam_id}` | Get questions for an exam | Student / Admin |
| `POST` | `/questions/` | Add a question to an exam | Admin |
| `DELETE` | `/questions/{question_id}` | Delete a question | Admin |

### Answers

| Method | Route | Description | Access |
|---|---|---|---|
| `POST` | `/answers/` | Submit student answers | Student |
| `GET` | `/answers/{exam_id}/{student_id}` | Retrieve submitted answers | Admin |

### Violations

| Method | Route | Description | Access |
|---|---|---|---|
| `POST` | `/violations/` | Log a proctoring violation | Student |
| `GET` | `/violations/{exam_id}/{student_id}` | List violations for a student | Student / Admin |

### Reports

| Method | Route | Description | Access |
|---|---|---|---|
| `GET` | `/report/{exam_id}/{student_id}` | Generate AI integrity report | Admin |

---

## 🧪 Running Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest tests/ -v
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
