import os
from typing import List

from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException
from jose import JWTError, jwt

from models.schemas import QuestionCreate, QuestionOut, QuestionOutAdmin
from services.question_service import (
    create_question,
    get_questions_for_admin,
    get_questions_for_student,
)

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


@router.post("/{exam_id}/questions", response_model=QuestionOutAdmin)
def add_question(
    exam_id: str,
    data: QuestionCreate,
    authorization: str = Header(...),
):
    """Admin only — add a question to an exam."""
    user = _get_user_from_token(authorization)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return create_question(exam_id, data)


@router.get("/{exam_id}/questions", response_model=List[QuestionOut])
def list_questions_student(
    exam_id: str,
    authorization: str = Header(...),
):
    """Student only — fetch questions for an exam (correct_option hidden)."""
    user = _get_user_from_token(authorization)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    return get_questions_for_student(exam_id)


@router.get("/{exam_id}/questions/admin", response_model=List[QuestionOutAdmin])
def list_questions_admin(
    exam_id: str,
    authorization: str = Header(...),
):
    """Admin only — fetch questions including correct answers."""
    user = _get_user_from_token(authorization)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return get_questions_for_admin(exam_id)
