"""Схемы аналитических событий."""
from typing import Literal, Optional

from pydantic import BaseModel


EventCategory = Literal["screen_view", "interaction", "conversion", "system"]


class EventTrackRequest(BaseModel):
    category: EventCategory
    event_name: str
    user_id: Optional[int] = None

    org_id: Optional[int] = None
    entry_source: Optional[str] = None
    device_type: Optional[str] = None
    record_count: Optional[int] = None
    filter_active: Optional[bool] = None
    profile_status: Optional[str] = None
    period_range: Optional[str] = None
    metrics_count: Optional[int] = None
    users_total: Optional[int] = None
    tax_mode: Optional[str] = None

    action_type: Optional[str] = None
    entity_id: Optional[str] = None
    filter_field: Optional[str] = None
    filter_value: Optional[str] = None
    metric_name: Optional[str] = None
    chart_id: Optional[str] = None
    report_type: Optional[str] = None
    period_days: Optional[int] = None
    file_format: Optional[str] = None
    report_id: Optional[str] = None
    target_user_id: Optional[int] = None
    new_status: Optional[str] = None
    param_name: Optional[str] = None
    old_value: Optional[str] = None

    auth_time_ms: Optional[float] = None
    completion_time: Optional[float] = None
    record_id: Optional[int] = None
    amount_value: Optional[float] = None
    calc_duration_ms: Optional[float] = None
    format: Optional[str] = None
    file_size_kb: Optional[float] = None

    module_name: Optional[str] = None
    query_string: Optional[str] = None
    results_count: Optional[int] = None
    execution_time_ms: Optional[float] = None
    records_affected: Optional[int] = None
    sync_status: Optional[str] = None
    error_code: Optional[str] = None
    severity: Optional[str] = None
    trigger_event: Optional[str] = None


class EventTrackResponse(BaseModel):
    success: bool
    event_id: int
