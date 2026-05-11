"""Сервис для работы с аутентификацией"""
from sqlalchemy.orm import Session
from fastapi import HTTPException

from src.models.user import User
from src.models.organisation import Organisation
from src.schemas.users import UserRegister, UserLogin, UserResponse
from src.config.constants import DEFAULT_UNP, DEFAULT_ORGANISATION_NAME


def register_user(user_data: UserRegister, db: Session) -> User:
    """
    Регистрирует нового пользователя.
    
    Создает организацию по умолчанию и привязывает к ней пользователя.
    
    Args:
        user_data: Данные для регистрации
        db: Сессия базы данных
        
    Returns:
        Созданный пользователь
        
    Raises:
        HTTPException: Если email уже зарегистрирован
    """
    # Проверка существования пользователя
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    
    # Создание организации
    organisation = Organisation(
        name=DEFAULT_ORGANISATION_NAME,
        unp=DEFAULT_UNP,
        number_of_employees=0
    )
    db.add(organisation)
    db.flush()
    
    # Создание пользователя
    new_user = User(
        email=user_data.email,
        password=user_data.password,
        role="User",
        organisation_id=organisation.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


def authenticate_user(user_data: UserLogin, db: Session) -> User:
    """
    Аутентифицирует пользователя.
    
    Args:
        user_data: Данные для входа
        db: Сессия базы данных
        
    Returns:
        Пользователь при успешной аутентификации
        
    Raises:
        HTTPException: Если email или пароль неверны
    """
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or user_data.password != user.password:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    
    return user


def user_to_response(user: User) -> UserResponse:
    """Преобразует модель User в UserResponse"""
    return UserResponse(id=user.id, email=user.email, role=user.role)

