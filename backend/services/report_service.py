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

    prompt = (
        "You are an exam integrity officer. A student completed an online exam.\n"
        f"Violations detected: face_missing: {counts['face_missing']} times, "
        f"multiple_faces: {counts['multiple_faces']} times, "
        f"tab_switch: {counts['tab_switch']} times, "
        f"focus_loss: {counts['focus_loss']} times.\n"
        f"Total violations: {total_violations}. Risk level: {risk_level}.\n"
        "Write a concise professional integrity report in 5-6 sentences."
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