"""Функции для преобразования моделей в схемы"""
from src.models.financial import Expense, Income
from src.schemas.expenses import ExpenseResponse, IncomeResponse


def expense_to_response(expense: Expense) -> ExpenseResponse:
    """
    Преобразует модель Expense в ExpenseResponse.
    
    Выполняет маппинг type (из БД) в category и type (для API совместимости).
    """
    return ExpenseResponse(
        id=expense.id,
        amount=expense.amount,
        category=expense.type,  # маппинг type -> category (для совместимости)
        type=expense.type,  # также возвращаем type напрямую
        description=expense.description,
        date=expense.date,
        user_id=expense.user_id,
        name=expense.name
    )


def income_to_response(income: Income) -> IncomeResponse:
    """Преобразует модель Income в IncomeResponse"""
    return IncomeResponse(
        id=income.id,
        amount=income.amount,
        source=income.source,
        description=income.description,
        date=income.date,
        user_id=income.user_id,
        name=income.name
    )


def extract_expense_type(expense_data) -> str:
    """
    Извлекает тип расхода из данных.
    Поддерживает как category, так и type для совместимости.
    type имеет приоритет над category.
    """
    if expense_data.type is not None:
        return expense_data.type
    elif expense_data.category is not None:
        return expense_data.category
    return None

