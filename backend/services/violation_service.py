from fastapi import HTTPException

from database import supabase
from models.schemas import ViolationCreate


def log_violation(data: ViolationCreate):
    payload = {
        "student_id": data.student_id,
        "exam_id": data.exam_id,
        "type": data.type,
    }
    result = supabase.table("violations").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to log violation")
    return result.data[0]


def get_violations_by_exam_and_student(exam_id: str, student_id: str):
    result = (
        supabase.table("violations")
        .select("*")
        .eq("exam_id", exam_id)
        .eq("student_id", student_id)
        .execute()
    )
    return result.data or []