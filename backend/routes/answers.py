import os

from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException
from jose import JWTError, jwt

from models.schemas import AnswerOut, AnswerSubmit, ExamResultOut
from services.answer_service import compute_score, get_student_answers, submit_answer
from services.violation_service import get_violations_by_exam_and_student
from services.report_service import generate_report

load_dotenv()

router = APIRouter()
ALGORITHM = "HS256"


def _get_user_from_token(authorization: str) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        raise HTTPException(status_code=500, detail="Server configuration error")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    role = payload.get("role")
    if not user_id or not role:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"user_id": user_id, "role": role}


@router.post("/", response_model=AnswerOut)
def submit_answer_route(
    data: AnswerSubmit,
    authorization: str = Header(...),
):
    """Student only — submit or update an answer for a question."""
    user = _get_user_from_token(authorization)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    return submit_answer(user["user_id"], data)


@router.get("/exams/{exam_id}/results/{student_id}", response_model=ExamResultOut)
def get_exam_results(
    exam_id: str,
    student_id: str,
    authorization: str = Header(...),
):
    """
    Admin only — combine score, violations, and AI report into one response.
    Reuses existing service functions; no logic is duplicated.
    """
    user = _get_user_from_token(authorization)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # a) Score from answer_service
    score = compute_score(exam_id, student_id)

    # b) Violations from violation_service (existing function, not duplicated)
    violations = get_violations_by_exam_and_student(exam_id, student_id)

    # c) AI report from report_service (existing function, not duplicated)
    #    generate_report also persists the report to Supabase if not already present.
    try:
        report = generate_report(exam_id, student_id)
        ai_summary = report.get("ai_summary")
        risk_level = report.get("risk_level")
    except HTTPException:
        # If the report cannot be generated (e.g. GROQ key missing), degrade gracefully
        ai_summary = None
        risk_level = None

    return {
        "exam_id":         exam_id,
        "student_id":      student_id,
        "total_questions": score["total_questions"],
        "correct_answers": score["correct_answers"],
        "score_percent":   score["score_percent"],
        "violations":      violations,
        "ai_summary":      ai_summary,
        "risk_level":      risk_level,
    }
