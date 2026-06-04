from fastapi import HTTPException

from database import supabase
from models.schemas import ExamCreate, ExamUpdate


def get_all_exams():
    result = supabase.table("exams").select("*").execute()
    return result.data or []


def get_exam_by_id(exam_id: str):
    result = supabase.table("exams").select("*").eq("id", exam_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Exam not found")
    return result.data[0]


def create_exam(data: ExamCreate, admin_id: str):
    payload = {
        "title": data.title,
        "duration_minutes": data.duration_minutes,
        "created_by": admin_id,
        "status": "upcoming",
    }
    if data.start_time is not None:
        payload["start_time"] = data.start_time.isoformat()

    result = supabase.table("exams").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create exam")
    return result.data[0]


def update_exam(exam_id: str, data: ExamUpdate):
    if hasattr(data, "model_dump"):
        update_data = data.model_dump(exclude_unset=True)
    else:
        update_data = data.dict(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    if "start_time" in update_data and update_data["start_time"] is not None:
        update_data["start_time"] = update_data["start_time"].isoformat()

    result = supabase.table("exams").update(update_data).eq("id", exam_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Exam not found")
    return result.data[0]


def delete_exam(exam_id: str):
    result = supabase.table("exams").delete().eq("id", exam_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam deleted successfully"}