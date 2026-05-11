
from pydantic import BaseModel, Field
from decimal import Decimal
from typing import List, Dict, Optional
from datetime import date


class ProfitResponse(BaseModel):
    """Схема ответа для чистой прибыли и рентабельности"""
    net_profit: Optional[Decimal] = Field(None, alias="profit")
    profitability: Optional[Decimal] = Field(None, alias="profitability_percent")
    
    class Config:
        populate_by_name = True


class IncomeExpenseItem(BaseModel):
    """Схема элемента для графика доходов и расходов"""
    date: str
    income: Optional[Decimal] = Field(None, alias="income_amount")
    expense: Optional[Decimal] = Field(None, alias="expense_amount")
    
    class Config:
        populate_by_name = True


class ExpenseTypeItem(BaseModel):
    """Схема элемента для распределения расходов по типам"""
    type: Optional[str] = Field(None, alias="name")
    amount: Optional[Decimal] = Field(None, alias="value")
    expense_type: Optional[str] = None
    total: Optional[Decimal] = None
    
    class Config:
        populate_by_name = True


class ProfitByMonthItem(BaseModel):
    """Схема элемента для прибыли по месяцам"""
    month: str
    profit: Optional[Decimal] = Field(None, alias="net_profit")
    period: Optional[str] = None
    
    class Config:
        populate_by_name = True


class ExpensesByTypesItem(BaseModel):
    """Схема элемента для расходов по типам по времени"""
    date: str
    
    class Config:
        extra = "allow"

