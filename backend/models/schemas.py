from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["student", "admin"]


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: Literal["student", "admin"]
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Literal["student", "admin"]


class ExamCreate(BaseModel):
    title: str
    duration_minutes: int
    start_time: Optional[datetime] = None


class ExamOut(BaseModel):
    id: str
    title: str
    duration_minutes: int
    created_by: str
    start_time: Optional[datetime] = None
    status: str
    created_at: datetime


class ExamUpdate(BaseModel):
    title: Optional[str] = None
    duration_minutes: Optional[int] = None
    start_time: Optional[datetime] = None
    status: Optional[str] = None


class ViolationCreate(BaseModel):
    student_id: str
    exam_id: str
    type: str


class ViolationOut(BaseModel):
    id: str
    student_id: str
    exam_id: str
    type: str
    timestamp: datetime


class ReportOut(BaseModel):
    id: str
    exam_id: str
    student_id: str
    ai_summary: str
    total_violations: int
    risk_level: str
    generated_at: datetime


# ── Questions ──────────────────────────────────────────────────────────────

class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: Literal["A", "B", "C", "D"]


class QuestionOut(BaseModel):
    """Returned to students — correct_option intentionally omitted."""
    id: str
    exam_id: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str


class QuestionOutAdmin(BaseModel):
    """Returned to admins — includes correct_option."""
    id: str
    exam_id: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: Literal["A", "B", "C", "D"]


# ── Answers ────────────────────────────────────────────────────────────────

class AnswerSubmit(BaseModel):
    exam_id: str
    question_id: str
    selected_option: Literal["A", "B", "C", "D"]


class AnswerOut(BaseModel):
    id: str
    student_id: str
    exam_id: str
    question_id: str
    selected_option: Literal["A", "B", "C", "D"]
    submitted_at: datetime


# ── Combined result ────────────────────────────────────────────────────────

class ExamResultOut(BaseModel):
    exam_id: str
    student_id: str
    total_questions: int
    correct_answers: int
    score_percent: float
    violations: list
    ai_summary: Optional[str] = None
    risk_level: Optional[str] = None