from fastapi import APIRouter

from models.schemas import TokenResponse, UserLogin, UserOut, UserRegister
from services.auth_service import login_user, register_user

router = APIRouter()


@router.post("/register", response_model=UserOut)
def register(data: UserRegister):
    return register_user(data)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin):
    return login_user(data)