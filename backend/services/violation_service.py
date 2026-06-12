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


def get_students_by_exam(exam_id: str):
    # 1. Fetch all violations for this exam
    violations_result = (
        supabase.table("violations")
        .select("student_id")
        .eq("exam_id", exam_id)
        .execute()
    )
    violations = violations_result.data or []

    # 2. Extract distinct student_ids
    seen = set()
    distinct_student_ids = []
    for row in violations:
        sid = row["student_id"]
        if sid not in seen:
            seen.add(sid)
            distinct_student_ids.append(sid)

    if not distinct_student_ids:
        return []

    # 3 & 4. For each student, fetch user details and count violations
    students = []
    for student_id in distinct_student_ids:
        user_result = (
            supabase.table("users")
            .select("id, name, email")
            .eq("id", student_id)
            .single()
            .execute()
        )
        user = user_result.data
        if not user:
            continue

        count_result = (
            supabase.table("violations")
            .select("id", count="exact")
            .eq("exam_id", exam_id)
            .eq("student_id", student_id)
            .execute()
        )
        violation_count = count_result.count if count_result.count is not None else 0

        students.append(
            {
                "student_id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "violation_count": violation_count,
            }
        )

    return students