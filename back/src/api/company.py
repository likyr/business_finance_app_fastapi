"""API endpoints для работы с компаниями"""
from typing import List, Union

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.organisation import Organisation
from src.schemas.company import (
    CompanyUpdate,
    CompanyResponse,
    OptionItem,
)
from src.services.organisation_service import (
    get_company_options,
    validate_company_data,
    update_organisation,
    organisation_to_response,
)
from src.utils.organisation_utils import get_user_with_organisation

router = APIRouter(prefix="/api/company", tags=["company"])


@router.get("", response_model=CompanyResponse)
def get_company(
    user_id: int = Query(..., description="ID пользователя"),
    db: Session = Depends(get_db),
):
    """Получение информации об организации пользователя"""
    user, organisation = get_user_with_organisation(user_id, db)
    return organisation_to_response(organisation)


@router.put("", response_model=CompanyResponse)
def update_company(
    company_data: CompanyUpdate,
    db: Session = Depends(get_db),
):
    """Обновление информации об организации пользователя"""
    try:
        user, tax_system, region, activity = validate_company_data(company_data, db)

        if not user.organisation_id:
            raise HTTPException(
                status_code=404,
                detail="Информация об организации не найдена для данного пользователя",
            )

        organisation = db.query(Organisation).filter(
            Organisation.id == user.organisation_id
        ).first()

        if not organisation:
            raise HTTPException(
                status_code=404,
                detail="Информация об организации не найдена для данного пользователя",
            )

        update_organisation(
            organisation=organisation,
            company_data=company_data,
            tax_system=tax_system,
            region=region,
            activity=activity,
            db=db,
        )

        return organisation_to_response(organisation)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Ошибка сервера при обновлении информации об организации",
        )


@router.get("/options/tax-systems", response_model=Union[List[str], List[OptionItem]])
def get_tax_systems(db: Session = Depends(get_db)):
    """Получение списка доступных систем налогообложения"""
    return get_company_options("tax-systems", db)


@router.get("/options/regions", response_model=Union[List[str], List[OptionItem]])
def get_regions(db: Session = Depends(get_db)):
    """Получение списка доступных регионов"""
    return get_company_options("regions", db)


@router.get("/options/activity-types", response_model=Union[List[str], List[OptionItem]])
def get_activity_types(db: Session = Depends(get_db)):
    """Получение списка доступных видов деятельности"""
    return get_company_options("activity-types", db)