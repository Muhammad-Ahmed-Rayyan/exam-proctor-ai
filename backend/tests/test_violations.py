"""
Tests for /violations/ endpoints.

Tests run against the live Supabase instance.
Each test registers fresh users and creates a real exam to avoid stale data.
"""
import uuid

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


# ── Helpers ────────────────────────────────────────────────────────────────

def unique_email() -> str:
    return f"test_{uuid.uuid4().hex[:12]}@testdomain.dev"


def register_and_login(role: str = "student") -> dict:
    """
    Register a fresh user with the given role and return a dict with:
        { "token": str, "user_id": str }
    """
    email    = unique_email()
    password = "ViolPass123!"

    reg = client.post(
        "/auth/register",
        json={"name": "Violation Tester", "email": email, "password": password, "role": role},
    )
    assert reg.status_code == 200, f"Registration failed: {reg.text}"

    login = client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200, f"Login failed: {login.text}"

    data = login.json()
    return {"token": data["access_token"], "user_id": data["user_id"]}


def create_exam_as_admin() -> str:
    """Register an admin, create an exam, and return the exam id."""
    admin = register_and_login(role="admin")
    headers = {"authorization": f"Bearer {admin['token']}"}

    response = client.post(
        "/exams/",
        json={"title": "Violation Test Exam", "duration_minutes": 30},
        headers=headers,
    )
    assert response.status_code == 200, f"Exam creation failed: {response.text}"
    return response.json()["id"]


# ── Tests ──────────────────────────────────────────────────────────────────

def test_log_violation_as_student():
    """A student should be able to POST a violation and get back the logged record."""
    student  = register_and_login(role="student")
    exam_id  = create_exam_as_admin()
    headers  = {"authorization": f"Bearer {student['token']}"}

    response = client.post(
        "/violations/",
        json={
            "student_id": student["user_id"],
            "exam_id":    exam_id,
            "type":       "face_missing",
        },
        headers=headers,
    )
    assert response.status_code == 200, response.text

    data = response.json()
    assert "type"       in data, f"Missing 'type' in response: {data}"
    assert "student_id" in data, f"Missing 'student_id' in response: {data}"
    assert "exam_id"    in data, f"Missing 'exam_id' in response: {data}"
    assert data["type"]       == "face_missing"
    assert data["student_id"] == student["user_id"]
    assert data["exam_id"]    == exam_id


def test_log_violation_as_admin_forbidden():
    """An admin token must not be accepted on POST /violations/ (403)."""
    admin   = register_and_login(role="admin")
    exam_id = create_exam_as_admin()
    headers = {"authorization": f"Bearer {admin['token']}"}

    response = client.post(
        "/violations/",
        json={
            "student_id": admin["user_id"],
            "exam_id":    exam_id,
            "type":       "tab_switch",
        },
        headers=headers,
    )
    assert response.status_code == 403, (
        f"Expected 403 for admin posting violation, got {response.status_code}: {response.text}"
    )
