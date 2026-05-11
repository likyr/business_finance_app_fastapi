from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
from decimal import Decimal
from datetime import date, datetime, timedelta
from collections import defaultdict

from src.database import get_db
from src.models.financial import Expense, Income
from src.schemas.analytics import (
    ProfitResponse,
    IncomeExpenseItem,
    ExpenseTypeItem,
    ProfitByMonthItem,
    ExpensesByTypesItem
)
from src.utils.period_utils import parse_period, get_date_grouping_key, get_months_in_period


router = APIRouter(prefix="/api/analytics", tags=["analytics"])

EXPENSE_TYPES = [
    "Материальные затраты",
    "Оплата труда",
    "Имущество и аренда",
    "Налоги и сборы",
    "Услуги",
    "Прочие расходы"
]


@router.get("/profit", response_model=ProfitResponse)
def get_profit(
    user_id: int = Query(..., description="ID пользователя"),
    period: str = Query(..., description="Тип периода: 'month', 'quarter', 'year'"),
    period_value: str = Query(..., description="Значение периода"),
    db: Session = Depends(get_db)
):
    """
    Возвращает чистую прибыль и рентабельность за выбранный период.

    - Чистая прибыль = Сумма всех доходов - Сумма всех расходов
    - Рентабельность = (Чистая прибыль / Сумма всех доходов) × 100%
    """
    try:
        start_date, end_date = parse_period(period, period_value)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Получаем сумму доходов
    total_income = db.query(func.sum(Income.amount)).filter(
        and_(
            Income.user_id == user_id,
            Income.date >= start_date,
            Income.date < end_date
        )
    ).scalar() or Decimal("0")
    
    # Получаем сумму расходов
    total_expense = db.query(func.sum(Expense.amount)).filter(
        and_(
            Expense.user_id == user_id,
            Expense.date >= start_date,
            Expense.date < end_date
        )
    ).scalar() or Decimal("0")
    
    # Вычисляем чистую прибыль
    net_profit = total_income - total_expense
    
    # Вычисляем рентабельность
    if total_income > 0:
        profitability = (net_profit / total_income) * Decimal("100")
    else:
        profitability = Decimal("0")
    
    return ProfitResponse(
        net_profit=net_profit,
        profitability=profitability
    )


@router.get("/income-expense", response_model=List[IncomeExpenseItem])
def get_income_expense(
    user_id: int = Query(..., description="ID пользователя"),
    period: str = Query(..., description="Тип периода: 'month', 'quarter', 'year'"),
    period_value: str = Query(..., description="Значение периода"),
    db: Session = Depends(get_db)
):
    """
    Возвращает данные для линейного графика доходов и расходов по датам внутри выбранного периода.
    """
    try:
        start_date, end_date = parse_period(period, period_value)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Получаем доходы за период
    incomes = db.query(Income).filter(
        and_(
            Income.user_id == user_id,
            Income.date >= start_date,
            Income.date < end_date
        )
    ).all()
    
    # Получаем расходы за период
    expenses = db.query(Expense).filter(
        and_(
            Expense.user_id == user_id,
            Expense.date >= start_date,
            Expense.date < end_date
        )
    ).all()
    
    # Группируем по датам
    income_by_date = defaultdict(Decimal)
    expense_by_date = defaultdict(Decimal)
    
    for income in incomes:
        key = get_date_grouping_key(period, income.date)
        income_by_date[key] += income.amount
    
    for expense in expenses:
        key = get_date_grouping_key(period, expense.date)
        expense_by_date[key] += expense.amount
    
    # Собираем все уникальные даты
    all_dates = set(income_by_date.keys()) | set(expense_by_date.keys())
    
    # Формируем результат
    result = []
    for date_key in sorted(all_dates):
        result.append(IncomeExpenseItem(
            date=date_key,
            income=income_by_date.get(date_key, Decimal("0")),
            expense=expense_by_date.get(date_key, Decimal("0"))
        ))
    
    return result


@router.get("/expense-types", response_model=List[ExpenseTypeItem])
def get_expense_types(
    user_id: int = Query(..., description="ID пользователя"),
    period: str = Query(..., description="Тип периода: 'month', 'quarter', 'year'"),
    period_value: str = Query(..., description="Значение периода"),
    db: Session = Depends(get_db)
):
    """
    Возвращает данные для круговой диаграммы распределения расходов по типам за выбранный период.
    """
    try:
        start_date, end_date = parse_period(period, period_value)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Получаем расходы за период
    expenses = db.query(Expense).filter(
        and_(
            Expense.user_id == user_id,
            Expense.date >= start_date,
            Expense.date < end_date
        )
    ).all()
    
    # Группируем по типам
    expense_by_type = defaultdict(Decimal)
    for expense in expenses:
        if expense.type:
            expense_by_type[expense.type] += expense.amount
    
    # Формируем результат для всех типов
    result = []
    for expense_type in EXPENSE_TYPES:
        amount = expense_by_type.get(expense_type, Decimal("0"))
        result.append(ExpenseTypeItem(
            type=expense_type,
            amount=amount
        ))
    
    return result


