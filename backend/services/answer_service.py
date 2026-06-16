from fastapi import HTTPException

from database import supabase
from models.schemas import AnswerSubmit


def submit_answer(student_id: str, data: AnswerSubmit):
    """
    Upsert an answer row. If the student has already answered this question in
    this exam the existing row is updated (on_conflict targets the UNIQUE
    constraint on student_id + exam_id + question_id).
    """
    payload = {
        "student_id":      student_id,
        "exam_id":         data.exam_id,
        "question_id":     data.question_id,
        "selected_option": data.selected_option,
    }
    result = (
        supabase.table("answers")
        .upsert(payload, on_conflict="student_id,exam_id,question_id")
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to submit answer")
    return result.data[0]


def get_student_answers(exam_id: str, student_id: str):
    """Fetch all answers submitted by a student for a given exam."""
    result = (
        supabase.table("answers")
        .select("*")
        .eq("exam_id", exam_id)
        .eq("student_id", student_id)
        .execute()
    )
    return result.data or []


def compute_score(exam_id: str, student_id: str) -> dict:
    """
    Join answers with questions to count how many selected_options match
    correct_option, then compute score_percent.
    Returns: { total_questions, correct_answers, score_percent }
    """
    # Fetch student answers for this exam
    answers_result = (
        supabase.table("answers")
        .select("question_id, selected_option")
        .eq("exam_id", exam_id)
        .eq("student_id", student_id)
        .execute()
    )
    answers = answers_result.data or []

    if not answers:
        # Count total questions even if student answered none
        questions_result = (
            supabase.table("questions")
            .select("id", count="exact")
            .eq("exam_id", exam_id)
            .execute()
        )
        total = questions_result.count or 0
        return {"total_questions": total, "correct_answers": 0, "score_percent": 0.0}

    # Build a lookup from question_id → selected_option
    answer_map = {a["question_id"]: a["selected_option"] for a in answers}

    # Fetch the correct options for those questions
    question_ids = list(answer_map.keys())
    questions_result = (
        supabase.table("questions")
        .select("id, correct_option")
        .in_("id", question_ids)
        .execute()
    )
    questions = questions_result.data or []

    # Count total questions in the exam (not just answered ones)
    total_result = (
        supabase.table("questions")
        .select("id", count="exact")
        .eq("exam_id", exam_id)
        .execute()
    )
    total_questions = total_result.count or len(questions)

    correct_answers = sum(
        1 for q in questions
        if answer_map.get(q["id"]) == q["correct_option"]
    )

    score_percent = round(
        (correct_answers / total_questions * 100) if total_questions > 0 else 0.0, 2
    )

    return {
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "score_percent":   score_percent,
    }
