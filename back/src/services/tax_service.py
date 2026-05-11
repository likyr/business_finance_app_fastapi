"""Сервис для расчета налогов"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from decimal import Decimal

from src.models.organisation import Organisation
from src.models.taxes import TaxRateEN, TaxRate
from src.models.financial import Income
from src.schemas.taxes import TaxResponse
from src.config.constants import INCOME_THRESHOLD
from src.utils.organisation_utils import is_unified_tax_system


def calculate_unified_tax(
    organisation: Organisation,
    period_type: str,
    db: Session
) -> Optional[TaxResponse]:
    """
    Рассчитывает фиксированный налог для единой системы налогообложения.
    
    Для квартала сумма налога умножается на 3 (за три месяца).
    
    Args:
        organisation: Организация
        period_type: Тип периода ('month' или 'quarter')
        db: Сессия базы данных
        
    Returns:
        TaxResponse или None, если не удалось рассчитать
    """
    if not organisation.activity_id or not organisation.region_id:
        return None
    
    tax_rate_en = db.query(TaxRateEN).filter(
        and_(
            TaxRateEN.activity_id == organisation.activity_id,
            TaxRateEN.region_id == organisation.region_id
        )
    ).first()
    
    if not tax_rate_en:
        return None
    
    monthly_tax = Decimal(str(tax_rate_en.tax_rate))
    
    # Для квартала умножаем налог за месяц на 3
    multiplier = 3 if period_type == "quarter" else 1
    total_tax = monthly_tax * multiplier
    
    return TaxResponse(
        id=tax_rate_en.tax_rate_id,
        tax_name="Единый налог",
        amount=total_tax
    )


def calculate_percentage_tax(
    organisation: Organisation,
    total_income: Decimal,
    db: Session
) -> Optional[TaxResponse]:
    """
    Рассчитывает процентный налог для других систем налогообложения.
    
    Args:
        organisation: Организация
        total_income: Общая сумма дохода
        db: Сессия базы данных
        
    Returns:
        TaxResponse или None, если не удалось рассчитать
    """
    if not organisation.tax_system_id or total_income <= 0:
        return None
    
    # Определяем тип ставки на основе дохода
    tax_type = "основная ставка" if total_income <= INCOME_THRESHOLD else "повышенная ставка"
    
    # Получаем ставку из tax_rates
    tax_rate_obj = db.query(TaxRate).filter(
        and_(
            TaxRate.tax_system_id == organisation.tax_system_id,
            TaxRate.tax_type == tax_type
        )
    ).first()
    
    # Fallback: если не найдена нужная ставка, ищем любую ставку для этой системы
    if not tax_rate_obj:
        tax_rate_obj = db.query(TaxRate).filter(
            TaxRate.tax_system_id == organisation.tax_system_id
        ).first()
    
    if not tax_rate_obj:
        return None
    
    tax_rate = Decimal(str(tax_rate_obj.tax_rate))
    tax_amount = total_income * (tax_rate / 100)
    
    return TaxResponse(
        id=tax_rate_obj.id,
        tax_name=tax_rate_obj.tax_type,
        amount=tax_amount
    )


def calculate_taxes(
    organisation: Organisation,
    total_income: Decimal,
    period_type: str,
    db: Session
) -> List[TaxResponse]:
    """
    Рассчитывает налоги на основе налоговой системы организации.
    
    Args:
        organisation: Организация
        total_income: Общая сумма дохода
        period_type: Тип периода ('month' или 'quarter')
        db: Сессия базы данных
        
    Returns:
        Список рассчитанных налогов
    """
    if not organisation.tax_system:
        return []
    
    tax_system_name = organisation.tax_system.system_name or ""
    
    if is_unified_tax_system(tax_system_name):
        tax = calculate_unified_tax(organisation, period_type, db)
        return [tax] if tax else []
    else:
        tax = calculate_percentage_tax(organisation, total_income, db)
        return [tax] if tax else []


def get_income_for_period(
    user_id: int,
    start_date,
    end_date,
    db: Session
) -> Decimal:
    """
    Получает сумму доходов пользователя за указанный период.
    
    Args:
        user_id: ID пользователя
        start_date: Начальная дата периода
        end_date: Конечная дата периода
        db: Сессия базы данных
        
    Returns:
        Общая сумма доходов за период
    """
    incomes = db.query(Income).filter(
        and_(
            Income.user_id == user_id,
            Income.date >= start_date,
            Income.date < end_date
        )
    ).all()
    
    return sum(Decimal(str(income.amount)) for income in incomes)

