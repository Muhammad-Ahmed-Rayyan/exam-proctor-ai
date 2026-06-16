from fastapi import HTTPException

from database import supabase
from models.schemas import QuestionCreate


def create_question(exam_id: str, data: QuestionCreate):
    """Insert a new question into the questions table for the given exam."""
    payload = {
        "exam_id":         exam_id,
        "question_text":   data.question_text,
        "option_a":        data.option_a,
        "option_b":        data.option_b,
        "option_c":        data.option_c,
        "option_d":        data.option_d,
        "correct_option":  data.correct_option,
    }
    result = supabase.table("questions").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create question")
    return result.data[0]


def get_questions_for_student(exam_id: str):
    """
    Fetch all questions for an exam without exposing the correct answer.
    Explicitly select only the columns that belong to QuestionOut.
    """
    result = (
        supabase.table("questions")
        .select("id, exam_id, question_text, option_a, option_b, option_c, option_d")
        .eq("exam_id", exam_id)
        .execute()
    )
    return result.data or []


def get_questions_for_admin(exam_id: str):
    """
    Fetch all questions for an exam including the correct_option column.
    Intended for admin review only.
    """
    result = (
        supabase.table("questions")
        .select("id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_option")
        .eq("exam_id", exam_id)
        .execute()
    )
    return result.data or []