@router.get("/profit-by-months", response_model=List[ProfitByMonthItem])
def get_profit_by_months(
    user_id: int = Query(..., description="ID пользователя"),
    period: str = Query(..., description="Тип периода: 'month', 'quarter', 'year'"),
    period_value: str = Query(..., description="Значение периода"),
    db: Session = Depends(get_db)
):
    """
    Возвращает чистую прибыль по месяцам для выбранного периода.
    Для month: разбивает по дням (формат YYYY-MM-DD)
    Для quarter и year: разбивает по месяцам (формат YYYY-MM)
    """
    try:
        start_date, end_date = parse_period(period, period_value)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    result = []
    
    if period == "month":
        # Для месяца разбиваем по дням
        current_date = start_date
        while current_date < end_date:
            # Получаем доходы за день
            total_income = db.query(func.sum(Income.amount)).filter(
                and_(
                    Income.user_id == user_id,
                    Income.date == current_date
                )
            ).scalar() or Decimal("0")
            
            # Получаем расходы за день
            total_expense = db.query(func.sum(Expense.amount)).filter(
                and_(
                    Expense.user_id == user_id,
                    Expense.date == current_date
                )
            ).scalar() or Decimal("0")
            
            # Вычисляем прибыль
            profit = total_income - total_expense
            
            result.append(ProfitByMonthItem(
                month=current_date.strftime("%Y-%m-%d"),
                profit=profit
            ))
            
            # Переходим к следующему дню
            current_date += timedelta(days=1)
    else:
        # Для квартала и года разбиваем по месяцам
        months = get_months_in_period(period, period_value)
        
        for month_str in months:
            # Парсим месяц
            year, month = map(int, month_str.split("-"))
            month_start = date(year, month, 1)
            if month < 12:
                month_end = date(year, month + 1, 1)
            else:
                month_end = date(year + 1, 1, 1)
            
            # Получаем доходы за месяц
            total_income = db.query(func.sum(Income.amount)).filter(
                and_(
                    Income.user_id == user_id,
                    Income.date >= month_start,
                    Income.date < month_end
                )
            ).scalar() or Decimal("0")
            
            # Получаем расходы за месяц
            total_expense = db.query(func.sum(Expense.amount)).filter(
                and_(
                    Expense.user_id == user_id,
                    Expense.date >= month_start,
                    Expense.date < month_end
                )
            ).scalar() or Decimal("0")
            
            # Вычисляем прибыль
            profit = total_income - total_expense
            
            result.append(ProfitByMonthItem(
                month=month_str,
                profit=profit
            ))
    
    return result


@router.get("/expenses-by-types", response_model=List[ExpensesByTypesItem])
def get_expenses_by_types(
    user_id: int = Query(..., description="ID пользователя"),
    period: str = Query(..., description="Тип периода: 'month', 'quarter', 'year'"),
    period_value: str = Query(..., description="Значение периода"),
    db: Session = Depends(get_db)
):
    """
    Возвращает данные для линейного графика расходов по типам.
    Показывает динамику каждого типа расхода по времени внутри выбранного периода.
    """
    try:
        start_date, end_date = parse_period(period, period_value)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Получаем расходы за период
    expenses = db.query(Expense).filter(
        and_(
            Expense.user_id == user_id,
            Expense.date >= start_date,
            Expense.date < end_date
        )
    ).all()
    
    # Группируем по датам и типам
    # Структура: {date_key: {type: amount}}
    expenses_by_date_type = defaultdict(lambda: defaultdict(Decimal))
    
    for expense in expenses:
        date_key = get_date_grouping_key(period, expense.date)
        expense_type = expense.type or "Прочие расходы"
        # Если тип не входит в список известных типов, относим к "Прочие расходы"
        if expense_type not in EXPENSE_TYPES:
            expense_type = "Прочие расходы"
        expenses_by_date_type[date_key][expense_type] += expense.amount
    
    # Собираем все уникальные даты
    all_dates = sorted(expenses_by_date_type.keys())
    
    # Формируем результат
    result = []
    for date_key in all_dates:
        item_data = {"date": date_key}
        
        # Добавляем все типы расходов (даже если значение 0)
        for expense_type in EXPENSE_TYPES:
            amount = expenses_by_date_type[date_key].get(expense_type, Decimal("0"))
            item_data[expense_type] = amount
        
        result.append(ExpensesByTypesItem(**item_data))
    
    return result

