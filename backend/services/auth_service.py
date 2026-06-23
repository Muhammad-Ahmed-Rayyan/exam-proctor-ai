import os
from datetime import datetime, timedelta
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

from fastapi import HTTPException
from jose import jwt
from passlib.context import CryptContext

from database import supabase
from models.schemas import UserLogin, UserRegister

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"


def register_user(data: UserRegister):
    existing = (
        supabase.table("users")
        .select("id")
        .eq("email", data.email)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = pwd_context.hash(data.password)
    user_id = str(uuid4())
    insert_payload = {
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "password_hash": password_hash,
        "role": data.role,
    }
    result = supabase.table("users").insert(insert_payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = result.data[0]
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


def login_user(data: UserLogin):
    result = (
        supabase.table("users")
        .select("id, name, email, password_hash, role")
        .eq("email", data.email)
        .execute()
    )
    user = result.data[0] if result.data else None
    if not user or not pwd_context.verify(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        raise HTTPException(status_code=500, detail="Server configuration error")

    expire = datetime.utcnow() + timedelta(hours=24)
    token_payload = {"sub": user["id"], "role": user["role"], "exp": expire}
    access_token = jwt.encode(token_payload, secret_key, algorithm=ALGORITHM)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
        "user_id": user["id"],
        "name": user.get("name"),
        "email": user.get("email"),
    }