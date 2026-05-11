"""Утилиты для генерации отчетов"""
from datetime import datetime
from decimal import Decimal
from io import BytesIO
from pathlib import Path
from typing import List, Optional, Tuple

from jinja2 import Template

try:
    from docxtpl import DocxTemplate  # type: ignore
except Exception:
    DocxTemplate = None  # если зависимости нет, упадем с понятной ошибкой при использовании DOCX

from src.models.organisation import Organisation
from src.schemas.taxes import TaxResponse

_BASE_DIR = Path(__file__).resolve().parent.parent.parent
# Пути к шаблонам Word/RTF (предоставленные файлы)
QUARTER_REPORT_TEMPLATE_RTF = _BASE_DIR / "4ufphy2cll08ckeopbl670vhdu1uwtss.RTF"
QUARTER_REPORT_TEMPLATE_DOCX = _BASE_DIR / "4ufphy2cll08ckeopbl670vhdu1uwtss.docx"


def _extract_quarter_number(period: str) -> Optional[int]:
    """Извлекает номер квартала из строки формата YYYY-QN."""
    try:
        parts = period.split("-")
        if len(parts) != 2 or not parts[1].startswith("Q"):
            return None
        return int(parts[1][1:])
    except Exception:
        return None


def generate_report_data(
    organisation: Organisation,
    period: str,
    start_date,
    end_date,
    total_income: Decimal,
    taxes: List[TaxResponse],
    quarter_month_taxes: Optional[List[str]] = None,
) -> dict:
    """
    Генерирует данные для отчета.
    
    Args:
        organisation: Организация
        period: Период (YYYY-QN)
        start_date: Начальная дата периода
        end_date: Конечная дата периода
        total_income: Общая сумма дохода
        taxes: Список налогов
        
    Returns:
        Словарь с данными отчета
    """
    quarter_number = _extract_quarter_number(period)
    # Лейбл квартала без слова "квартал": "1-й", "2-й", ...
    quarter_label = f"{quarter_number}-й" if quarter_number else ""

    return {
        "report_info": {
            "period": period,
            "period_type": "quarter",
            "period_label": quarter_label,
            "quarter_number": quarter_number,
            "date_from": start_date.strftime("%d.%m.%Y"),
            "date_to": end_date.strftime("%d.%m.%Y"),
            "generated_at": datetime.now().strftime("%d.%m.%Y %H:%M:%S")
        },
        "organisation": {
            "name": organisation.name,
            "unp": organisation.unp,
            "tax_system": organisation.tax_system.system_name if organisation.tax_system else None,
            "region": organisation.region.region_name if organisation.region else None,
            "activity": organisation.activity.activity_name if organisation.activity else None
        },
        "financial_data": {
            "total_income": float(total_income),
            "total_income_formatted": f"{total_income:,.2f} руб."
        },
        "taxes": [
            {
                "id": tax.id,
                "tax_name": tax.tax_name,
                "amount": float(tax.amount),
                "amount_formatted": f"{tax.amount:,.2f} руб."
            }
            for tax in taxes
        ],
        "summary": {
            "total_tax_amount": float(sum(tax.amount for tax in taxes)) if taxes else 0.0,
            "total_tax_amount_formatted": f"{sum(tax.amount for tax in taxes):,.2f} руб." if taxes else "0,00 руб."
        },
        "quarter_month_taxes": quarter_month_taxes or [],
    }


def _escape_rtf(text: str) -> str:
    """Экранирует служебные символы для RTF."""
    return (
        text.replace("\\", "\\\\")
        .replace("{", "\\{")
        .replace("}", "\\}")
    )


def _build_tax_rows_rtf(taxes: List[dict]) -> str:
    """
    Собирает блок списка налогов в RTF-формате с \line между строками.
    """
    if not taxes:
        return _escape_rtf("Нет начисленных налогов за период")
    parts = []
    for tax in taxes:
        name = tax.get("tax_name", "")
        amount = tax.get("amount_formatted", "")
        parts.append(r"\bullet " + _escape_rtf(f"{name}: {amount}"))
    return r"\line ".join(parts)


