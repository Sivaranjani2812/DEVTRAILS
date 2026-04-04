from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from typing import Optional
from pydantic import BaseModel
from app.db import get_db
from app.models import Worker, Plan, Policy, Claim, Shift
from app.schemas import WorkerCreate, WorkerRegisterSimple
from app.ml.risk_scorer import calculate_risk
import random

router = APIRouter(prefix="/workers", tags=["workers"])

@router.post("/register-simple")
def register_worker_simple(data: WorkerRegisterSimple, db: Session = Depends(get_db)):
    """Simplified registration for the onboarding flow."""
    # Create worker with default risk score for demo
    new_worker = Worker(
        name=data.name,
        phone=data.phone,
        city=data.city,
        dark_store_zones=[data.zone],
        platforms=[data.platform],
        weekly_income=data.weekly_income,
        upi_id=data.upi_id,
        device_fingerprint=data.device_fingerprint,
        risk_score=random.randint(60, 85),
        recommended_plan=data.selected_plan,
        language="English",
        platforms_count=1,
        days_per_week=6,
        shift_timing="Evening",
        weekly_budget=100,
        savings_level="Medium",
        disruption_frequency="Sometimes",
        past_disruption_types=[]
    )
    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)

    # Create active policy for the selected plan
    next_week = datetime.now(timezone.utc) + timedelta(days=7)
    new_policy = Policy(
        worker_id=new_worker.id,
        plan_id=data.selected_plan.lower(),
        status="active",
        start_date=datetime.now(timezone.utc),
        next_renewal_date=next_week,
        total_premiums_paid=0,
        total_payouts_received=0
    )
    db.add(new_policy)
    db.commit()

    return {
        "status": "success",
        "worker_id": new_worker.id,
        "message": "Registration complete and policy activated"
    }

# ── helpers ──────────────────────────────────────────────────────────────────

def _worker_from_request(request: Request, db: Session) -> Optional[Worker]:
    """Try to resolve the authenticated worker from the JWT user_id stored in localStorage.
    Falls back to worker with id=1 so the demo always shows data."""
    # Real auth path: decode JWT and get worker_id
    auth = request.headers.get("Authorization", "")
    # For hackathon: derive user_id from token payload (stored as raw user_id string)
    # The frontend stores the token as the user_id itself from /auth/verify-otp
    worker = None
    if auth.startswith("Bearer "):
        token_val = auth.removeprefix("Bearer ").strip()
        # Try to look up by id if token is numeric
        try:
            wid = int(token_val)
            worker = db.query(Worker).filter(Worker.id == wid).first()
        except (ValueError, TypeError):
            pass
    if not worker:
        worker = db.query(Worker).first()  # demo fallback
    return worker


class RiskProfileRequest(BaseModel):
    city: str
    zone: str
    hoursPerDay: float
    dailyEarnings: float
    platform: str

@router.post("/register")
def register_worker(worker_data: WorkerCreate, db: Session = Depends(get_db)):
    # Prepare features for ML Model
    shift_map = {"morning": 0, "evening": 1, "night": 2}
    savings_map = {"low": 0, "medium": 1, "high": 2}
    freq_map = {"rarely": 0, "sometimes": 1, "often": 2}
    
    worker_features = {
        "zone_rain_frequency_2yr": 0.15,
        "zone_flood_events_2yr": 1,
        "zone_heat_days_2yr": 10,
        "zone_avg_aqi": 150.0,
        "platforms_count": worker_data.platforms_count,
        "days_per_week": worker_data.days_per_week,
        "shift_timing_encoded": shift_map.get(worker_data.shift_timing.lower(), 0),
        "weekly_income": worker_data.weekly_income,
        "savings_encoded": savings_map.get(worker_data.savings_level.lower(), 1),
        "disruption_frequency_encoded": freq_map.get(worker_data.disruption_frequency.lower(), 1)
    }
    
    ml_result = calculate_risk(worker_features)
    
    new_worker = Worker(
        **worker_data.dict(),
        risk_score=ml_result["risk_score"],
        recommended_plan=ml_result["recommended_plan"]
    )
    
    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)
    
    # Try to find best budget plan
    all_plans = db.query(Plan).all()
    budget_plan = "basic"
    for p in sorted(all_plans, key=lambda x: x.weekly_premium, reverse=True):
        if p.weekly_premium <= worker_data.weekly_budget:
            budget_plan = p.id
            break
            
    return {
        "worker": new_worker,
        "risk_score": ml_result["risk_score"],
        "recommended_plan": ml_result["recommended_plan"],
        "premium_amount": ml_result["premium_amount"],
        "budget_plan": budget_plan
    }


# ── NEW: Frontend-facing endpoints ───────────────────────────────────────────

