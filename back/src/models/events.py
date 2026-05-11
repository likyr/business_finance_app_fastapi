"""Модели аналитических событий."""
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from src.database import Base


class ScreenViewEvent(Base):
    __tablename__ = "screen_views"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(100), nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    org_id = Column(Integer, nullable=True)
    entry_source = Column(String(100), nullable=True)
    device_type = Column(String(50), nullable=True)
    record_count = Column(Integer, nullable=True)
    filter_active = Column(Boolean, nullable=True)
    profile_status = Column(String(100), nullable=True)
    period_range = Column(String(50), nullable=True)
    metrics_count = Column(Integer, nullable=True)
    users_total = Column(Integer, nullable=True)
    tax_mode = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class InteractionEvent(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(100), nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    action_type = Column(String(50), nullable=True)
    entity_id = Column(String(64), nullable=True)
    filter_field = Column(String(100), nullable=True)
    filter_value = Column(String(255), nullable=True)
    metric_name = Column(String(100), nullable=True)
    chart_id = Column(String(100), nullable=True)
    report_type = Column(String(50), nullable=True)
    period_days = Column(Integer, nullable=True)
    file_format = Column(String(20), nullable=True)
    report_id = Column(String(64), nullable=True)
    target_user_id = Column(Integer, nullable=True)
    new_status = Column(String(50), nullable=True)
    param_name = Column(String(100), nullable=True)
    old_value = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ConversionEvent(Base):
    __tablename__ = "conversions"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(100), nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    auth_time_ms = Column(Float, nullable=True)
    org_id = Column(Integer, nullable=True)
    completion_time = Column(Float, nullable=True)
    record_id = Column(Integer, nullable=True)
    amount_value = Column(Float, nullable=True)
    report_id = Column(String(64), nullable=True)
    calc_duration_ms = Column(Float, nullable=True)
    format = Column(String(20), nullable=True)
    file_size_kb = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class SystemEvent(Base):
    __tablename__ = "system_events"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(100), nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    module_name = Column(String(100), nullable=True)
    query_string = Column(String(255), nullable=True)
    results_count = Column(Integer, nullable=True)
    execution_time_ms = Column(Float, nullable=True)
    records_affected = Column(Integer, nullable=True)
    sync_status = Column(String(20), nullable=True)
    error_code = Column(String(50), nullable=True)
    severity = Column(String(20), nullable=True)
    trigger_event = Column(String(100), nullable=True)
    calc_duration_ms = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
