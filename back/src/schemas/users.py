"""Схемы для работы с пользователями"""
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    """Схема регистрации пользователя"""
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """Схема входа пользователя"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Схема ответа с данными пользователя"""
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Схема ответа при аутентификации"""
    user: UserResponse


class RoleUpdate(BaseModel):
    """Схема обновления роли пользователя"""
    role: str  # "User" or "Admin"


class RoleUpdateResponse(BaseModel):
    """Схема ответа при обновлении роли пользователя"""
    id: int
    email: str
    role: str
    message: str
