"""API endpoints для работы с налогами"""
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from src.database import get_db
from src.schemas.taxes import (
    TaxResponse,
    TaxReportCreate,
    IncomeTaxTypeResponse,
    IncomeTaxTypeUpdate,
    UpdateIncomeTaxTypesResponse,
    UnifiedTaxRateResponse,
    UnifiedTaxRateUpdate,
    UpdateUnifiedTaxRateResponse,
)
from src.models.taxes import TaxRate, TaxRateEN
from src.models.organisation import Region, Activity
from src.config.constants import PeriodType
from src.utils.period_utils import parse_period, get_months_in_period
from src.utils.organisation_utils import get_user_with_organisation
from src.utils.report_utils import generate_report_data, render_quarter_report
from src.services.tax_service import calculate_taxes, get_income_for_period

router = APIRouter(prefix="/api/taxes", tags=["taxes"])


@router.get("", response_model=List[TaxResponse])
def get_taxes(
    user_id: int = Query(..., description="ID пользователя"),
    period_type: str = Query(..., description="Тип периода: 'month' или 'quarter'"),
    period: str = Query(..., description="Период в формате YYYY-MM или YYYY-QN"),
    db: Session = Depends(get_db),
):
    """Получение налоговой нагрузки с фильтрацией по периоду"""
    if not PeriodType.is_valid(period_type):
        raise HTTPException(
            status_code=422,
            detail="Некорректный формат периода. Для месяца используйте YYYY-MM, для квартала YYYY-QN",
        )

    try:
        start_date, end_date = parse_period(period_type, period)
    except (ValueError, IndexError) as e:
        raise HTTPException(
            status_code=422,
            detail=f"Некорректный формат периода. Для месяца используйте YYYY-MM, для квартала YYYY-QN. {str(e)}",
        )

    user, organisation = get_user_with_organisation(user_id, db)
    total_income = get_income_for_period(user_id, start_date, end_date, db)

    return calculate_taxes(organisation, total_income, period_type, db)


@router.post("/report")
def create_tax_report(
    report_data: TaxReportCreate,
    db: Session = Depends(get_db),
):
    """Создание и скачивание квартального отчета по налогам"""
    try:
        start_date, end_date = parse_period(PeriodType.QUARTER, report_data.period)
    except (ValueError, IndexError) as e:
        raise HTTPException(
            status_code=422,
            detail=f"Некорректный формат периода. Используйте YYYY-QN. {str(e)}",
        )

    user, organisation = get_user_with_organisation(report_data.user_id, db)
    total_income = get_income_for_period(report_data.user_id, start_date, end_date, db)
    taxes = calculate_taxes(organisation, total_income, PeriodType.QUARTER, db)

    month_values = get_months_in_period(PeriodType.QUARTER, report_data.period)
    month_tax_totals: list[str] = []

    for month_value in month_values:
        m_start, m_end = parse_period(PeriodType.MONTH, month_value)
        m_income = get_income_for_period(report_data.user_id, m_start, m_end, db)
        m_taxes = calculate_taxes(organisation, m_income, PeriodType.MONTH, db)
        m_total = sum(t.amount for t in m_taxes) if m_taxes else 0
        month_tax_totals.append(f"{m_total:,.2f} руб.")

    report_data_dict = generate_report_data(
        organisation=organisation,
        period=report_data.period,
        start_date=start_date,
        end_date=end_date,
        total_income=total_income,
        taxes=taxes,
        quarter_month_taxes=month_tax_totals,
    )

    file_bytes, media_type, ext = render_quarter_report(report_data_dict)
    period_normalized = report_data.period.replace("-", "_")
    filename = f"tax_report_{period_normalized}.{ext}"

    return Response(
        content=file_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/income-tax-types", response_model=List[IncomeTaxTypeResponse])
def get_income_tax_types(db: Session = Depends(get_db)):
    """Получение списка типов подоходного налога"""
    tax_rates = db.query(TaxRate).all()

    return [
        IncomeTaxTypeResponse(
            name=tax_rate.tax_type,
            value=Decimal(str(tax_rate.tax_rate)),
        )
        for tax_rate in tax_rates
    ]


@router.put("/income-tax-types", response_model=UpdateIncomeTaxTypesResponse)
def update_income_tax_types(
    tax_types: List[IncomeTaxTypeUpdate],
    db: Session = Depends(get_db),
):
    """Обновление значений типов подоходного налога"""
    updated_count = 0
    not_found_types = []

    try:
        for tax_type_update in tax_types:
            tax_rate = db.query(TaxRate).filter(
                TaxRate.tax_type == tax_type_update.name
            ).first()

            if tax_rate:
                tax_rate.tax_rate = tax_type_update.value
                updated_count += 1
            else:
                not_found_types.append(tax_type_update.name)

        db.commit()

        if not_found_types:
            message = (
                f"Обновлено типов: {updated_count}. "
                f"Не найдены типы: {', '.join(not_found_types)}"
            )
        else:
            message = "Типы подоходного налога успешно обновлены"

        return UpdateIncomeTaxTypesResponse(
            success=True,
            message=message,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при обновлении типов подоходного налога: {str(e)}",
        )


@router.get("/unified-tax-rates", response_model=List[UnifiedTaxRateResponse])
def get_unified_tax_rates(db: Session = Depends(get_db)):
    """Получение всех ставок единого налога"""
    tax_rates = db.query(TaxRateEN).options(
        joinedload(TaxRateEN.region),
        joinedload(TaxRateEN.activity),
    ).all()

    return [
        UnifiedTaxRateResponse(
            region=tax_rate.region.region_name,
            activity_type=tax_rate.activity.activity_name,
            rate=Decimal(str(tax_rate.tax_rate)),
        )
        for tax_rate in tax_rates
        if tax_rate.region and tax_rate.activity
    ]


@router.put("/unified-tax-rates", response_model=UpdateUnifiedTaxRateResponse)
def update_unified_tax_rate(
    tax_rate_data: UnifiedTaxRateUpdate,
    db: Session = Depends(get_db),
):
    """Обновление или создание ставки единого налога"""
    try:
        region = db.query(Region).filter(
            Region.region_name == tax_rate_data.region
        ).first()
        if not region:
            raise HTTPException(
                status_code=400,
                detail=f"Регион '{tax_rate_data.region}' не найден в справочнике",
            )

        activity = db.query(Activity).filter(
            Activity.activity_name == tax_rate_data.activity_type
        ).first()
        if not activity:
            raise HTTPException(
                status_code=400,
                detail=f"Вид деятельности '{tax_rate_data.activity_type}' не найден в справочнике",
            )

        existing_rate = db.query(TaxRateEN).filter(
            TaxRateEN.region_id == region.id,
            TaxRateEN.activity_id == activity.id,
        ).first()

        if existing_rate:
            existing_rate.tax_rate = tax_rate_data.rate
            db.commit()
            db.refresh(existing_rate)
        else:
            new_rate = TaxRateEN(
                region_id=region.id,
                activity_id=activity.id,
                tax_rate=tax_rate_data.rate,
            )
            db.add(new_rate)
            db.commit()
            db.refresh(new_rate)

        return UpdateUnifiedTaxRateResponse(
            success=True,
            message="Ставка единого налога успешно обновлена",
            region=tax_rate_data.region,
            activity_type=tax_rate_data.activity_type,
            rate=tax_rate_data.rate,
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при обновлении ставки единого налога: {str(e)}",
        )