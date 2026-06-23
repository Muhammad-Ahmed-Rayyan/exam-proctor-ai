"""
Tests for /auth/register and /auth/login endpoints.

These tests run against the live Supabase instance.
Each test generates a unique email via uuid4 to avoid collision errors.
"""
import uuid

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


# ── Helpers ────────────────────────────────────────────────────────────────

def unique_email() -> str:
    """Return a guaranteed-unique email address for this test run."""
    return f"test_{uuid.uuid4().hex[:12]}@testdomain.dev"


def register_user(email: str, password: str = "TestPass123!", role: str = "student") -> dict:
    """Register a user and return the parsed JSON response."""
    return client.post(
        "/auth/register",
        json={"name": "Test User", "email": email, "password": password, "role": role},
    )


# ── Tests ──────────────────────────────────────────────────────────────────

def test_register_new_user_success():
    """Registering a brand-new unique email should return 200 with user fields."""
    email = unique_email()
    response = register_user(email)

    assert response.status_code == 200, response.text

    data = response.json()
    assert "id"    in data
    assert "name"  in data
    assert "email" in data
    assert "role"  in data


def test_register_duplicate_email_fails():
    """Registering the same email twice should return 400 on the second attempt."""
    email = unique_email()

    first = register_user(email)
    assert first.status_code == 200, f"First registration failed unexpectedly: {first.text}"

    second = register_user(email)
    assert second.status_code == 400, (
        f"Expected 400 for duplicate email, got {second.status_code}: {second.text}"
    )


def test_login_valid_credentials():
    """After registering, logging in with correct credentials should return a token."""
    email    = unique_email()
    password = "ValidPass456!"

    reg = register_user(email, password)
    assert reg.status_code == 200, f"Registration failed: {reg.text}"

    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text

    data = response.json()
    assert "access_token" in data
    assert "role"         in data
    assert "user_id"      in data
    assert "name"         in data
    assert "email"        in data
    assert data["name"] == "Test User"
    assert data["email"] == email


def test_login_invalid_password():
    """Logging in with the wrong password should return 401."""
    email = unique_email()

    reg = register_user(email, password="CorrectPass789!")
    assert reg.status_code == 200, f"Registration failed: {reg.text}"

    response = client.post("/auth/login", json={"email": email, "password": "WrongPass000!"})
    assert response.status_code == 401, (
        f"Expected 401 for wrong password, got {response.status_code}: {response.text}"
    )


def test_login_nonexistent_user():
    """Logging in with an email that was never registered should return 401."""
    response = client.post(
        "/auth/login",
        json={"email": unique_email(), "password": "DoesNotMatter1!"},
    )
    assert response.status_code == 401, (
        f"Expected 401 for unknown user, got {response.status_code}: {response.text}"
    )