@router.post("/risk-profile")
def get_risk_profile(req: RiskProfileRequest):
    """Called by Onboarding step 3 to compute the worker's risk profile."""
    base = 40
    if req.city in ["Mumbai", "Chennai", "Kolkata"]:
        base += 20
    if req.hoursPerDay >= 10:
        base += 15
    elif req.hoursPerDay >= 7:
        base += 8
    if req.zone.lower() in ["hsr layout", "koramangala", "btm layout"]:
        base += 12
    score = min(base + random.randint(-5, 5), 97)

    level = "Low" if score < 40 else ("High" if score > 70 else "Moderate")
    plan = "Basic" if score < 40 else ("Premium" if score > 70 else "Standard")

    return {
        "score": score,
        "level": level,
        "recommendedPlan": plan,
        "factors": [
            {"label": req.city, "multiplier": "1.2x", "icon": "map"},
            {"label": f"{req.hoursPerDay} hrs/day", "multiplier": "1.1x", "icon": "clock"},
            {"label": req.platform, "multiplier": "1.0x", "icon": "star"},
        ]
    }


@router.get("/me")
def get_worker_me(request: Request, db: Session = Depends(get_db)):
    """Return the authenticated worker's profile."""
    worker = _worker_from_request(request, db)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    policy = db.query(Policy).filter(Policy.worker_id == worker.id, Policy.status == "active").first()
    plan = db.query(Plan).filter(Plan.id == policy.plan_id).first() if policy else None
    return {
        "id": str(worker.id),
        "name": worker.name,
        "phone": worker.phone,
        "city": worker.city,
        "zone": worker.dark_store_zones[0] if worker.dark_store_zones else None,
        "platform": worker.platforms[0] if worker.platforms else "Zepto",
        "weeklyPremium": plan.weekly_premium if plan else 0,
    }


@router.get("/coverage")
def get_worker_coverage(request: Request, db: Session = Depends(get_db)):
    """Return active policy for this worker in the format the frontend expects."""
    worker = _worker_from_request(request, db)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    policy = db.query(Policy).filter(Policy.worker_id == worker.id, Policy.status == "active").first()
    if not policy:
        raise HTTPException(status_code=404, detail="No active policy")
    plan = db.query(Plan).filter(Plan.id == policy.plan_id).first()
    now = datetime.now(timezone.utc)
    end_date = policy.next_renewal_date
    return {
        "id": str(policy.id),
        "planId": policy.plan_id,
        "name": plan.name if plan else policy.plan_id,
        "startDate": policy.start_date.isoformat(),
        "endDate": end_date.isoformat(),
        "validUntil": end_date.isoformat(),
        "status": "ACTIVE" if policy.status == "active" else "INACTIVE",
        "coveragePercent": 75,
    }


@router.get("/claims")
def get_worker_claims(
    request: Request,
    db: Session = Depends(get_db),
    limit: Optional[int] = None,
    status: Optional[str] = None,
    month: Optional[int] = None,
    search: Optional[str] = None,
):
    """Return claims for the authenticated worker with frontend field names."""
    worker = _worker_from_request(request, db)
    if not worker:
        return []
    q = db.query(Claim).filter(Claim.worker_id == worker.id)
    if status:
        q = q.filter(Claim.status.ilike(f"%{status}%"))
    if month:
        q = q.filter(func.strftime('%m', Claim.created_at) == str(month).zfill(2))
    q = q.order_by(Claim.created_at.desc())
    if limit:
        q = q.limit(limit)
    claims = q.all()

    STATUS_MAP = {
        "approved": "Auto Approved",
        "paid": "Auto Approved",
        "fraud_check_pending": "Processing",
        "manual_review": "Under Review",
        "silent_hold": "Under Review",
        "rejected": "Not Covered",
    }
    TRIGGER_MAP = {
        "rain": "Heavy Rainfall Alert",
        "flood": "Flood Warning",
        "heat": "Extreme Heat Advisory",
        "pollution": "Poor Air Quality",
        "zone_shutdown": "Zone Shutdown",
        "app_outage": "App Service Outage",
    }

    result = []
    for c in claims:
        result.append({
            "id": c.id,
            "triggerName": TRIGGER_MAP.get(c.trigger_type.lower(), c.trigger_type),
            "location": c.zone,
            "amount": c.payout_amount,
            "status": STATUS_MAP.get(c.status, c.status),
            "date": c.created_at.isoformat(),
            "processedIn": f"{c.time_to_payout_seconds}s" if c.time_to_payout_seconds else "42s",
        })
    return result


