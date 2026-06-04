import os
from typing import List

from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException
from jose import JWTError, jwt

from models.schemas import ExamCreate, ExamOut, ExamUpdate
from services.exam_service import create_exam, delete_exam, get_all_exams, update_exam

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


@router.get("/", response_model=List[ExamOut])
def list_exams():
    return get_all_exams()


@router.post("/", response_model=ExamOut)
def create_exam_route(data: ExamCreate, authorization: str = Header(...)):
    user = _get_user_from_token(authorization)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return create_exam(data, user["user_id"])


@router.put("/{exam_id}", response_model=ExamOut)
def update_exam_route(exam_id: str, data: ExamUpdate, authorization: str = Header(...)):
    user = _get_user_from_token(authorization)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return update_exam(exam_id, data)


@router.delete("/{exam_id}")
def delete_exam_route(exam_id: str, authorization: str = Header(...)):
    user = _get_user_from_token(authorization)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return delete_exam(exam_id)