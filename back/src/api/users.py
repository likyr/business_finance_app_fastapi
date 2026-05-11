"""API endpoints для работы с пользователями"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database import get_db
from src.models.user import User
from src.schemas.users import UserResponse, RoleUpdate, RoleUpdateResponse
from src.config.constants import UserRoles


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """
    Получение списка всех пользователей системы.
    
    Returns:
        List[UserResponse]: Массив с данными всех пользователей
    """
    users = db.query(User).all()
    return users


@router.put("/{userId}/role", response_model=RoleUpdateResponse)
def update_user_role(
    userId: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_db)
):
    """
    Обновление роли пользователя.
    
    Args:
        userId: ID пользователя, роль которого нужно изменить
        role_data: Объект с полем 'role' и значением 'User' или 'Admin'
        db: Сессия базы данных
    
    Returns:
        RoleUpdateResponse: Обновленные данные пользователя с сообщением
    """
    # Валидация роли
    if not UserRoles.is_valid(role_data.role):
        raise HTTPException(
            status_code=400,
            detail="Недопустимая роль. Используйте 'User' или 'Admin'"
        )
    
    # Поиск пользователя
    user = db.query(User).filter(User.id == userId).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"Пользователь с ID {userId} не найден"
        )
    
    # Обновление роли
    user.role = role_data.role
    db.commit()
    db.refresh(user)
    
    return RoleUpdateResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        message="Роль пользователя успешно обновлена"
    )

