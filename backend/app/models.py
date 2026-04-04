from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .db import Base

class Worker(Base):
    __tablename__ = "workers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    city: Mapped[str] = mapped_column(String, nullable=False)
    language: Mapped[str] = mapped_column(String, nullable=False)
    platforms: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    platforms_count: Mapped[int] = mapped_column(Integer, nullable=False)
    dark_store_zones: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    days_per_week: Mapped[int] = mapped_column(Integer, nullable=False)
    shift_timing: Mapped[str] = mapped_column(String, nullable=False)
    weekly_income: Mapped[float] = mapped_column(Float, nullable=False)
    weekly_budget: Mapped[float] = mapped_column(Float, nullable=False)
    savings_level: Mapped[str] = mapped_column(String, nullable=False)
    disruption_frequency: Mapped[str] = mapped_column(String, nullable=False)
    past_disruption_types: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    upi_id: Mapped[str] = mapped_column(String, nullable=False)
    device_fingerprint: Mapped[str] = mapped_column(String, nullable=False)
    risk_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    recommended_plan: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    account_age_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class Plan(Base):
    __tablename__ = "plans"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    weekly_premium: Mapped[int] = mapped_column(Integer, nullable=False)
    triggers_covered: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    max_payout_per_week: Mapped[int] = mapped_column(Integer, nullable=False)
    max_payout_per_event: Mapped[int] = mapped_column(Integer, nullable=False)


class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    worker_id: Mapped[int] = mapped_column(ForeignKey("workers.id", ondelete="CASCADE"), index=True)
    plan_id: Mapped[str] = mapped_column(ForeignKey("plans.id"), nullable=False)
    
    status: Mapped[str] = mapped_column(String, nullable=False) # active / paused / expired
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    next_renewal_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    total_premiums_paid: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_payouts_received: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    surge_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    surge_multiplier: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    surge_reason: Mapped[str | None] = mapped_column(String, nullable=True)


class Shift(Base):
    __tablename__ = "shifts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    worker_id: Mapped[int] = mapped_column(ForeignKey("workers.id", ondelete="CASCADE"), index=True)
    dark_store_zone: Mapped[str] = mapped_column(String, nullable=False)
    checkin_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    checkout_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False) # active / completed
    device_fingerprint: Mapped[str] = mapped_column(String, nullable=False)


class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    worker_id: Mapped[int] = mapped_column(ForeignKey("workers.id", ondelete="CASCADE"), index=True)
    policy_id: Mapped[int] = mapped_column(ForeignKey("policies.id", ondelete="CASCADE"), index=True)
    
    trigger_type: Mapped[str] = mapped_column(String, nullable=False)
    zone: Mapped[str] = mapped_column(String, nullable=False)
    payout_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    auto_created: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    fraud_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fraud_flags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False) # fraud_check_pending / approved / silent_hold / manual_review / rejected / paid
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    time_to_payout_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    razorpay_payout_id: Mapped[str | None] = mapped_column(String, nullable=True)
