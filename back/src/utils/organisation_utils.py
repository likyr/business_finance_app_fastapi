"""Утилиты для работы с организациями"""
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from src.models.user import User
from src.models.organisation import Organisation


def get_user_with_organisation(user_id: int, db: Session) -> tuple[User, Organisation]:
    """
    Получает пользователя с загруженной организацией и связанными данными.
    
    Args:
        user_id: ID пользователя
        db: Сессия базы данных
        
    Returns:
        Кортеж (user, organisation)
        
    Raises:
        HTTPException: Если пользователь или организация не найдены
    """
    user = db.query(User).options(
        joinedload(User.organisation).joinedload(Organisation.tax_system),
        joinedload(User.organisation).joinedload(Organisation.region),
        joinedload(User.organisation).joinedload(Organisation.activity)
    ).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if not user.organisation:
        raise HTTPException(status_code=404, detail="Информация об организации не найдена")
    
    return user, user.organisation


def is_unified_tax_system(tax_system_name: str) -> bool:
    """
    Проверяет, является ли налоговая система единой.
    
    Args:
        tax_system_name: Название системы налогообложения
        
    Returns:
        True, если система единая, False в противном случае
    """
    if not tax_system_name:
        return False
    
    name_lower = tax_system_name.strip().lower()
    return (
        name_lower == "единая система" or
        name_lower == "единая система налогообложения" or
        "единая" in name_lower
    )