@router.get("/earnings-history")
def get_earnings_history(request: Request, db: Session = Depends(get_db)):
    """Return weekly earnings vs protected amounts for the area chart."""
    worker = _worker_from_request(request, db)
    if not worker:
        return []
    # Build last-6-week history based on real claims if they exist
    claims = db.query(Claim).filter(
        Claim.worker_id == worker.id,
        Claim.status.in_(["approved", "paid"])
    ).all()
    
    today = datetime.now(timezone.utc).date()
    weeks = []
    for i in range(5, -1, -1):
        week_start = today - timedelta(weeks=i)
        label = week_start.strftime("W%W")
        actual = int(worker.weekly_income if worker.weekly_income else 1200)
        protected = sum(
            c.payout_amount for c in claims
            if abs((c.created_at.date() - week_start).days) <= 7
        )
        weeks.append({"date": label, "actualEarnings": actual, "protectedAmount": protected})
    return weeks


@router.get("/payout-history")
def get_payout_history(request: Request, db: Session = Depends(get_db)):
    """Return monthly premiums vs payouts for the composed timeline chart."""
    worker = _worker_from_request(request, db)
    if not worker:
        return []
    policy = db.query(Policy).filter(Policy.worker_id == worker.id, Policy.status == "active").first()
    plan = db.query(Plan).filter(Plan.id == policy.plan_id).first() if policy else None
    monthly_premium = (plan.weekly_premium * 4) if plan else 0

    claims = db.query(Claim).filter(
        Claim.worker_id == worker.id,
        Claim.status.in_(["approved", "paid"])
    ).all()

    today = datetime.now(timezone.utc).date()
    months = []
    MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    for i in range(5, -1, -1):
        from dateutil.relativedelta import relativedelta
        month_date = (today.replace(day=1) - relativedelta(months=i))
        label = MONTH_NAMES[month_date.month - 1]
        payouts = sum(
            c.payout_amount for c in claims
            if c.created_at.year == month_date.year and c.created_at.month == month_date.month
        )
        months.append({"month": label, "premium": monthly_premium, "payouts": payouts})
    return months


@router.get("/dashboard/{worker_id}")
def get_dashboard(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    policy = db.query(Policy).filter(Policy.worker_id == worker_id, Policy.status == "active").first()
    plan = db.query(Plan).filter(Plan.id == policy.plan_id).first() if policy else None
    
    recent_claims = db.query(Claim).filter(Claim.worker_id == worker_id).order_by(Claim.created_at.desc()).limit(5).all()
    active_shift = db.query(Shift).filter(Shift.worker_id == worker_id, Shift.status == "active").first()

    # --- MOCK DATA INJECTION FOR DEMO ---
    # If no claims exist, we inject 3 realistic mock claims to "wow" the user
    mock_claims = []
    if not recent_claims:
        mock_claims = [
            {
                "id": "clm_8x2j9",
                "trigger_type": "Rain",
                "zone": worker.dark_store_zones[0] if worker.dark_store_zones else "HSR Layout",
                "payout_amount": 340,
                "status": "paid",
                "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
            },
            {
                "id": "clm_4y1k2",
                "trigger_type": "Heat",
                "zone": worker.dark_store_zones[0] if worker.dark_store_zones else "HSR Layout",
                "payout_amount": 120,
                "status": "fraud_check_pending",
                "created_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat()
            },
            {
                "id": "clm_z3n7v",
                "trigger_type": "App Outage",
                "zone": "System-wide",
                "payout_amount": 250,
                "status": "paid",
                "created_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
            }
        ]
    else:
        mock_claims = [
            {
                "id": c.id,
                "trigger_type": c.trigger_type,
                "zone": c.zone,
                "payout_amount": c.payout_amount,
                "status": c.status,
                "created_at": c.created_at.isoformat()
            } for c in recent_claims
        ]

    total_payouts_real = sum(c.payout_amount for c in recent_claims if c.status == "paid")
    total_payouts_mock = sum(c["payout_amount"] for c in mock_claims if c["status"] == "paid")
    total_payouts = total_payouts_real if recent_claims else total_payouts_mock
    
    return {
        "worker_name": worker.name,
        "risk_score": worker.risk_score or 65,
        "recommended_plan": worker.recommended_plan or "Standard",
        "active_plan": plan.name if plan else None,
        "plan_id": plan.id if plan else None,
        "policy_status": policy.status if policy else "none",
        "next_renewal": policy.next_renewal_date.isoformat() if policy else (datetime.now(timezone.utc) + timedelta(days=4)).isoformat(),
        "surge_active": policy.surge_active if policy else False,
        "surge_multiplier": policy.surge_multiplier if policy else 1.0,
        "surge_reason": policy.surge_reason if policy else None,
        "triggers_covered": plan.triggers_covered if plan else ["Rain", "Heat", "App Outage"],
        "weekly_premium": plan.weekly_premium if plan else 89,
        "max_payout_per_week": plan.max_payout_per_week if plan else 700,
        "recent_claims": mock_claims,
        "total_payouts_received": total_payouts,
        "active_shift_zone": active_shift.dark_store_zone if active_shift else None,
        "platforms": worker.platforms,
        "city": worker.city,
        "weekly_income": worker.weekly_income or 4200,
    }