def _build_context(report_data: dict) -> dict:
    """Формирует общий контекст для шаблонов (RTF и DOCX)."""
    info = report_data.get("report_info", {})
    summary = report_data.get("summary", {})

    # Дата/время формирования
    generated_at_raw = info.get("generated_at") or ""
    try:
        # ожидаемый формат "%d.%m.%Y %H:%M:%S"
        dt = datetime.strptime(generated_at_raw, "%d.%m.%Y %H:%M:%S")
    except Exception:
        dt = datetime.now()

    day = f"{dt.day:02d}"
    month_num = f"{dt.month:02d}"
    year4 = f"{dt.year:04d}"

    quarter_label = info.get("period_label") or ""

    # Плейсхолдеры для помесячных сумм в квартале (если есть подготовленные данные)
    quarter_month_taxes = report_data.get("quarter_month_taxes") or []

    def _get_month_tax(idx: int) -> str:
        try:
            val = quarter_month_taxes[idx]
            return _escape_rtf(str(val))
        except Exception:
            return "-"

    month1_tax = _get_month_tax(0)
    month2_tax = _get_month_tax(1)
    month3_tax = _get_month_tax(2)

    # Плоский контекст для старых плейсхолдеров
    flat_context = {
        "QUARTER_LABEL": _escape_rtf(quarter_label),
        "YEAR4": _escape_rtf(year4),
        "DAY": _escape_rtf(day),
        "MONTH_NUM": _escape_rtf(month_num),
        "MONTH1_TAX": month1_tax,
        "MONTH2_TAX": month2_tax,
        "MONTH3_TAX": month3_tax,
        "QUARTER_TAX_TOTAL": _escape_rtf(summary.get("total_tax_amount_formatted") or ""),
    }

    # Базовый контекст — все данные отчёта + плоские поля
    return {
        **report_data,
        **flat_context,
    }


def _render_rtf_template(report_data: dict, template_path: Path) -> bytes:
    """
    Подставляет данные в RTF-шаблон с помощью Jinja2.

    Можно использовать как простые плейсхолдеры вида {{ QUARTER_LABEL }},
    так и обращение к полям словаря, например {{ organisation.name }}.
    """
    with template_path.open("r", encoding="cp1251", errors="ignore") as f:
        template_source = f.read()

    context = _build_context(report_data)
    rendered = Template(template_source).render(context)

    return rendered.encode("cp1251", errors="ignore")


def _render_docx_template(report_data: dict, template_path: Path) -> bytes:
    """
    Подставляет данные в DOCX-шаблон (Word) через docxtpl.
    """
    if DocxTemplate is None:
        raise ImportError(
            "Для рендеринга DOCX установите зависимость docxtpl "
            "(pip install docxtpl)"
        )

    doc = DocxTemplate(str(template_path))
    context = _build_context(report_data)
    doc.render(context)

    buf = BytesIO()
    doc.save(buf)
    return buf.getvalue()


def render_quarter_report(report_data: dict) -> Tuple[bytes, str, str]:
    """
    Формирует отчет, выбирая шаблон по приоритету:
    1. DOCX (если есть файл .docx)
    2. RTF (если есть файл .RTF)

    Returns:
        bytes: Содержимое файла
        str: media_type для ответа
        str: расширение файла без точки
    """
    if QUARTER_REPORT_TEMPLATE_DOCX.is_file():
        content = _render_docx_template(report_data, QUARTER_REPORT_TEMPLATE_DOCX)
        return (
            content,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "docx",
        )

    if QUARTER_REPORT_TEMPLATE_RTF.is_file():
        content = _render_rtf_template(report_data, QUARTER_REPORT_TEMPLATE_RTF)
        return content, "application/rtf", "rtf"

    raise FileNotFoundError(
        "Шаблон квартального отчета не найден. "
        f"Ожидается DOCX: {QUARTER_REPORT_TEMPLATE_DOCX} или RTF: {QUARTER_REPORT_TEMPLATE_RTF}"
    )


def render_quarter_report_rtf(report_data: dict) -> bytes:
    """
    Легаси-функция: формирует только RTF по RTF-шаблону.
    """
    if not QUARTER_REPORT_TEMPLATE_RTF.is_file():
        raise FileNotFoundError(
            f"RTF-шаблон квартального отчета не найден: {QUARTER_REPORT_TEMPLATE_RTF}"
        )

    return _render_rtf_template(report_data, QUARTER_REPORT_TEMPLATE_RTF)

