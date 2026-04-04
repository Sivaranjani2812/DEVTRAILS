from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.db import get_db
from app.models import Shift, Worker
from app.schemas import ShiftCheckIn, ShiftCheckOut, ShiftResponse

router = APIRouter(prefix="/shifts", tags=["shifts"])

@router.post("/checkin", response_model=ShiftResponse)
def checkin(req: ShiftCheckIn, db: Session = Depends(get_db)):
    # End any existing active shifts
    existing = db.query(Shift).filter(Shift.worker_id == req.worker_id, Shift.status == "active").all()
    for s in existing:
        s.status = "completed"
        s.checkout_time = datetime.now(timezone.utc)
        
    shift = Shift(
        worker_id=req.worker_id,
        dark_store_zone=req.dark_store_zone,
        checkin_time=datetime.now(timezone.utc),
        status="active",
        device_fingerprint=req.device_fingerprint
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift

@router.post("/checkout")
def checkout(req: ShiftCheckOut, db: Session = Depends(get_db)):
    shift = db.query(Shift).filter(Shift.worker_id == req.worker_id, Shift.status == "active").first()
    if not shift:
        raise HTTPException(status_code=404, detail="No active shift found")
    shift.status = "completed"
    shift.checkout_time = datetime.now(timezone.utc)
    db.commit()
    return {"status": "checkout_successful"}

@router.get("/active/{worker_id}")
def get_active_shift(worker_id: int, db: Session = Depends(get_db)):
    shift = db.query(Shift).filter(Shift.worker_id == worker_id, Shift.status == "active").first()
    if not shift:
        return None
    return shift
