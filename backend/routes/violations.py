import os
from typing import List

from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException
from jose import JWTError, jwt

from models.schemas import ViolationCreate, ViolationOut
from services.violation_service import (
    get_students_by_exam,
    get_violations_by_exam_and_student,
    log_violation,
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


@router.post("/", response_model=ViolationOut)
def log_violation_route(data: ViolationCreate, authorization: str = Header(...)):
    user = _get_user_from_token(authorization)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    return log_violation(data)


@router.get("/{exam_id}/{student_id}", response_model=List[ViolationOut])
def list_violations(exam_id: str, student_id: str):
    return get_violations_by_exam_and_student(exam_id, student_id)


@router.get("/exam/{exam_id}/students")
def list_students_by_exam(exam_id: str, authorization: str = Header(...)):
    user = _get_user_from_token(authorization)
    if user["role"] not in ("proctor", "admin"):
        raise HTTPException(status_code=403, detail="Proctor or admin access required")
    return get_students_by_exam(exam_id)