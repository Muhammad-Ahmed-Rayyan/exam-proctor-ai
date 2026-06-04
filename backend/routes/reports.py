import os

from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException
from jose import JWTError, jwt

from models.schemas import ReportOut
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


@router.get("/{exam_id}/{student_id}", response_model=ReportOut)
def generate_report_route(
    exam_id: str, student_id: str, authorization: str = Header(...)
):
    user = _get_user_from_token(authorization)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return generate_report(exam_id, student_id)