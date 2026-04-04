from __future__ import annotations

from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field

class WorkerBase(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10)
    city: str = Field(..., min_length=1)
    language: str
    platforms: List[str]
    platforms_count: int
    dark_store_zones: List[str]
    days_per_week: int
    shift_timing: str
    weekly_income: float
    weekly_budget: float
    savings_level: str
    disruption_frequency: str
    past_disruption_types: List[str]
    upi_id: str
    device_fingerprint: str

class WorkerCreate(WorkerBase):
    pass

class WorkerRegisterSimple(BaseModel):
    name: str
    phone: str
    city: str
    zone: str
    platform: str
    weekly_income: float
    selected_plan: str
    upi_id: str
    device_fingerprint: str

class WorkerResponse(WorkerBase):
    id: int
    risk_score: Optional[int] = None
    recommended_plan: Optional[str] = None
    created_at: datetime
    account_age_days: int

    class Config:
        from_attributes = True

class PlanResponse(BaseModel):
    id: str
    name: str
    weekly_premium: int
    triggers_covered: List[str]
    max_payout_per_week: int
    max_payout_per_event: int

    class Config:
        from_attributes = True

class PolicyCreate(BaseModel):
    worker_id: int
    plan_id: str

class PolicyResponse(BaseModel):
    id: int
    worker_id: int
    plan_id: str
    status: str
    start_date: datetime
    next_renewal_date: datetime
    total_premiums_paid: int
    total_payouts_received: int
    surge_active: bool
    surge_multiplier: float
    surge_reason: Optional[str] = None

    class Config:
        from_attributes = True

class ShiftCheckIn(BaseModel):
    worker_id: int
    dark_store_zone: str
    device_fingerprint: str

class ShiftCheckOut(BaseModel):
    worker_id: int

class ShiftResponse(BaseModel):
    id: int
    worker_id: int
    dark_store_zone: str
    checkin_time: datetime
    checkout_time: Optional[datetime] = None
    status: str
    device_fingerprint: str

    class Config:
        from_attributes = True

class ClaimResponse(BaseModel):
    id: str
    worker_id: int
    policy_id: int
    trigger_type: str
    zone: str
    payout_amount: int
    auto_created: bool
    fraud_score: Optional[int] = None
    fraud_flags: List[str]
    status: str
    created_at: datetime
    approved_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    time_to_payout_seconds: Optional[int] = None
    razorpay_payout_id: Optional[str] = None

    class Config:
        from_attributes = True

class PremiumCalculateRequest(BaseModel):
    zone_rain_frequency_2yr: float
    zone_flood_events_2yr: int
    zone_heat_days_2yr: int
    zone_avg_aqi: float
    platforms_count: int
    days_per_week: int
    shift_timing_encoded: int
    weekly_income: float
    savings_encoded: int
    disruption_frequency_encoded: int

class PremiumCalculateResponse(BaseModel):
    risk_score: int
    risk_label: str
    recommended_plan: str
    premium_amount: int
    budget_plan: str
    budget_premium: int
    score_breakdown: Dict[str, Any]
    weekly_forecast_risk: str

class SystemStatusResponse(BaseModel):
    rain: str
    flood: str
    heat: str
    aqi: str
    zone_shutdown: str
    platforms: str

class AppealRequest(BaseModel):
    reason: str
    additional_info: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    device_fingerprint: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: Optional[int] = None
    is_new_user: bool
