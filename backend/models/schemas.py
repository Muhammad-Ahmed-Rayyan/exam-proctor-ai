from typing import Literal

from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["student", "admin"]


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: Literal["student", "admin"]
    user_id: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Literal["student", "admin"]