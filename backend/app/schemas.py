from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class OnboardRequest(BaseModel):
    location: str = Field(..., min_length=1, max_length=200)
    platform: str = Field(..., min_length=1, max_length=200)
    days_per_week: int = Field(..., ge=1, le=7)
    shift: str = Field(..., min_length=1, max_length=100)
    weekly_income: float = Field(..., ge=0)


class OnboardResponse(BaseModel):
    user_id: int
    risk_score: int
    recommended_plan: Literal["Basic", "Standard", "Premium"]


class SelectPlanRequest(BaseModel):
    user_id: int
    selected_plan: Literal["Basic", "Standard", "Premium"]


class SelectPlanResponse(BaseModel):
    policy_id: int
    plan_name: Literal["Basic", "Standard", "Premium"]
    weekly_premium: float
    coverage_amount: float
    auto_renew: bool = True
    policy_status: str


class PayRequest(BaseModel):
    user_id: int


class PayResponse(BaseModel):
    payment_status: Literal["SUCCESS"]
    policy_status: Literal["ACTIVE"]
    next_billing_date: datetime


class ClaimSchema(BaseModel):
    id: str
    trigger_type: str
    status: str
    payout_amount: Optional[float]
    created_at: datetime


class DashboardResponse(BaseModel):
    active_plan: Optional[Literal["Basic", "Standard", "Premium"]] = None
    coverage: Optional[float] = None
    policy_status: str
    next_billing_date: Optional[datetime] = None
    total_payout_received: float = 0.0
    recent_claims: list[ClaimSchema] = []


class TriggerRainRequest(BaseModel):
    location: Optional[str] = None
    # Spec says rainfall is simulated at 25mm; allow override for easier testing.
    rainfall_mm: Optional[float] = Field(default=25.0, ge=0)


class TriggerRainResponse(BaseModel):
    rainfall_mm: float
    trigger_location: str
    claims_created: int
    claim_ids: list[str]
