import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import HTTPException
from groq import Groq

from database import supabase

load_dotenv()

VIOLATION_TYPES = ["face_missing", "multiple_faces", "tab_switch", "focus_loss"]


def _determine_risk_level(total_violations: int) -> str:
    if total_violations <= 3:
        return "Low"
    if total_violations <= 8:
        return "Medium"
    return "High"


def generate_report(exam_id: str, student_id: str):
    violations_result = (
        supabase.table("violations")
        .select("type")
        .eq("exam_id", exam_id)
        .eq("student_id", student_id)
        .execute()
    )
    violations = violations_result.data or []
    counts = {violation_type: 0 for violation_type in VIOLATION_TYPES}
    for violation in violations:
        violation_type = violation.get("type")
        if violation_type in counts:
            counts[violation_type] += 1

    total_violations = sum(counts.values())
    risk_level = _determine_risk_level(total_violations)

    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    # Build a readable breakdown string from the computed counts
    breakdown_parts = [
        f"{vtype.replace('_', ' ')}: {cnt}"
        for vtype, cnt in counts.items()
        if cnt > 0
    ]
    breakdown_str = ", ".join(breakdown_parts) if breakdown_parts else "none"

    student_name = student_id
    try:
        student_res = supabase.table("users").select("name").eq("id", student_id).execute()
        if student_res.data:
            student_name = student_res.data[0].get("name", student_id)
    except Exception:
        pass

    exam_title = exam_id
    try:
        exam_res = supabase.table("exams").select("title").eq("id", exam_id).execute()
        if exam_res.data:
            exam_title = exam_res.data[0].get("title", exam_id)
    except Exception:
        pass

    prompt = (
        f"You are an exam proctor writing an integrity summary for a specific student.\n"
        f"Student: {student_name}\n"
        f"Exam: {exam_title}\n"
        f"Total integrity violations recorded: {total_violations}\n"
        f"Violation breakdown: {breakdown_str}\n"
        f"Overall risk level: {risk_level}\n\n"
        "Write a concise 2-3 sentence plain-English integrity summary based strictly on "
        "the data above. Use the actual numbers provided. "
        "Do NOT use placeholders like [Insert ID], [Insert Date], or [Insert Student ID]. "
        "Do NOT write an email, letter, or report with a subject line or date header. "
        "Just write a short factual paragraph as a proctor would note it."
    )

    client = Groq(api_key=groq_api_key)
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
    )
    ai_summary = completion.choices[0].message.content.strip()

    report_payload = {
        "exam_id": exam_id,
        "student_id": student_id,
        "ai_summary": ai_summary,
        "total_violations": total_violations,
        "risk_level": risk_level,
        "generated_at": datetime.utcnow().isoformat(),
    }
    report_result = supabase.table("reports").insert(report_payload).execute()
    if not report_result.data:
        raise HTTPException(status_code=500, detail="Failed to generate report")
    return report_result.data[0]