<div align="center">
  <img src="https://github.com/Muhammad-Ahmed-Rayyan/GazeAware/blob/main/exam-proctor-ai.png" width="500">
  
  #
   
  <p><b>AI-Powered Online Examination Platform with Real-Time Proctoring & Integrity Reporting</b></p>

![Last Commit](https://img.shields.io/github/last-commit/Muhammad-Ahmed-Rayyan/Exam-Proctor-AI)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)
![languages](https://img.shields.io/github/languages/count/Muhammad-Ahmed-Rayyan/Exam-Proctor-AI)

<br>

Built with the tools and technologies:  
![React](https://img.shields.io/badge/React-%2361DAFB.svg?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)

</div>

---

## 🧠 Project Summary

**Exam Proctor AI** lets administrators create and manage exams while monitoring students in real time through webcam-based face detection, tab-switch tracking, and focus-loss detection. At the end of each session, a **Groq-powered AI** (Llama 3) generates a professional integrity report per student.

**🔗[Use it Here](https://examproctor-ai.vercel.app)**

---

## 🚀 Features

- 👤 **Face Monitoring**  
  Real-time webcam detection that flags face absence or multiple faces.

- 🚨 **Violation Tracking**  
  Logs every infraction with timestamp and type.

- 🖥️ **Focus Monitoring**  
  Detects tab switches and browser focus loss.

- 🤖 **AI Integrity Reports**  
  Groq (Llama 3) generates per-student narrative summaries.

- 📋 **Exam Management**  
  Admins create, edit, and delete exams with MCQ question banks.

- 🏫 **Student Dashboard**  
  Students view assigned exams and attempt them in a proctored room.

- 🔐 **Role-Based Auth**  
  JWT-secured routes with separate Admin and Student roles.

---

## 🗃️ Project Structure

```bash
exam-proctor-ai/
│
├── backend/                        # FastAPI backend
│   ├── main.py                     # App entry point, router registration
│   ├── database.py                 # Supabase client setup
│   ├── .env.example                # Example env file
│   ├── requirements.txt            # Production dependencies
│   ├── requirements-dev.txt        # Dev/test dependencies
│   ├── models/
│   │   └── schemas.py              # Pydantic request/response models
│   ├── routes/                     # API route handlers
│   │   ├── auth.py                 # POST /auth/register, /auth/login
│   │   ├── exams.py                # CRUD for exams
│   │   ├── questions.py            # CRUD for exam questions
│   │   ├── answers.py              # Student answer submission & grading
│   │   ├── violations.py           # Violation logging & retrieval
│   │   └── reports.py              # AI report generation endpoint
│   ├── services/                   # Business logic layer
│   │   ├── auth_service.py         # Registration, login, JWT handling
│   │   ├── exam_service.py         # Exam CRUD operations
│   │   ├── question_service.py     # Question CRUD operations
│   │   ├── answer_service.py       # Answer submission & auto-grading
│   │   ├── violation_service.py    # Violation persistence & queries
│   │   └── report_service.py       # Groq AI summary generation
│   └── tests/                      # Pytest integration tests
│       ├── test_auth.py
│       ├── test_exams.py
│       └── test_violations.py
└── frontend/                       # React (Vite) frontend
│   ├── index.html                  # App shell with meta/favicon
│   ├── vite.config.js
│   ├── package.json
│   ├── public/
│   │   ├── favicon.svg             # Blue shield + checkmark favicon
│   │   └── icons.svg
│   └── src/
│       ├── main.jsx                # React entry point
│       ├── App.jsx                 # Route definitions (React Router)
│       ├── index.css                # Global base styles
│       ├── components/
│       │   └── Logo.jsx             # Shared SVG shield logo + wordmark
│       ├── context/
│       │   └── AuthContext.jsx      # JWT auth state (token, role, user_id, name)
│       ├── utils/
│       │   └── api.js                # Axios base URL configuration
│       └── pages/
│           ├── Landing.jsx           # Public landing / marketing page
│           ├── Login.jsx             # JWT login form
│           ├── Register.jsx          # New user registration
│           ├── StudentDashboard.jsx  # Student exam list & status
│           ├── AdminDashboard.jsx    # Admin exam management panel
│           ├── CreateExam.jsx        # Exam + question bank builder
│           ├── ExamRoom.jsx          # Live proctored exam environment
│           └── AdminReport.jsx       # Per-student AI integrity report viewer
├── .gitignore                    # Excludes venv, database, secrets, build artifacts
├── LICENSE                       # MIT License
└── README.md  
```

---

## 🔧 Setup & Installation

> Make sure **Node.js 18+** and **Python 3.10+** are installed, along with a [Supabase](https://supabase.com) project and a [Groq](https://console.groq.com) API key.

```bash
# Clone the repo
git clone https://github.com/Muhammad-Ahmed-Rayyan/Exam-Proctor-AI.git
cd Exam-Proctor-AI
```

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy the example env file
cp .env.example .env

# Run the backend server
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`, with interactive API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🔑 API Configuration

Update the `.env` file inside `backend/` with your Supabase and Groq credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
SECRET_KEY=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

- **Supabase:** Go to your [Supabase project](https://supabase.com) → Project Settings → API to find your URL and service role key.
- **Groq API:** Visit [Groq Console](https://console.groq.com) to generate your API key.

---

## 🧪 Testing

```bash
cd backend
pip install -r requirements-dev.txt
pytest tests/ -v
```

---

<div align="center">

⭐ Found this project useful? Drop a star on GitHub!

</div>