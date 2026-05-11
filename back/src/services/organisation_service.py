"""Сервис для работы с организациями"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import Optional

from src.models.user import User
from src.models.organisation import Organisation, TaxSystem, Region, Activity
from src.schemas.company import CompanyResponse


def get_company_options(
    option_type: str,
    db: Session
) -> list[str]:
    """
    Получает список опций для компании (системы налогообложения, регионы, виды деятельности).
    
    Args:
        option_type: Тип опции ('tax-systems', 'regions', 'activity-types')
        db: Сессия базы данных
        
    Returns:
        Список названий опций
        
    Raises:
        HTTPException: При ошибке сервера
    """
    try:
        if option_type == "tax-systems":
            tax_systems = db.query(TaxSystem).all()
            return [tax_system.system_name for tax_system in tax_systems]
        elif option_type == "regions":
            regions = db.query(Region).all()
            return [region.region_name for region in regions]
        elif option_type == "activity-types":
            activities = db.query(Activity).all()
            return [activity.activity_name for activity in activities]
        else:
            raise ValueError(f"Неподдерживаемый тип опции: {option_type}")
    except ValueError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка сервера при получении опций типа {option_type}"
        )


def validate_company_data(
    company_data,
    db: Session
) -> tuple[User, TaxSystem, Region, Activity]:
    """
    Валидирует данные компании.
    
    Args:
        company_data: Данные компании для обновления
        db: Сессия базы данных
        
    Returns:
        Кортеж (user, tax_system, region, activity)
        
    Raises:
        HTTPException: При некорректных данных
    """
    # Валидация user_id
    user = db.query(User).filter(User.id == company_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Некорректные данные компании"
        )
    
    # Валидация tax_system
    tax_system = db.query(TaxSystem).filter(
        TaxSystem.system_name == company_data.tax_system
    ).first()
    if not tax_system:
        raise HTTPException(
            status_code=422,
            detail=[{
                "loc": ["body", "tax_system"],
                "msg": "Система налогообложения не найдена в списке доступных",
                "type": "value_error"
            }]
        )
    
    # Валидация region
    region = db.query(Region).filter(
        Region.region_name == company_data.region
    ).first()
    if not region:
        raise HTTPException(
            status_code=422,
            detail=[{
                "loc": ["body", "region"],
                "msg": "Регион не найден в списке доступных",
                "type": "value_error"
            }]
        )
    
    # Валидация activity_type
    activity = db.query(Activity).filter(
        Activity.activity_name == company_data.activity_type
    ).first()
    if not activity:
        raise HTTPException(
            status_code=422,
            detail=[{
                "loc": ["body", "activity_type"],
                "msg": "Вид деятельности не найден в списке доступных",
                "type": "value_error"
            }]
        )
    
    return user, tax_system, region, activity


def update_organisation(
    organisation: Organisation,
    company_data,
    tax_system: TaxSystem,
    region: Region,
    activity: Activity,
    db: Session
) -> Organisation:
    """
    Обновляет данные организации.
    
    Args:
        organisation: Организация для обновления
        company_data: Новые данные компании
        tax_system: Система налогообложения
        region: Регион
        activity: Вид деятельности
        db: Сессия базы данных
        
    Returns:
        Обновленная организация
    """
    organisation.name = company_data.company_name
    organisation.unp = company_data.unp
    organisation.tax_system_id = tax_system.id
    organisation.region_id = region.id
    organisation.activity_id = activity.id
    
    db.commit()
    db.refresh(organisation)
    
    return organisation


def organisation_to_response(organisation: Organisation) -> CompanyResponse:
    """Преобразует модель Organisation в CompanyResponse"""
    return CompanyResponse(
        tax_system=organisation.tax_system.system_name if organisation.tax_system else None,
        company_name=organisation.name,
        unp=organisation.unp,
        region=organisation.region.region_name if organisation.region else None,
        activity_type=organisation.activity.activity_name if organisation.activity else None
    )

