"""
Tests for /exams/ endpoints.

Tests run against the live Supabase instance.
Admin tokens are obtained by registering + logging in a fresh admin user.
"""
import uuid

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


# ── Helpers ────────────────────────────────────────────────────────────────

def unique_email() -> str:
    return f"test_{uuid.uuid4().hex[:12]}@testdomain.dev"


def register_and_login(role: str = "student") -> str:
    """Register a fresh user with the given role and return their Bearer token."""
    email    = unique_email()
    password = "ExamPass123!"

    reg = client.post(
        "/auth/register",
        json={"name": "Test User", "email": email, "password": password, "role": role},
    )
    assert reg.status_code == 200, f"Registration failed: {reg.text}"

    login = client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200, f"Login failed: {login.text}"

    return login.json()["access_token"]


def admin_auth_header() -> dict:
    token = register_and_login(role="admin")
    return {"authorization": f"Bearer {token}"}


def student_auth_header() -> dict:
    token = register_and_login(role="student")
    return {"authorization": f"Bearer {token}"}


# ── Tests ──────────────────────────────────────────────────────────────────

def test_create_exam_as_admin():
    """An admin user should be able to create an exam (200) with expected fields."""
    headers = admin_auth_header()

    response = client.post(
        "/exams/",
        json={"title": "Integration Test Exam", "duration_minutes": 60},
        headers=headers,
    )
    assert response.status_code == 200, response.text

    data = response.json()
    assert "id"     in data
    assert "title"  in data
    assert data.get("status") == "upcoming", (
        f"Expected status 'upcoming', got '{data.get('status')}'"
    )


def test_create_exam_as_student_forbidden():
    """A student token must not be allowed to create an exam (403)."""
    headers = student_auth_header()

    response = client.post(
        "/exams/",
        json={"title": "Should Be Blocked", "duration_minutes": 30},
        headers=headers,
    )
    assert response.status_code == 403, (
        f"Expected 403 for student creating exam, got {response.status_code}: {response.text}"
    )


def test_list_exams():
    """GET /exams/ should return 200 and a list (no auth required)."""
    response = client.get("/exams/")
    assert response.status_code == 200, response.text
    assert isinstance(response.json(), list), (
        f"Expected a list, got: {type(response.json())}"
    )


def test_update_and_delete_exam_as_admin():
    """An admin should be able to update and delete an exam."""
    headers = admin_auth_header()

    # 1. Create an exam
    create_res = client.post(
        "/exams/",
        json={"title": "Exam to Update", "duration_minutes": 45},
        headers=headers,
    )
    assert create_res.status_code == 200, create_res.text
    exam_id = create_res.json()["id"]

    # 2. Patch/Update the exam
    patch_res = client.patch(
        f"/exams/{exam_id}",
        json={"title": "Updated Title", "status": "active"},
        headers=headers,
    )
    assert patch_res.status_code == 200, patch_res.text
    updated_data = patch_res.json()
    assert updated_data["title"] == "Updated Title"
    assert updated_data["status"] == "active"
    assert updated_data["duration_minutes"] == 45

    # 3. Delete the exam
    delete_res = client.delete(
        f"/exams/{exam_id}",
        headers=headers,
    )
    assert delete_res.status_code == 200, delete_res.text
    assert delete_res.json() == {"message": "Exam deleted successfully"}

    # 4. Try deleting nonexistent exam (404)
    get_404_res = client.delete(
        f"/exams/{exam_id}",
        headers=headers,
    )
    assert get_404_res.status_code == 404
