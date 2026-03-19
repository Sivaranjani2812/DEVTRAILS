from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


HighRainLocations = {
    # Mock set of “high rainfall” areas for the demo.
    "Mumbai",
    "Chennai",
    "Kolkata",
    "HSR Layout",
    "BTM Layout",
    "Koramangala",
}


PlanName = Literal["Basic", "Standard", "Premium"]


@dataclass(frozen=True)
class PlanDetails:
    plan_name: PlanName
    weekly_premium: float
    coverage_amount: float


def clamp_int(v: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, v))


def calculate_risk_score(
    *,
    location: str,
    days_per_week: int,
    shift: str,
) -> int:
    """
    Rule-based mock scoring:
    - Night shift increases risk
    - More days increases risk
    - High rainfall location increases risk
    """
    risk = 10

    shift_lower = (shift or "").lower()
    if "night" in shift_lower or "evening" in shift_lower:
        risk += 35
    elif "afternoon" in shift_lower:
        risk += 20
    else:
        risk += 12

    # Rough scaling for demo.
    if days_per_week >= 6:
        risk += 25
    elif days_per_week == 5:
        risk += 18
    elif days_per_week >= 3:
        risk += 10
    else:
        risk += 6

    location_norm = (location or "").strip()
    if location_norm in HighRainLocations:
        risk += 30

    return clamp_int(risk, 0, 100)


def recommended_plan_from_risk(risk_score: int) -> PlanName:
    if risk_score <= 33:
        return "Basic"
    if risk_score <= 66:
        return "Standard"
    return "Premium"


def plan_details(plan: PlanName) -> PlanDetails:
    # Demo-aligned numbers; Standard matches the sample UI: ₹72/week and ₹3,000 coverage.
    if plan == "Basic":
        return PlanDetails(plan_name="Basic", weekly_premium=49.0, coverage_amount=2000.0)
    if plan == "Standard":
        return PlanDetails(plan_name="Standard", weekly_premium=72.0, coverage_amount=3000.0)
    return PlanDetails(plan_name="Premium", weekly_premium=99.0, coverage_amount=5000.0)


def is_night_shift_active_mock(shift: str) -> bool:
    # Spec says to mock this as TRUE for the simplified demo.
    # Keeping it deterministic ensures trigger->claim->fraud->payout completes quickly.
    return True

