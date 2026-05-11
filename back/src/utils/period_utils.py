"""Утилиты для работы с периодами"""
from datetime import datetime
from typing import Tuple


def parse_period(period_type: str, period: str) -> Tuple[datetime.date, datetime.date]:
    """
    Парсит период и возвращает начальную и конечную даты.
    
    Args:
        period_type: Тип периода ('month', 'quarter' или 'year')
        period: Период в формате YYYY-MM для месяца, YYYY-QN для квартала или YYYY для года
        
    Returns:
        Кортеж (start_date, end_date)
        
    Raises:
        ValueError: Если формат периода некорректный
    """
    if period_type == "month":
        return _parse_month_period(period)
    elif period_type == "quarter":
        return _parse_quarter_period(period)
    elif period_type == "year":
        return _parse_year_period(period)
    else:
        raise ValueError(f"Некорректный тип периода: {period_type}. Используйте 'month', 'quarter' или 'year'")


def _parse_month_period(period: str) -> Tuple[datetime.date, datetime.date]:
    """Парсит месячный период в формате YYYY-MM"""
    try:
        year, month = map(int, period.split("-"))
        start_date = datetime(year, month, 1).date()
        
        # Вычисляем дату начала следующего месяца
        if month < 12:
            end_date = datetime(year, month + 1, 1).date()
        else:
            end_date = datetime(year + 1, 1, 1).date()
            
        return start_date, end_date
    except (ValueError, IndexError) as e:
        raise ValueError(f"Некорректный формат месяца. Используйте YYYY-MM. Ошибка: {str(e)}")


def _parse_quarter_period(period: str) -> Tuple[datetime.date, datetime.date]:
    """Парсит квартальный период в формате YYYY-QN"""
    try:
        parts = period.split("-")
        if len(parts) != 2 or not parts[1].startswith("Q"):
            raise ValueError("Некорректный формат квартала. Используйте YYYY-QN (например, 2024-Q1)")
            
        year = int(parts[0])
        quarter = int(parts[1][1:])
        
        if not (1 <= quarter <= 4):
            raise ValueError("Квартал должен быть от 1 до 4")
        
        # Вычисляем начальный месяц квартала
        start_month = (quarter - 1) * 3 + 1
        start_date = datetime(year, start_month, 1).date()
        
        # Вычисляем дату начала следующего квартала
        if quarter < 4:
            end_month = quarter * 3 + 1
            end_date = datetime(year, end_month, 1).date()
        else:
            end_date = datetime(year + 1, 1, 1).date()
            
        return start_date, end_date
    except (ValueError, IndexError) as e:
        raise ValueError(f"Некорректный формат квартала. Используйте YYYY-QN. Ошибка: {str(e)}")


def _parse_year_period(period: str) -> Tuple[datetime.date, datetime.date]:
    """Парсит годовой период в формате YYYY"""
    try:
        year = int(period)
        start_date = datetime(year, 1, 1).date()
        end_date = datetime(year + 1, 1, 1).date()
        return start_date, end_date
    except ValueError as e:
        raise ValueError(f"Некорректный формат года. Используйте YYYY. Ошибка: {str(e)}")


def format_period_label(period_type: str) -> str:
    """Форматирует тип периода в читаемый формат"""
    if period_type == "month":
        return "месяц"
    elif period_type == "quarter":
        return "квартал"
    elif period_type == "year":
        return "год"
    return period_type


def get_date_grouping_key(period_type: str, date: datetime.date) -> str:
    """
    Возвращает ключ для группировки даты в зависимости от типа периода.
    
    Args:
        period_type: Тип периода ('month', 'quarter' или 'year')
        date: Дата для группировки
        
    Returns:
        Строка ключа для группировки
    """
    if period_type == "month":
        # Группировка по дням
        return date.strftime("%Y-%m-%d")
    elif period_type == "quarter":
        # Группировка по месяцам
        return date.strftime("%Y-%m")
    elif period_type == "year":
        # Группировка по месяцам
        return date.strftime("%Y-%m")
    else:
        return date.strftime("%Y-%m-%d")


def get_months_in_period(period_type: str, period_value: str) -> list[str]:
    """
    Возвращает список месяцев в формате YYYY-MM для заданного периода.
    
    Args:
        period_type: Тип периода ('month', 'quarter' или 'year')
        period_value: Значение периода
        
    Returns:
        Список месяцев в формате YYYY-MM
    """
    start_date, end_date = parse_period(period_type, period_value)
    months = []
    current = datetime(start_date.year, start_date.month, 1).date()
    
    while current < end_date:
        months.append(current.strftime("%Y-%m"))
        # Переходим к следующему месяцу
        if current.month < 12:
            current = datetime(current.year, current.month + 1, 1).date()
        else:
            current = datetime(current.year + 1, 1, 1).date()
    
    return months








