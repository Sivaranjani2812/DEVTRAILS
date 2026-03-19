from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import Base, SessionLocal, engine, get_db
from app.models import Claim, ClaimStatus, Policy, PolicyStatus, User
from app.schemas import (
    DashboardResponse,
    OnboardRequest,
    OnboardResponse,
    PayRequest,
    PayResponse,
    SelectPlanRequest,
    SelectPlanResponse,
    TriggerRainRequest,
    TriggerRainResponse,
)
from app.services import calculate_risk_score, is_night_shift_active_mock, plan_details, recommended_plan_from_risk

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gigshield")

app = FastAPI(title="GigShield Backend", version="0.1-demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = BackgroundScheduler(timezone="UTC")


def fraud_check_job(claim_id: str, trigger_location: str) -> None:
    db: Session = SessionLocal()
    try:
        claim = db.get(Claim, claim_id)
        if not claim:
            return
        if claim.status != ClaimStatus.PENDING.value:
            # Only evaluate pending claims.
            return

        user = db.get(User, claim.user_id)
        if not user:
            claim.status = ClaimStatus.REJECTED.value
            db.commit()
            return

        # Fraud detection (simplified for demo):
        # - Location matches trigger location
        # - User shift is active (mock)
        location_matches = (user.location or "").strip() == (trigger_location or "").strip()
        shift_active = is_night_shift_active_mock(user.shift)
        is_valid = location_matches and shift_active

        claim.status = ClaimStatus.APPROVED.value if is_valid else ClaimStatus.REJECTED.value
        db.commit()
    except Exception:
        logger.exception("fraud_check_job failed for claim_id=%s", claim_id)
    finally:
        db.close()


def payout_job(claim_id: str) -> None:
    db: Session = SessionLocal()
    try:
        claim = db.get(Claim, claim_id)
        if not claim:
            return
        if claim.status != ClaimStatus.APPROVED.value:
            return

        # Payout system for approved claims (demo-fixed payout).
        claim.payout_amount = 500.0
        claim.status = ClaimStatus.PAID.value
        db.commit()
    except Exception:
        logger.exception("payout_job failed for claim_id=%s", claim_id)
    finally:
        db.close()


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    if not scheduler.running:
        scheduler.start()
    logger.info("GigShield backend started.")


@app.on_event("shutdown")
def on_shutdown() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/onboard", response_model=OnboardResponse)
def onboard(req: OnboardRequest, db: Session = Depends(get_db)) -> OnboardResponse:
    risk_score = calculate_risk_score(
        location=req.location,
        days_per_week=req.days_per_week,
        shift=req.shift,
    )
    recommended_plan = recommended_plan_from_risk(risk_score)

    user = User(
        location=req.location,
        platform=req.platform,
        shift=req.shift,
        weekly_income=req.weekly_income,
        risk_score=risk_score,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return OnboardResponse(user_id=user.id, risk_score=risk_score, recommended_plan=recommended_plan)


@app.post("/select-plan", response_model=SelectPlanResponse)
def select_plan(req: SelectPlanRequest, db: Session = Depends(get_db)) -> SelectPlanResponse:
    user = db.get(User, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    details = plan_details(req.selected_plan)
    policy = Policy(
        user_id=user.id,
        plan_name=details.plan_name,
        premium=details.weekly_premium,
        coverage=details.coverage_amount,
        status=PolicyStatus.SELECTED.value,
        next_billing_date=None,
        auto_renew=True,
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)

    return SelectPlanResponse(
        policy_id=policy.id,
        plan_name=policy.plan_name,  # type: ignore[arg-type]
        weekly_premium=policy.premium,
        coverage_amount=policy.coverage,
        auto_renew=policy.auto_renew,
        policy_status=policy.status,
    )


@app.post("/pay", response_model=PayResponse)
def pay(req: PayRequest, db: Session = Depends(get_db)) -> PayResponse:
    policy = (
        db.query(Policy)
        .filter(Policy.user_id == req.user_id)
        .filter(Policy.status.in_([PolicyStatus.SELECTED.value, PolicyStatus.INACTIVE.value]))
        .order_by(Policy.id.desc())
        .first()
    )
    if not policy:
        raise HTTPException(status_code=404, detail="No selectable policy found for user")

    # Mock payment success (no gateway).
    policy.status = PolicyStatus.ACTIVE.value
    policy.next_billing_date = datetime.utcnow() + timedelta(days=7)
    db.commit()
    db.refresh(policy)

    return PayResponse(
        payment_status="SUCCESS",
        policy_status="ACTIVE",
        next_billing_date=policy.next_billing_date,  # type: ignore[arg-type]
    )


@app.get("/dashboard/{user_id}", response_model=DashboardResponse)
def dashboard(user_id: int, db: Session = Depends(get_db)) -> DashboardResponse:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    active_policy = (
        db.query(Policy)
        .filter(Policy.user_id == user_id, Policy.status == PolicyStatus.ACTIVE.value)
        .order_by(Policy.id.desc())
        .first()
    )
    total_paid = (
        db.query(func.coalesce(func.sum(Claim.payout_amount), 0.0))
        .filter(Claim.user_id == user_id, Claim.status == ClaimStatus.PAID.value)
        .scalar()
    )

    if not active_policy:
        return DashboardResponse(
            active_plan=None,
            coverage=None,
            policy_status="NO_ACTIVE_POLICY",
            next_billing_date=None,
            total_payout_received=float(total_paid or 0.0),
        )

    recent_claims = (
        db.query(Claim)
        .filter(Claim.user_id == user_id)
        .order_by(Claim.created_at.desc())
        .limit(10)
        .all()
    )

    return DashboardResponse(
        active_plan=active_policy.plan_name,  # type: ignore[arg-type]
        coverage=active_policy.coverage,
        policy_status=active_policy.status,
        next_billing_date=active_policy.next_billing_date,
        total_payout_received=float(total_paid or 0.0),
        recent_claims=recent_claims,
    )


@app.post("/trigger/rain", response_model=TriggerRainResponse)
def trigger_rain(req: TriggerRainRequest, db: Session = Depends(get_db)) -> TriggerRainResponse:
    rainfall_mm = float(req.rainfall_mm or 25.0)
    trigger_location = (req.location or "HSR Layout").strip()

    # For demo: only treat >=20mm as a disruption event.
    if rainfall_mm < 20:
        return TriggerRainResponse(
            rainfall_mm=rainfall_mm,
            trigger_location=trigger_location,
            claims_created=0,
            claim_ids=[],
        )

    matched_users = (
        db.query(User)
        .join(Policy, Policy.user_id == User.id)
        .filter(User.location == trigger_location)
        .filter(Policy.status == PolicyStatus.ACTIVE.value)
        .all()
    )

    # Use timezone-aware timestamps so APScheduler runs the jobs reliably.
    now = datetime.now(timezone.utc)
    claim_ids: list[str] = []
    for user in matched_users:
        claim_id = f"CLM-{uuid.uuid4().hex[:12].upper()}"
        claim = Claim(
            id=claim_id,
            user_id=user.id,
            trigger_type="RAIN",
            status=ClaimStatus.PENDING.value,
            payout_amount=None,
        )
        db.add(claim)
        claim_ids.append(claim_id)

    db.commit()

    # Background: pending -> (fraud check) APPROVED/REJECTED -> (payout) PAID.
    fraud_run_date = now + timedelta(seconds=1)
    payout_run_date = now + timedelta(seconds=2)
    for claim_id in claim_ids:
        if not scheduler.running:
            scheduler.start()
        scheduler.add_job(
            fraud_check_job,
            trigger="date",
            run_date=fraud_run_date,
            args=[claim_id, trigger_location],
            id=f"fraud-{claim_id}",
            replace_existing=True,
            misfire_grace_time=10,
        )
        scheduler.add_job(
            payout_job,
            trigger="date",
            run_date=payout_run_date,
            args=[claim_id],
            id=f"payout-{claim_id}",
            replace_existing=True,
            misfire_grace_time=10,
        )

    return TriggerRainResponse(
        rainfall_mm=rainfall_mm,
        trigger_location=trigger_location,
        claims_created=len(claim_ids),
        claim_ids=claim_ids,
    )

