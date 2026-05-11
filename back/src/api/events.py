"""API для приёма аналитических событий."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.events import ConversionEvent, InteractionEvent, ScreenViewEvent, SystemEvent
from src.schemas.events import EventTrackRequest, EventTrackResponse

router = APIRouter(prefix="/api/events", tags=["events"])


@router.post("", response_model=EventTrackResponse)
def track_event(payload: EventTrackRequest, db: Session = Depends(get_db)):
    if payload.category == "screen_view":
        event = ScreenViewEvent(
            event_name=payload.event_name,
            user_id=payload.user_id,
            org_id=payload.org_id,
            entry_source=payload.entry_source,
            device_type=payload.device_type,
            record_count=payload.record_count,
            filter_active=payload.filter_active,
            profile_status=payload.profile_status,
            period_range=payload.period_range,
            metrics_count=payload.metrics_count,
            users_total=payload.users_total,
            tax_mode=payload.tax_mode,
        )
    elif payload.category == "interaction":
        event = InteractionEvent(
            event_name=payload.event_name,
            user_id=payload.user_id,
            action_type=payload.action_type,
            entity_id=payload.entity_id,
            filter_field=payload.filter_field,
            filter_value=payload.filter_value,
            metric_name=payload.metric_name,
            chart_id=payload.chart_id,
            report_type=payload.report_type,
            period_days=payload.period_days,
            file_format=payload.file_format,
            report_id=payload.report_id,
            target_user_id=payload.target_user_id,
            new_status=payload.new_status,
            param_name=payload.param_name,
            old_value=payload.old_value,
        )
    elif payload.category == "conversion":
        event = ConversionEvent(
            event_name=payload.event_name,
            user_id=payload.user_id,
            org_id=payload.org_id,
            auth_time_ms=payload.auth_time_ms,
            completion_time=payload.completion_time,
            record_id=payload.record_id,
            amount_value=payload.amount_value,
            report_id=payload.report_id,
            calc_duration_ms=payload.calc_duration_ms,
            format=payload.format,
            file_size_kb=payload.file_size_kb,
        )
    else:
        event = SystemEvent(
            event_name=payload.event_name,
            user_id=payload.user_id,
            module_name=payload.module_name,
            query_string=payload.query_string,
            results_count=payload.results_count,
            execution_time_ms=payload.execution_time_ms,
            records_affected=payload.records_affected,
            sync_status=payload.sync_status,
            error_code=payload.error_code,
            severity=payload.severity,
            trigger_event=payload.trigger_event,
            calc_duration_ms=payload.calc_duration_ms,
        )

    db.add(event)
    db.commit()
    db.refresh(event)
    return EventTrackResponse(success=True, event_id=event.id)
