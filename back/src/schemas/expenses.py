"""Схемы для работы с расходами и доходами"""
from pydantic import BaseModel
from datetime import date as date_type
from decimal import Decimal
from typing import Optional


class ExpenseBase(BaseModel):
    """Базовая схема расхода"""
    amount: Decimal
    category: Optional[str] = None  # соответствует type в БД
    type: Optional[str] = None  # альтернатива для category (для совместимости)
    description: Optional[str] = None
    date: date_type
    user_id: int
    name: Optional[str] = None  # поле из БД


class ExpenseCreate(ExpenseBase):
    """Схема создания расхода"""
    pass


class ExpenseUpdate(BaseModel):
    """Схема обновления расхода"""
    amount: Optional[Decimal] = None
    category: Optional[str] = None  # соответствует type в БД
    type: Optional[str] = None  # альтернатива для category (для совместимости)
    description: Optional[str] = None
    date: Optional[date_type] = None
    name: Optional[str] = None
    user_id: Optional[int] = None


class ExpenseResponse(BaseModel):
    """Схема ответа с данными расхода"""
    id: int
    amount: Decimal
    category: Optional[str] = None
    type: Optional[str] = None  # альтернатива для category (для совместимости)
    description: Optional[str] = None
    date: date_type
    user_id: int
    name: Optional[str] = None

    class Config:
        from_attributes = True


class IncomeBase(BaseModel):
    """Базовая схема дохода"""
    amount: Decimal
    source: Optional[str] = None
    description: Optional[str] = None
    date: date_type
    user_id: int
    name: Optional[str] = None  # поле из БД


class IncomeCreate(IncomeBase):
    """Схема создания дохода"""
    pass


class IncomeUpdate(BaseModel):
    """Схема обновления дохода"""
    amount: Optional[Decimal] = None
    source: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date_type] = None
    name: Optional[str] = None
    user_id: Optional[int] = None


class IncomeResponse(BaseModel):
    """Схема ответа с данными дохода"""
    id: int
    amount: Decimal
    source: Optional[str] = None
    description: Optional[str] = None
    date: date_type
    user_id: int
    name: Optional[str] = None

    class Config:
        from_attributes = True

