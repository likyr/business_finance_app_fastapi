"""API endpoints для работы с расходами"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from src.database import get_db
from src.models.financial import Expense
from src.schemas.expenses import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from src.utils.mappers import expense_to_response, extract_expense_type


router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("", response_model=List[ExpenseResponse])
def get_expenses(
    user_id: Optional[int] = Query(None, description="ID пользователя для фильтрации"),
    db: Session = Depends(get_db)
):
    """Возвращает список всех расходов с опциональной фильтрацией по user_id"""
    query = db.query(Expense)
    
    if user_id:
        query = query.filter(Expense.user_id == user_id)
    
    expenses = query.all()
    return [expense_to_response(expense) for expense in expenses]


@router.post("", response_model=ExpenseResponse)
def create_expense(expense_data: ExpenseCreate, db: Session = Depends(get_db)):
    """Создаёт новый расход"""
    # Поддержка как category, так и type (для совместимости)
    expense_type = extract_expense_type(expense_data)
    
    new_expense = Expense(
        amount=expense_data.amount,
        type=expense_type,  # маппинг category/type -> type
        description=expense_data.description,
        date=expense_data.date,
        user_id=expense_data.user_id,
        name=expense_data.name
    )
    
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    
    return expense_to_response(new_expense)


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db)
):
    """Обновляет данные расхода по ID"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Расход не найден")
    
    # Обновляем только переданные поля
    _update_expense_fields(expense, expense_data)
    
    db.commit()
    db.refresh(expense)
    
    return expense_to_response(expense)


def _update_expense_fields(expense: Expense, expense_data: ExpenseUpdate):
    """Обновляет поля расхода из данных обновления"""
    if expense_data.amount is not None:
        expense.amount = expense_data.amount
    
    # Поддержка как category, так и type (для совместимости)
    # type имеет приоритет над category
    expense_type = extract_expense_type(expense_data)
    if expense_type is not None:
        expense.type = expense_type
    
    if expense_data.description is not None:
        expense.description = expense_data.description
    if expense_data.date is not None:
        expense.date = expense_data.date
    if expense_data.name is not None:
        expense.name = expense_data.name
    if expense_data.user_id is not None:
        expense.user_id = expense_data.user_id


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Удаляет расход по ID"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Расход не найден")
    
    db.delete(expense)
    db.commit()
    
    return {"ok": True}

