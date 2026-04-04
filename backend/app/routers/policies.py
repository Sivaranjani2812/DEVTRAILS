from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.db import get_db
from app.models import Policy, Plan
from app.schemas import PolicyCreate, PolicyResponse

router = APIRouter(prefix="/policies", tags=["policies"])

@router.post("/subscribe", response_model=PolicyResponse)
def subscribe(req: PolicyCreate, db: Session = Depends(get_db)):
    # Calculate next Sunday midnight
    now = datetime.now(timezone.utc)
    days_until_sunday = (6 - now.weekday()) % 7
    if days_until_sunday == 0:
        days_until_sunday = 7 # Next week's Sunday if today is Sunday
    next_renewal = (now + timedelta(days=days_until_sunday)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    policy = Policy(
        worker_id=req.worker_id,
        plan_id=req.plan_id,
        status="active",
        start_date=now,
        next_renewal_date=next_renewal
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@router.put("/pause")
def pause_policy(worker_id: int, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.worker_id == worker_id, Policy.status == "active").first()
    if not policy:
        raise HTTPException(status_code=404, detail="Active policy not found")
    policy.status = "paused"
    db.commit()
    return {"status": "paused"}

@router.put("/upgrade")
def upgrade_policy(worker_id: int, new_plan_id: str, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.worker_id == worker_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    policy.plan_id = new_plan_id
    db.commit()
    return {"status": "upgraded", "new_plan_id": new_plan_id}
