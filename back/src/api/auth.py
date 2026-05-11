"""API endpoints для аутентификации"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.schemas.users import UserRegister, UserLogin, AuthResponse
from src.services.auth_service import (
    register_user,
    authenticate_user,
    user_to_response
)


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    new_user = register_user(user_data, db)
    return AuthResponse(user=user_to_response(new_user))


@router.post("/login", response_model=AuthResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Аутентификация пользователя"""
    user = authenticate_user(user_data, db)
    return AuthResponse(user=user_to_response(user))

