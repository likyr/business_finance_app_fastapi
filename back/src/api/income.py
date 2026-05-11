"""API endpoints для работы с доходами"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from src.database import get_db
from src.models.financial import Income
from src.schemas.expenses import IncomeCreate, IncomeUpdate, IncomeResponse
from src.utils.mappers import income_to_response


router = APIRouter(prefix="/api/income", tags=["income"])


@router.get("", response_model=List[IncomeResponse])
def get_incomes(
    user_id: Optional[int] = Query(None, description="ID пользователя для фильтрации"),
    db: Session = Depends(get_db)
):
    """Возвращает список всех доходов с опциональной фильтрацией по user_id"""
    query = db.query(Income)
    
    if user_id:
        query = query.filter(Income.user_id == user_id)
    
    incomes = query.all()
    return [income_to_response(income) for income in incomes]


@router.post("", response_model=IncomeResponse)
def create_income(income_data: IncomeCreate, db: Session = Depends(get_db)):
    """Создаёт новый доход"""
    new_income = Income(
        amount=income_data.amount,
        source=income_data.source,
        description=income_data.description,
        date=income_data.date,
        user_id=income_data.user_id,
        name=income_data.name
    )
    
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    
    return income_to_response(new_income)


@router.put("/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: int,
    income_data: IncomeUpdate,
    db: Session = Depends(get_db)
):
    """Обновляет данные дохода по ID"""
    income = db.query(Income).filter(Income.id == income_id).first()
    
    if not income:
        raise HTTPException(status_code=404, detail="Доход не найден")
    
    # Обновляем только переданные поля
    _update_income_fields(income, income_data)
    
    db.commit()
    db.refresh(income)
    
    return income_to_response(income)


def _update_income_fields(income: Income, income_data: IncomeUpdate):
    """Обновляет поля дохода из данных обновления"""
    if income_data.amount is not None:
        income.amount = income_data.amount
    if income_data.source is not None:
        income.source = income_data.source
    if income_data.description is not None:
        income.description = income_data.description
    if income_data.date is not None:
        income.date = income_data.date
    if income_data.name is not None:
        income.name = income_data.name
    if income_data.user_id is not None:
        income.user_id = income_data.user_id


@router.delete("/{income_id}")
def delete_income(income_id: int, db: Session = Depends(get_db)):
    """Удаляет доход по ID"""
    income = db.query(Income).filter(Income.id == income_id).first()
    
    if not income:
        raise HTTPException(status_code=404, detail="Доход не найден")
    
    db.delete(income)
    db.commit()
    
    return {"ok": True}

